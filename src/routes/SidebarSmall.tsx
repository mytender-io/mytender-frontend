import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./SidebarSmall.css";
import sidebarIcon from "../resources/images/mytender.io_badge.png";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  FileText,
  User,
  Settings,
  GraduationCap,
  Layers,
  Library,
  LogOut,
  LayoutDashboard
} from "lucide-react";
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

interface SideBarSmallProps {
  onCollapseChange?: (isCollapsed: boolean) => void;
}

const SideBarSmall = ({ onCollapseChange }: SideBarSmallProps) => {
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
    onCollapseChange?.(newState); // Emit the change
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
          <img src={sidebarIcon} alt="mytender.io logo" />
          {!isCollapsed && <span>mytender.io</span>}
        </div>

        <Tooltip
          title={isCollapsed ? "Expand" : "Collapse"}
          placement="right"
          enterDelay={1000}
          leaveDelay={0}
        >
          <button className="collapse-toggle" onClick={toggleCollapse}>
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </Tooltip>

        <Link
          to="#"
          className={`sidebarsmalllink ${isActive("/bids") || isActive("/bid-extractor") || isActive("/question-crafter") || isActive("/proposal") ? "sidebarsmalllink-active" : ""}`}
          onClick={handleDashboardClick}
        >
          <LayoutDashboard size={20} />
          {!isCollapsed && <span id="bids-table">Tender Dashboard</span>}
        </Link>

        <Link
          to="/library"
          className={`sidebarsmalllink ${isActive("/library") ? "sidebarsmalllink-active" : ""}`}
        >
          <Library size={20} />
          {!isCollapsed && <span id="library-title">Content Library</span>}
        </Link>

        {!isCollapsed && <div className="sidebar-section-header">Tool Box</div>}

        <Link
          to="/chatResponse"
          className={`sidebarsmalllink ${isActive("/chatResponse") ? "sidebarsmalllink-active" : ""}`}
        >
          <MessageSquare size={20} />
          {!isCollapsed && <span id="welcome">Quick Question</span>}
        </Link>

        <Link
          to="/question-answer"
          className={`sidebarsmalllink ${isActive("/question-answer") ? "sidebarsmalllink-active" : ""}`}
        >
          <Settings size={20} />
          {!isCollapsed && <span>Q&A Generator</span>}
        </Link>

        <Link
          to="#"
          className="sidebarsmalllink"
          onClick={handleWordAddInClick}
        >
          <FileText size={20} />
          {!isCollapsed && <span>Wordpane</span>}
        </Link>

        <Link
          to="https://app.storylane.io/demo/tui6kl0bnkrw?embed=inline"
          className="sidebarsmalllink"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GraduationCap size={20} />
          {!isCollapsed && <span>Tutorial</span>}
        </Link>
      </div>

      <div className="signout-container">
        <Link
          to="/profile"
          className={`sidebarsmalllink ${isActive("/profile") ? "sidebarsmalllink-active" : ""}`}
        >
          <User size={20} />
          {!isCollapsed && <span>Profile</span>}
        </Link>
        <Link
          to="/logout"
          className={`sidebarsmalllink ${isActive("/logout") ? "sidebarsmalllink-active" : ""}`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </Link>
      </div>
    </div>
  );
};

export default SideBarSmall;
