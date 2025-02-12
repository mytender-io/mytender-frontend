import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { API_URL, HTTP_PREFIX } from "../helper/Constants.tsx";
import axios from "axios";
import withAuth from "../routes/withAuth.tsx";
import { useAuthUser } from "react-auth-kit";
import SideBarSmall from "../routes/SidebarSmall.tsx";
import { useLocation } from "react-router-dom";
import BidNavbar from "../routes/BidNavbar.tsx";
import { BidContext } from "./BidWritingStateManagerView.tsx";
import { displayAlert } from "../helper/Alert.tsx";
import {
  Check,
  ChevronDown,
  Fullscreen,
  Pencil,
  Search,
  X
} from "lucide-react";
import BreadcrumbNavigation from "../layout/BreadCrumbNavigation.tsx";

const BidIntel = () => {
  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  const tokenRef = useRef(auth?.token || "default");

  const { sharedState, setSharedState } = useContext(BidContext);
  const { bidInfo, contributors, object_id } = sharedState;

  const location = useLocation();
  const bidData = location.state?.bid || "";
  const initialBidName = location.state?.bid.bid_title || sharedState.bidInfo;

  const [loading, setLoading] = useState(false);
  const [existingBidNames, setExistingBidNames] = useState([]);
  const [organizationUsers, setOrganizationUsers] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // State for inline editing
  const [editingState, setEditingState] = useState({
    type: "",
    index: -1,
    text: ""
  });

  // Process the shared state data for display
  const items = {
    painPoints: sharedState.customer_pain_points || [],
    winThemes: sharedState.win_themes || [],
    factors: sharedState.differentiating_factors || []
  };

  const currentUserPermission = contributors[auth.email] || "viewer";
  const canUserEdit =
    currentUserPermission === "admin" || currentUserPermission === "editor";

  const showViewOnlyMessage = () => {
    displayAlert("You only have permission to view this bid.", "danger");
  };

  const handleEditStart = (text: string, type: string, index: number) => {
    if (!canUserEdit) {
      showViewOnlyMessage();
      return;
    }
    setEditingState({ type, index, text });
  };

  const handleDelete = (type: string, index: number) => {
    if (!canUserEdit) {
      showViewOnlyMessage();
      return;
    }

    const updatedState = { ...sharedState };

    switch (type) {
      case "painPoints":
        updatedState.customer_pain_points =
          updatedState.customer_pain_points.filter((_, i) => i !== index);
        break;
      case "winThemes":
        updatedState.win_themes = updatedState.win_themes.filter(
          (_, i) => i !== index
        );
        break;
      case "factors":
        updatedState.differentiating_factors =
          updatedState.differentiating_factors.filter((_, i) => i !== index);
        break;
    }

    setSharedState(updatedState);
    displayAlert("Item deleted successfully", "success");
  };

  const handleSaveEdit = () => {
    if (editingState.text.trim() === "") {
      displayAlert("Please enter valid text", "danger");
      return;
    }

    const updatedState = { ...sharedState };

    switch (editingState.type) {
      case "painPoints":
        updatedState.customer_pain_points[editingState.index] =
          editingState.text;
        break;
      case "winThemes":
        updatedState.win_themes[editingState.index] = editingState.text;
        break;
      case "factors":
        updatedState.differentiating_factors[editingState.index] =
          editingState.text;
        break;
    }

    setSharedState(updatedState);
    setEditingState({ type: "", index: -1, text: "" });
    displayAlert("Item updated successfully", "success");
  };

  const handleCancelEdit = () => {
    setEditingState({ type: "", index: -1, text: "" });
  };

  const CardItem = ({ text, index, type }) => {
    const isEditing =
      editingState.type === type && editingState.index === index;

    return (
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={editingState.text}
              onChange={(e) =>
                setEditingState((prev) => ({ ...prev, text: e.target.value }))
              }
              className="flex-1 p-1 border border-gray-300 rounded text-base text-black bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button
              className="p-1.5 hover:bg-green-50 rounded"
              onClick={handleSaveEdit}
            >
              <Check className="w-5 h-5 text-green-600" />
            </button>
            <button
              className="p-1.5 hover:bg-red-50 rounded"
              onClick={handleCancelEdit}
            >
              <X className="w-5 h-5 text-red-500" />
            </button>
          </div>
        ) : (
          <>
            <span className="text-base text-gray-700">
              {index + 1}. {text}
            </span>
            <div className="flex gap-2">
              <button
                className="p-1.5 hover:bg-gray-100 rounded"
                onClick={() => handleEditStart(text, type, index)}
              >
                <Pencil className="w-5 h-5 text-gray-500" />
              </button>
              <button
                className="p-1.5 hover:bg-gray-100 rounded"
                onClick={() => handleDelete(type, index)}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };
  // API calls
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
              <div className="cards mt-4">
                <h2 className="text-2xl font-semibold mb-4">
                  Create Components
                </h2>
                <p className="text-base text-gray-600 mb-6">
                  Build the foundations that gets generated in the core response
                </p>

                <div className="grid grid-cols-2 gap-6">
                  {/* Customer Pain Points Card */}
                  <div className="bg-white rounded-lg shadow">
                    <h3 className="text-lg font-medium p-4 bg-gray-100 rounded-t-lg border-b">
                      Customer Pain Points
                    </h3>
                    <div className="h-64 overflow-y-auto p-4 space-y-2">
                      {items.painPoints.length > 0 ? (
                        items.painPoints.map((item, index) => (
                          <CardItem
                            key={`pain-${index}`}
                            text={item}
                            index={index}
                            type="painPoints"
                          />
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No pain points added yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Win Themes Card */}
                  <div className="bg-white rounded-lg shadow">
                    <h3 className="text-lg font-medium p-4 bg-gray-100 rounded-t-lg border-b">
                      Win themes:
                    </h3>
                    <div className="h-64 overflow-y-auto p-4 space-y-2">
                      {items.winThemes.length > 0 ? (
                        items.winThemes.map((item, index) => (
                          <CardItem
                            key={`win-${index}`}
                            text={item}
                            index={index}
                            type="winThemes"
                          />
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No win themes added yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Differentiating Factors Card */}
                  <div className="bg-white rounded-lg shadow">
                    <h3 className="text-lg font-medium p-4 bg-gray-100 rounded-t-lg border-b">
                      Differentiating Factors
                    </h3>
                    <div className="h-64 overflow-y-auto p-4 space-y-2">
                      {items.factors.length > 0 ? (
                        items.factors.map((item, index) => (
                          <CardItem
                            key={`factor-${index}`}
                            text={item}
                            index={index}
                            type="factors"
                          />
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No differentiating factors added yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Keep existing Case Study Card */}
                  <div className="bg-white rounded-lg shadow">
                    <h3 className="text-lg font-medium p-4 bg-gray-100 rounded-t-lg border-b">
                      Add Relevant Case Study
                    </h3>
                    <div className="p-4">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search for case study..."
                          className="w-full p-3 ps-5 text-base border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-400"
                          disabled
                        />
                      </div>
                      <div className="flex flex-col items-center justify-center h-48 text-center">
                        <p className="text-lg text-gray-400 font-medium">
                          Coming Soon
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Case study search functionality will be available in
                          future updates
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(BidIntel);
