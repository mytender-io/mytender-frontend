import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuthUser } from "react-auth-kit";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants.tsx";
import axios from "axios";
import withAuth from "../../routes/withAuth.tsx";
import BidNavbar from "@/components/BidNavbar";
import { BidContext } from "../BidWritingStateManagerView.tsx";
import TenderLibrary from "../../components/TenderLibrary.tsx";
import TenderAnalysis from "./components/TenderAnalysis.tsx";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation.tsx";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ExpandIcon from "@/components/icons/ExpandIcon.tsx";
import { toast } from "react-toastify";

const BidPlanner = () => {
  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  const tokenRef = useRef(auth?.token || "default");

  const { sharedState, setSharedState } = useContext(BidContext);
  const { bidInfo, contributors, object_id } = sharedState;

  const location = useLocation();
  const bidData = location.state?.bid || null;

  const initialBidName = sharedState.bidInfo;

  const [loading, setLoading] = useState(false);
  const [existingBidNames, setExistingBidNames] = useState([]);
  const [organizationUsers, setOrganizationUsers] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const handleOpenLibrary = () => setIsLibraryOpen(true);

  const currentUserPermission = contributors[auth.email] || "viewer";
  const canUserEdit =
    currentUserPermission === "admin" || currentUserPermission === "editor";

  const showViewOnlyMessage = () => {
    toast.error("You only have permission to view this bid.");
  };

  useEffect(() => {
    if (bidData) {
      console.log(bidData);
      console.log(bidData);
      setSharedState((prevState) => {
        // Filter out single-character entries from selectedFolders

        let selectedFolders = Array.isArray(bidData?.selectedFolders)
          ? bidData.selectedFolders
          : ["default"];
        selectedFolders = selectedFolders.filter(
          (folder) => folder?.length > 1
        );
        if (selectedFolders.length === 0) {
          selectedFolders = ["default"];
        }

        return {
          ...prevState,
          bidInfo: bidData?.bid_title || "",
          opportunity_information:
            bidData?.opportunity_information?.trim() || "",
          compliance_requirements:
            bidData?.compliance_requirements?.trim() || "",
          tender_summary: bidData?.tender_summary || "",
          evaluation_criteria: bidData?.evaluation_criteria || "",
          derive_insights: bidData?.derive_insights || "",
          differentiation_opportunities:
            bidData?.differentiation_opportunities || "",
          questions: bidData?.questions || "",
          value: bidData?.value || "",
          client_name: bidData?.client_name || "",
          bid_qualification_result: bidData?.bid_qualification_result || "",
          opportunity_owner: bidData?.opportunity_owner || "",
          submission_deadline: bidData?.submission_deadline || "",
          bid_manager: bidData?.bid_manager || "",
          contributors: bidData?.contributors || "",
          original_creator: bidData?.original_creator || "",
          object_id: bidData?._id || "",
          selectedFolders: selectedFolders,
          lastUpdated: bidData?.lastUpdated || 0,
          outline: bidData?.outline || [],
          win_themes: bidData?.win_themes || [],
          customer_pain_points: bidData?.customer_pain_points || [],
          differentiating_factors: bidData?.differentiating_factors || []
        };
      });
      console.log("bid planner");
      console.log(bidData?.selectedFolders);
      localStorage.setItem("navigatedFromBidsTable", "false");
    }
  }, []);

  const fetchOrganizationUsers = async () => {
    try {
      const response = await axios.get(
        `http${HTTP_PREFIX}://${API_URL}/organization_users`,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      setOrganizationUsers(response.data);
    } catch (err) {
      console.log("Error fetching organization users:");
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `http${HTTP_PREFIX}://${API_URL}/profile`,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      setCurrentUserEmail(response.data.email);
    } catch (err) {
      console.log("Failed to load profile data");
      setLoading(false);
    }
  };

  const fetchExistingBidNames = async () => {
    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/get_bids_list/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      if (response.data && response.data.bids) {
        setExistingBidNames(response.data.bids.map((bid) => bid.bid_title));
      }
    } catch (error) {
      console.error("Error fetching bid names:", error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([
        fetchUserData(),
        fetchOrganizationUsers(),
        fetchExistingBidNames()
      ]);
    };
    fetchInitialData();
  }, []);

  const parentPages = [{ name: "Tender Dashboard", path: "/bids" }];

  console.log(initialBidName);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between w-full border-b border-typo-200 px-6 py-2 min-h-[3.43785rem]">
        <BreadcrumbNavigation
          currentPage={initialBidName}
          parentPages={parentPages}
          showHome={true}
        />
      </div>
      <div className="px-6 pt-4 flex-1">
        <div className="flex flex-col space-y-4 h-full">
          <BidNavbar
            showViewOnlyMessage={showViewOnlyMessage}
            initialBidName={initialBidName}
            description="Explore insights and retrieve info from the tender docs uploaded to
          peel back the layers of what the customer is asking for."
          />
          <Button
            onClick={handleOpenLibrary}
            variant="outline"
            className="w-full justify-start border-gray-spacer_light"
          >
            <div className="flex items-center space-x-3">
              <ExpandIcon className="text-gray" />
              <span className="text-gray-hint_text font-medium">
                View Tender Library Documents
              </span>
            </div>
          </Button>

          {/* Library Modal */}
          <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
            <DialogContent className="max-w-5xl p-2">
              <DialogTitle className="p-4">Tender Upload</DialogTitle>
              <TenderLibrary key={object_id} object_id={object_id} />
            </DialogContent>
          </Dialog>

          <div className="max-w-6xl mx-auto w-full flex-1">
            <TenderAnalysis canUserEdit={canUserEdit} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(BidPlanner);
