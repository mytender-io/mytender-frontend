import { useContext, useMemo, useState } from "react";
import { useAuthUser } from "react-auth-kit";
// import { API_URL, HTTP_PREFIX } from "../../helper/Constants";
// import axios from "axios";
import withAuth from "../../routes/withAuth";
import { BidContext } from "../BidWritingStateManagerView";
import TenderLibrary from "../../components/TenderLibrary";
import TenderAnalysis from "./components/TenderAnalysis";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ExpandIcon from "@/components/icons/ExpandIcon";

const BidPlanner = () => {
  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  // const tokenRef = useRef(auth?.token || "default");

  const { sharedState } = useContext(BidContext);
  const { contributors, object_id } = sharedState;

  // const [loading, setLoading] = useState(false);
  // const [existingBidNames, setExistingBidNames] = useState([]);
  // const [organizationUsers, setOrganizationUsers] = useState([]);
  // const [currentUserEmail, setCurrentUserEmail] = useState("");

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const handleOpenLibrary = () => setIsLibraryOpen(true);

  const currentUserPermission = contributors[auth?.email] || "viewer";

  const canUserEdit =
    currentUserPermission === "admin" || currentUserPermission === "editor";

  // const fetchOrganizationUsers = async () => {
  //   try {
  //     const response = await axios.get(
  //       `http${HTTP_PREFIX}://${API_URL}/organization_users`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${tokenRef.current}`
  //         }
  //       }
  //     );
  //     setOrganizationUsers(response.data);
  //   } catch (err) {
  //     console.log("Error fetching organization users:");
  //   }
  // };

  // const fetchUserData = async () => {
  //   try {
  //     const response = await axios.get(
  //       `http${HTTP_PREFIX}://${API_URL}/profile`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${tokenRef.current}`
  //         }
  //       }
  //     );
  //     setCurrentUserEmail(response.data.email);
  //   } catch (err) {
  //     console.log("Failed to load profile data");
  //     setLoading(false);
  //   }
  // };

  // const fetchExistingBidNames = async () => {
  //   try {
  //     const response = await axios.post(
  //       `http${HTTP_PREFIX}://${API_URL}/get_bids_list/`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${tokenRef.current}`
  //         }
  //       }
  //     );
  //     if (response.data && response.data.bids) {
  //       setExistingBidNames(response.data.bids.map((bid) => bid.bid_title));
  //     }
  //   } catch (error) {
  //     console.error("Error fetching bid names:", error);
  //   }
  // };

  // useEffect(() => {
  //   const fetchInitialData = async () => {
  //     await Promise.all([
  //       fetchUserData(),
  //       fetchOrganizationUsers(),
  //       fetchExistingBidNames()
  //     ]);
  //   };
  //   fetchInitialData();
  // }, []);

  return (
    <>
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
    </>
  );
};

export default withAuth(BidPlanner);
