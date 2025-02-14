import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants.tsx";
import axios from "axios";
import withAuth from "../../routes/withAuth.tsx";
import { useAuthUser } from "react-auth-kit";
import { useLocation } from "react-router-dom";
import BidNavbar from "../../routes/BidNavbar.tsx";
import { BidContext } from "../BidWritingStateManagerView.tsx";
import { Check, Pencil, Search, X } from "lucide-react";
import BreadcrumbNavigation from "../../layout/BreadCrumbNavigation.tsx";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    toast.error("You only have permission to view this bid.");
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
    toast.success("Item deleted successfully");
  };

  const handleSaveEdit = () => {
    if (editingState.text.trim() === "") {
      toast.error("Please enter valid text");
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
    toast.success("Item updated successfully");
  };

  const handleCancelEdit = () => {
    setEditingState({ type: "", index: -1, text: "" });
  };

  const CardItem = ({ text, index, type }) => {
    const isEditing =
      editingState.type === type && editingState.index === index;

    return (
      <div className="flex items-center justify-between border-b py-2 px-4 border-gray-200 last:border-b-0">
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={editingState.text}
              onChange={(e) =>
                setEditingState((prev) => ({ ...prev, text: e.target.value }))
              }
              className="flex-1"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-green-100 hover:text-green-600 w-6 h-6"
              onClick={handleSaveEdit}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-red-100 hover:text-red-600 w-6 h-6"
              onClick={handleCancelEdit}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <span className="text-sm text-gray-hint_text">
              {index + 1}. {text}
            </span>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-orange-100 hover:text-orange w-6 h-6"
                onClick={() => handleEditStart(text, type, index)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-red-100 hover:text-red-600 w-6 h-6"
                onClick={() => handleDelete(type, index)}
              >
                <X className="w-4 h-4" />
              </Button>
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
    <div>
      <div className="flex items-center justify-between w-full border-b border-typo-200 px-6 py-2 min-h-[55px]">
        <BreadcrumbNavigation
          currentPage={initialBidName}
          parentPages={parentPages}
          showHome={true}
        />
      </div>
      <div className="px-6 py-4 overflow-y-auto h-[calc(100vh-89px)]">
        <div className="space-y-4">
          <BidNavbar
            showViewOnlyMessage={showViewOnlyMessage}
            initialBidName="Bid Inputs"
            description="Review and refine the AI-suggested inputs from the tender documents to configure your response strategy."
          />
          <div className="grid grid-cols-2 gap-6">
            {/* Customer Pain Points Card */}
            <div className="bg-white rounded-lg shadow w-full h-full">
              <span className="font-medium px-4 py-3 bg-gray-100 rounded-t-lg border-b w-full block text-gray-hint_text">
                Customer Pain Points
              </span>
              <div className="h-64 overflow-y-auto space-y-2">
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
                    Click on the Pain Points button in the Bid Planner page to
                    generate pain points.
                  </p>
                )}
              </div>
            </div>

            {/* Win Themes Card */}
            <div className="bg-white rounded-lg shadow w-full h-full">
              <span className="font-medium px-4 py-3 bg-gray-100 rounded-t-lg border-b w-full block text-gray-hint_text">
                Win themes:
              </span>
              <div className="h-64 overflow-y-auto space-y-2">
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
                    Click on the Win Themes button in the Bid Planner page to
                    generate win themes.
                  </p>
                )}
              </div>
            </div>

            {/* Differentiating Factors Card */}
            <div className="bg-white rounded-lg shadow w-full h-full">
              <span className="font-medium px-4 py-3 bg-gray-100 rounded-t-lg border-b w-full block text-gray-hint_text">
                Differentiating Factors
              </span>
              <div className="h-64 overflow-y-auto space-y-2">
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
                  <p className="text-gray-500 text-center py-6">
                    Click on the Differentation Opportunities button in the Bid
                    Planner page to generate differentation opportunities.
                  </p>
                )}
              </div>
            </div>

            {/* Keep existing Case Study Card */}
            <div className="bg-white rounded-lg shadow w-full h-full">
              <span className="font-medium px-4 py-3 bg-gray-100 rounded-t-lg border-b w-full block text-gray-hint_text">
                Add Relevant Case Study
              </span>
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for case study..."
                    className="pl-10"
                    disabled
                  />
                </div>
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <p className="text-lg text-gray-400 font-medium">
                    Coming Soon
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Case study search functionality will be available in future
                    updates
                  </p>
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
