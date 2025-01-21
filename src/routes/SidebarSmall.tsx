import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./SidebarSmall.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import sidebarIcon from "../resources/images/mytender.io_badge.png";
import {
  faChevronLeft,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";

import {
  faAddressBook as farBookOpen,
  faComments as farComments,
  faCircleQuestion as farCircleQuestion,
  faFileWord as farFileWord,
  faUser as farUser
} from "@fortawesome/free-regular-svg-icons";
import {
  faGears,
  faGraduationCap,
  faLayerGroup,
  faReply,
  faTableColumns
} from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "@mui/material";

interface LastActiveBid {
  _id: string;
  bid_title: string;
  status: string;
  [key: string]: any;
}

interface BidUpdateEvent extends Event {
  detail: LastActiveBid;
}

const SideBarSmall = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [lastActiveBid, setLastActiveBid] = useState<LastActiveBid | null>(
    null
  );
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path: string): boolean => location.pathname === path;

  useEffect(() => {
    const storedBid = localStorage.getItem("lastActiveBid");
    if (storedBid) {
      setLastActiveBid(JSON.parse(storedBid));
    }

    const storedCollapsedState = localStorage.getItem("sidebarCollapsed");
    if (storedCollapsedState) {
      setIsCollapsed(JSON.parse(storedCollapsedState));
    }

    const handleBidUpdate = (event: BidUpdateEvent) => {
      const updatedBid = event.detail;
      setLastActiveBid(updatedBid);
      localStorage.setItem("lastActiveBid", JSON.stringify(updatedBid));
    };

    window.addEventListener("bidUpdated", handleBidUpdate as EventListener);

    return () => {
      window.removeEventListener(
        "bidUpdated",
        handleBidUpdate as EventListener
      );
    };
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
  };

  const handleDashboardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (lastActiveBid) {
      const lastActiveTab =
        localStorage.getItem("lastActiveTab") || "/bid-extractor";
      navigate(lastActiveTab, {
        state: { bid: lastActiveBid, fromBidsTable: true }
      });
    } else {
      navigate("/bids");
    }
  };

  const handleWordAddInClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const url =
      "https://appsource.microsoft.com/en-us/product/office/WA200007690?src=office&corrid=bd0c24c3-6022-e897-73ad-0dc9bdf3558b&omexanonuid=&referralurl=";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`sidebarsmall ${isCollapsed ? "collapsed" : ""}`}>
      <div>
        <div className="sidebar-header">
          {!isCollapsed && <img src={sidebarIcon} alt="mytender.io logo" />}
          {!isCollapsed && <span>mytender.io</span>}
        </div>

        <Tooltip
          title={isCollapsed ? "Expand" : "Collapse"}
          placement="right"
          enterDelay={1000} // 1 second delay before showing
          leaveDelay={0} // No delay when hiding
        >
          <button className="collapse-toggle" onClick={toggleCollapse}>
            <FontAwesomeIcon
              icon={isCollapsed ? faChevronRight : faChevronLeft}
            />
          </button>
        </Tooltip>
        <Link
          to="#"
          className={`sidebarsmalllink ${isActive("/bids") || isActive("/bid-extractor") || isActive("/question-crafter") || isActive("/proposal") ? "sidebarsmalllink-active" : ""}`}
          onClick={handleDashboardClick}
        >
          <FontAwesomeIcon icon={faTableColumns} />
          {!isCollapsed && <span id="bids-table">Tender Dashboard</span>}
        </Link>

        <Link
          to="/library"
          className={`sidebarsmalllink ${isActive("/library") ? "sidebarsmalllink-active" : ""}`}
        >
          <FontAwesomeIcon icon={farBookOpen} />
          {!isCollapsed && <span id="library-title">Content Library</span>}
        </Link>

        {!isCollapsed && <div className="sidebar-section-header">Tool Box</div>}

        <Link
          to="/chatResponse"
          className={`sidebarsmalllink ${isActive("/chatResponse") ? "sidebarsmalllink-active" : ""}`}
        >
          <FontAwesomeIcon icon={farComments} />
          {!isCollapsed && <span id="welcome">Quick Question</span>}
        </Link>

        <Link
          to="/question-answer"
          className={`sidebarsmalllink ${isActive("/question-answer") ? "sidebarsmalllink-active" : ""}`}
        >
          <FontAwesomeIcon icon={faGears} />
          {!isCollapsed && <span>Q&A Generator</span>}
        </Link>

        <Link
          to="#"
          className="sidebarsmalllink"
          onClick={handleWordAddInClick}
        >
          <FontAwesomeIcon icon={farFileWord} />
          {!isCollapsed && <span>Wordpane</span>}
        </Link>

        <Link
          to="https://app.storylane.io/demo/tui6kl0bnkrw?embed=inline"
          className="sidebarsmalllink"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faGraduationCap} />
          {!isCollapsed && <span>Tutorial</span>}
        </Link>
      </div>

      <div className="signout-container">
        <Link
          to="/profile"
          className={`sidebarsmalllink ${isActive("/profile") ? "sidebarsmalllink-active" : ""}`}
        >
          <FontAwesomeIcon icon={farUser} />
          {!isCollapsed && <span>Profile</span>}
        </Link>
        <Link
          to="/logout"
          className={`sidebarsmalllink ${isActive("/logout") ? "sidebarsmalllink-active" : ""}`}
        >
          <FontAwesomeIcon icon={faReply} />
          {!isCollapsed && <span>Logout</span>}
        </Link>
      </div>
    </div>
  );
};

export default SideBarSmall;
