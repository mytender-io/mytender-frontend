import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import axios from "axios";
import withAuth from "../routes/withAuth";
import { useAuthUser } from "react-auth-kit";
import SideBarSmall from "../routes/SidebarSmall.tsx";
import { useLocation } from "react-router-dom";
import { Col, Row } from "react-bootstrap";
import BidNavbar from "../routes/BidNavbar.tsx";
import "./BidPlanner.css";
import { BidContext } from "./BidWritingStateManagerView.tsx";
import { displayAlert } from "../helper/Alert";
import TenderLibrary from "../components/TenderLibrary.tsx";
import TenderAnalysis from "../components/TenderAnalysis.tsx";
import { ChevronDown, X } from "lucide-react";
import BreadcrumbNavigation from "../routes/BreadCrumbNavigation.tsx";
import theme from "@/components/ui/theme.tsx";
import { ThemeProvider } from "@mui/material/styles";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton
} from "@mui/material";

const BidPlanner = () => {
  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  const tokenRef = useRef(auth?.token || "default");

  const { sharedState, setSharedState } = useContext(BidContext);
  const { bidInfo, contributors, object_id } = sharedState;

  const location = useLocation();
  const bidData = location.state?.bid || "";
  const initialBidName = location.state?.bid.bid_title || sharedState.bidInfo;

  console.log(location.state?.bid);

  const [loading, setLoading] = useState(false);
  const [existingBidNames, setExistingBidNames] = useState([]);
  const [organizationUsers, setOrganizationUsers] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLibraryVisible, setIsLibraryVisible] = useState(false);

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const handleOpenLibrary = () => setIsLibraryOpen(true);
  const handleCloseLibrary = () => setIsLibraryOpen(false);

  const toggleLibrary = () => {
    setIsLibraryVisible(!isLibraryVisible);
  };

  const currentUserPermission = contributors[auth.email] || "viewer";
  const canUserEdit =
    currentUserPermission === "admin" || currentUserPermission === "editor";

  const showViewOnlyMessage = () => {
    displayAlert("You only have permission to view this bid.", "danger");
  };

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

  useEffect(() => {
    const navigatedFromBidsTable = localStorage.getItem(
      "navigatedFromBidsTable"
    );

    if (
      navigatedFromBidsTable === "true" &&
      location.state?.fromBidsTable &&
      bidData
    ) {
      setSharedState((prevState) => {
        const original_creator = bidData?.original_creator || auth.email;
        let contributors = bidData?.contributors || {};

        if (
          !bidData?.original_creator ||
          Object.keys(contributors).length === 0
        ) {
          contributors = { [auth.email]: "admin" };
        }

        return {
          ...prevState,
          bidInfo: bidData?.bid_title || "",
          opportunity_information:
            bidData?.opportunity_information?.trim() || "",
          compliance_requirements:
            bidData?.compliance_requirements?.trim() || "",
          tender_summary: bidData?.tender_summary?.trim() || "",
          evaluation_criteria: bidData?.evaluation_criteria?.trim() || "",
          derive_insights: bidData?.derive_insights?.trim() || "",
          differentiation_opportunities:
            bidData?.differentiation_opportunities?.trim() || "",
          client_name: bidData?.client_name || "",
          bid_qualification_result: bidData?.bid_qualification_result || "",
          questions: bidData?.questions || "",
          opportunity_owner: bidData?.opportunity_owner || "",
          submission_deadline: bidData?.submission_deadline || "",
          bid_manager: bidData?.bid_manager || "",
          contributors: contributors,
          original_creator: original_creator,
          object_id: bidData?._id || "",
          outline: bidData?.outline || []
        };
      });

      localStorage.setItem("navigatedFromBidsTable", "false");
    } else if (initialBidName && initialBidName !== "") {
      setSharedState((prevState) => ({
        ...prevState,
        bidInfo: initialBidName,
        original_creator: auth.email,
        contributors: auth.email ? { [auth.email]: "admin" } : {}
      }));
    }
    const updatedBid = { bidData };
    window.dispatchEvent(new CustomEvent("bidUpdated", { detail: updatedBid }));
  }, []);

  const parentPages = [{ name: "Tender Dashboard", path: "/bids" }];

  console.log(initialBidName);

  return (
    <div className="chatpage">
      <SideBarSmall onCollapseChange={setSidebarCollapsed} />
      <div className="bidplanner-container">
        <div
          className={`header-container ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
        >
          <BreadcrumbNavigation
            currentPage={initialBidName}
            parentPages={parentPages}
            showHome={true}
          />
        </div>

        <div>
          <div
            className={`lib-container mt-1 ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
          >
            <div>
              <div>
                <BidNavbar
                  showViewOnlyMessage={showViewOnlyMessage}
                  initialBidName={initialBidName}
                  sidebarCollapsed={sidebarCollapsed}
                />
              </div>

              {/* Library Button */}
              <button
                onClick={handleOpenLibrary}
                className="w-full mt-5 py-3 px-4 flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <ChevronDown size={20} className="text-gray-600" />
                  <span className="text-gray-800 text-lg font-medium">
                    View Tender Library Documents
                  </span>
                </div>
              </button>

              {/* Library Modal */}
              <Dialog
                open={isLibraryOpen}
                onClose={handleCloseLibrary}
                maxWidth="lg"
                fullWidth
                sx={{
                  "& .MuiDialog-paper": {
                    minHeight: "80vh"
                  }
                }}
              >
                <DialogTitle
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #E5E7EB",
                    py: 2
                  }}
                >
                  <h1>Tender Upload</h1>
                  <IconButton onClick={handleCloseLibrary} size="small">
                    <X size={20} />
                  </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                  <TenderLibrary key={object_id} object_id={object_id} />
                </DialogContent>
              </Dialog>

              <div>
                <Row>
                  <Col md={12}>
                    <ThemeProvider theme={theme}>
                      <TenderAnalysis canUserEdit={canUserEdit} />
                    </ThemeProvider>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(BidPlanner);
