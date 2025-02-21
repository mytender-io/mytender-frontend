import React, { useContext, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BidContext } from "../views/BidWritingStateManagerView";
import { faEdit, faEye, faUsers } from "@fortawesome/free-solid-svg-icons";
import { useAuthUser } from "react-auth-kit";
import BidTitle from "../components/BidTitle";
import GenerateProposalModal from "../modals/GenerateProposalModal";
import SaveStatus from "@/components/SaveStatus";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import PlusIcon from "@/components/icons/PlusIcon";

const BidNavbar: React.FC<{
  showViewOnlyMessage: () => void;
  initialBidName: string;
  description?: string;
  outline?: string[];
  object_id?: string | null;
  handleRegenerateClick?: () => void;
}> = ({
  showViewOnlyMessage,
  initialBidName,
  description,
  outline,
  object_id,
  handleRegenerateClick
}) => {
  const { sharedState, setSharedState } = useContext(BidContext);
  const { isLoading, saveSuccess, bidInfo } = sharedState;

  const getAuth = useAuthUser();
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { contributors } = sharedState;
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("lastActiveTab") || "/bid-extractor";
  });

  const [currentUserPermission, setCurrentUserPermission] = useState("viewer");

  useEffect(() => {
    const authData = getAuth();
    setAuth(authData);
  }, [getAuth]);

  useEffect(() => {
    if (location.pathname !== "/question-crafter") {
      // Update active tab based on current location
      setActiveTab(location.pathname);
      localStorage.setItem("lastActiveTab", location.pathname);
    }

    // Update user permission when bidInfo and auth changes
    if (auth && auth.email) {
      const permission = contributors[auth.email] || "viewer";
      setCurrentUserPermission(permission);
      console.log("currentUserpermissionnav", permission);
    }
  }, [location, bidInfo, auth]);

  useEffect(() => {
    if (auth) {
      console.log("auth", auth);
    }
  }, [auth]);

  const getPermissionDetails = (permission) => {
    switch (permission) {
      case "admin":
        return {
          icon: faUsers,
          text: "Admin",
          description: "You have full access to edit and manage this proposal."
        };
      case "editor":
        return {
          icon: faEdit,
          text: "Editor",
          description:
            "You can edit this proposal but cannot change permissions."
        };
      default:
        return {
          icon: faEye,
          text: "Viewer",
          description: "You can view this proposal but cannot make changes."
        };
    }
  };

  const permissionDetails = getPermissionDetails(currentUserPermission);

  const handleBackClick = () => {
    if (location.pathname == "/question-crafter") {
      navigate("/proposal-planner");
    } else {
      navigate("/bids");
    }
  };

  const handleTabClick = (path) => {
    // Don't set active tab immediately to avoid visual conflict with animation
    const currentTab = location.pathname;

    // Delay navigation to allow animation to play
    setTimeout(() => {
      setActiveTab(path);
      navigate(path);
    }, 300); // 300ms matches our CSS transition time
  };

  console.log(initialBidName);

  const baseNavLinkStyles =
    "mr-6 text-base font-semibold text-gray-hint_text px-3 py-2.5 cursor-pointer transition-all duration-300 ease-in-out relative hover:text-orange-500 after:content-[''] after:absolute after:bottom-[-0.3rem] after:left-0 after:w-0 after:h-[0.143rem] after:bg-orange-500 after:transition-[width] after:duration-300 after:ease-in-out hover:after:w-full";
  const activeNavLinkStyles = "text-orange-500 after:w-full";

  return (
    <div>
      <div className="space-y-2">
        <BidTitle
          canUserEdit={true}
          showViewOnlyMessage={showViewOnlyMessage}
          initialBidName={initialBidName}
        />
        <span className="block text-base text-gray-hint_text">
          {description}
        </span>
      </div>

      <div>
        <div className="flex justify-between items-center border-b border-gray-line">
          <div className="flex items-center mt-3 mb-1">
            <NavLink
              to="/bid-extractor"
              className={({ isActive }) =>
                cn(baseNavLinkStyles, isActive && activeNavLinkStyles)
              }
              onClick={() => handleTabClick("/bid-extractor")}
            >
              Tender Insights
            </NavLink>
            <NavLink
              to="/bid-intel"
              className={({ isActive }) =>
                cn(baseNavLinkStyles, isActive && activeNavLinkStyles)
              }
              onClick={() => handleTabClick("/bid-intel")}
            >
              Bid Inputs
            </NavLink>
            <NavLink
              to="/proposal-planner"
              className={({ isActive }) =>
                cn(
                  baseNavLinkStyles,
                  (isActive || activeTab === "/question-crafter") &&
                    activeNavLinkStyles
                )
              }
              onClick={() => handleTabClick("/proposal-planner")}
            >
              Bid Outline
            </NavLink>
            <NavLink
              to="/proposal-preview"
              className={({ isActive }) =>
                cn(baseNavLinkStyles, isActive && activeNavLinkStyles)
              }
              onClick={() => handleTabClick("/proposal-preview")}
            >
              Bid Review
            </NavLink>
            <SaveStatus
              isLoading={sharedState.isLoading}
              saveSuccess={sharedState.saveSuccess}
            />
          </div>
          {outline && outline.length > 0 ? (
            <div className="flex items-center flex-shrink-0 gap-2">
              <Button variant="outline" onClick={handleRegenerateClick}>
                <PlusIcon />
                New Outline
              </Button>
              <GenerateProposalModal bid_id={object_id} outline={outline} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BidNavbar;
