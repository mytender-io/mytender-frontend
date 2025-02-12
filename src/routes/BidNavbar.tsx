import React, { useContext, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button, Spinner } from "react-bootstrap";
import { BidContext } from "../views/BidWritingStateManagerView";
import {
  faArrowLeft,
  faEdit,
  faEye,
  faPlus,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import "./BidNavbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuthUser } from "react-auth-kit";
import BidTitle from "../components/BidTitle";
import { displayAlert } from "../helper/Alert";
import GenerateProposalModal from "../modals/GenerateProposalModal";
import SaveStatus from "@/components/SaveStatus";

const BidNavbar = ({
  showViewOnlyMessage = () => {},
  initialBidName = "",
  outline = [], // default value
  sidebarCollapse = false,
  object_id = null,
  handleRegenerateClick = () => {}
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
  return (
    <div>
      <div>
        <BidTitle
          canUserEdit={true}
          displayAlert={displayAlert}
          setSharedState={setSharedState}
          sharedState={sharedState}
          showViewOnlyMessage={showViewOnlyMessage}
          initialBidName={initialBidName}
        />
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "0.143rem solid #ebecef"
          }}
        >
          <div className="bidnav-section mt-3 mb-1">
            <NavLink
              to="/bid-extractor"
              className={`bidnav-item ${activeTab === "/bid-extractor" ? "active" : ""}`}
              onClick={() => handleTabClick("/bid-extractor")}
            >
              Bid Planner
            </NavLink>
            <NavLink
              to="/bid-intel"
              className={`bidnav-item ${activeTab === "/bid-intek" ? "active" : ""}`}
              onClick={() => handleTabClick("/bid-intel")}
            >
              Bid Intel
            </NavLink>
            <NavLink
              to="/proposal-planner"
              className={`bidnav-item ${activeTab === "/proposal-planner" || activeTab === "/question-crafter" ? "active" : ""}`}
              onClick={() => handleTabClick("/proposal-planner")}
            >
              Proposal Outline
            </NavLink>
            {/* <NavLink
            to="/compliance-matrix"
            className={`bidnav-item ${activeTab === "/compliance-matrix" ? "active" : ""}`}
            onClick={() => handleTabClick("/compliance-matrix")}
          >
            Compliance Matrix
          </NavLink> */}
            <NavLink
              to="/proposal-preview"
              className={`bidnav-item ${activeTab === "/proposal-preview" ? "active" : ""}`}
              onClick={() => handleTabClick("/proposal-preview")}
            >
              Preview Proposal
            </NavLink>

            <SaveStatus
              isLoading={sharedState.isLoading}
              saveSuccess={sharedState.saveSuccess}
            />
          </div>
          {outline.length === 0 ? (
            <div></div>
          ) : (
            <div className="buttons-container">
              <button
                onClick={handleRegenerateClick}
                className="upload-button me-2"
                style={{ minWidth: "fit-content" }}
              >
                <FontAwesomeIcon icon={faPlus} className="pr-2" />
                New Outline
              </button>
              <GenerateProposalModal bid_id={object_id} outline={outline} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidNavbar;
