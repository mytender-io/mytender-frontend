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
  LayoutDashboard,
  User2,
  Files,
  Bot,
  BookMarked,
  Sparkles,
  BookOpen,
  BookOpenCheck,
  BookOpenText
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
  const initialCollapsedState = JSON.parse(
    localStorage.getItem("sidebarCollapsed") || "false"
  );
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsedState);

  const isActive = (path: string): boolean => location.pathname === path;

  useEffect(() => {
    const storedBid = localStorage.getItem("lastActiveBid");
    if (storedBid) {
      setLastActiveBid(JSON.parse(storedBid));
    }

    // Notify parent component of initial state
    onCollapseChange?.(initialCollapsedState);

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
  }, [initialCollapsedState, onCollapseChange]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
    onCollapseChange?.(newState);
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

        {/* <Tooltip
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
        </Tooltip> */}

        <div className="sidelinks">
          <Tooltip
            title="Tender Dashboard - View and manage all your tenders in one place and generate a full tender document"
            placement="right"
            enterDelay={2000}
            enterNextDelay={2000}
            leaveDelay={0}
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: "rgba(51, 51, 51, 0.7)",
                  color: "white",
                  fontSize: "14px",
                  padding: "8px 12px",
                  maxWidth: "300px",
                  backdropFilter: "blur(4px)"
                }
              }
            }}
          >
            <Link
              to="/bids"
              className={`sidebarsmalllink ${isActive("/bids") ? "sidebarsmalllink-active" : ""}`}
            >
              <LayoutDashboard size={24} />
              {!isCollapsed && <span id="library-title">Tender Dashboard</span>}
            </Link>
          </Tooltip>

          <Tooltip
            title="Content Library - Access and manage your organization's knowledge base and templates"
            placement="right"
            enterDelay={2000}
            enterNextDelay={2000}
            leaveDelay={0}
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: "rgba(51, 51, 51, 0.7)",
                  color: "white",
                  fontSize: "14px",
                  padding: "8px 12px",
                  maxWidth: "300px",
                  backdropFilter: "blur(4px)"
                }
              }
            }}
          >
            <Link
              to="/library"
              className={`sidebarsmalllink ${isActive("/library") ? "sidebarsmalllink-active" : ""}`}
            >
              <BookOpenText   size={24} />
              {!isCollapsed && <span id="library-title">Content Library</span>}
            </Link>
          </Tooltip>

          <div className="sidebar-section-header">
            {!isCollapsed && "Tool Box"}
          </div>

          <Tooltip
            title="Library Chat - Interact with AI to get insights from your content library"
            placement="right"
            enterDelay={2000}
            enterNextDelay={2000}
            leaveDelay={0}
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: "rgba(51, 51, 51, 0.7)",
                  color: "white",
                  fontSize: "14px",
                  padding: "8px 12px",
                  maxWidth: "300px",
                  backdropFilter: "blur(4px)"
                }
              }
            }}
          >
            <Link
              to="/chatResponse"
              className={`sidebarsmalllink ${isActive("/chatResponse") ? "sidebarsmalllink-active" : ""}`}
            >
              <Sparkles size={24} />
              {!isCollapsed && <span id="welcome">Library Chat</span>}
            </Link>
          </Tooltip>

          <Tooltip
            title="Q&A Generator - Automatically generate question and answer pairs from your documents"
            placement="right"
            enterDelay={2000}
            enterNextDelay={2000}
            leaveDelay={0}
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: "rgba(51, 51, 51, 0.7)",
                  color: "white",
                  fontSize: "14px",
                  padding: "8px 12px",
                  maxWidth: "300px",
                  backdropFilter: "blur(4px)"
                }
              }
            }}
          >
            <Link
              to="/question-answer"
              className={`sidebarsmalllink ${isActive("/question-answer") ? "sidebarsmalllink-active" : ""}`}
            >
              <Files size={24} />
              {!isCollapsed && <span>Q&A Generator</span>}
            </Link>
          </Tooltip>

          <Tooltip
            title="Wordpane - Access your tender content directly within Microsoft Word"
            placement="right"
            enterDelay={2000}
            enterNextDelay={2000}
            leaveDelay={0}
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: "rgba(51, 51, 51, 0.7)",
                  color: "white",
                  fontSize: "14px",
                  padding: "8px 12px",
                  maxWidth: "300px",
                  backdropFilter: "blur(4px)"
                }
              }
            }}
          >
            <Link
              to="#"
              className="sidebarsmalllink"
              onClick={handleWordAddInClick}
            >
              <FileText size={24} />
              {!isCollapsed && <span>Wordpane</span>}
            </Link>
          </Tooltip>

          <Tooltip
            title="How To - Interactive guide to help you get the most out of mytender.io"
            placement="right"
            enterDelay={2000}
            enterNextDelay={2000}
            leaveDelay={0}
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: "rgba(51, 51, 51, 0.7)",
                  color: "white",
                  fontSize: "14px",
                  padding: "8px 12px",
                  maxWidth: "300px",
                  backdropFilter: "blur(4px)"
                }
              }
            }}
          >
            <Link
              to="https://app.storylane.io/demo/tui6kl0bnkrw?embed=inline"
              className="sidebarsmalllink"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GraduationCap size={24} />
              {!isCollapsed && <span>How To</span>}
            </Link>
          </Tooltip>
        </div>
      </div>

      <div className="signout-container">
        <Tooltip
          title="Profile - Manage your account settings and preferences"
          placement="right"
          enterDelay={2000}
          enterNextDelay={2000}
          leaveDelay={0}
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: "rgba(51, 51, 51, 0.7)",
                color: "white",
                fontSize: "14px",
                padding: "8px 12px",
                maxWidth: "300px",
                backdropFilter: "blur(4px)"
              }
            }
          }}
        >
          <Link
            to="/profile"
            className={`sidebarsmalllink ${isActive("/profile") ? "sidebarsmalllink-active" : ""}`}
          >
            <User2 size={16} />
            {!isCollapsed && <span>Profile</span>}
          </Link>
        </Tooltip>

        <Tooltip
          title="Logout - Sign out of your mytender.io account"
          placement="right"
          enterDelay={2000}
          enterNextDelay={2000}
          leaveDelay={0}
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: "rgba(51, 51, 51, 0.7)",
                color: "white",
                fontSize: "14px",
                padding: "8px 12px",
                maxWidth: "300px",
                backdropFilter: "blur(4px)"
              }
            }
          }}
        >
          <Link
            to="/logout"
            className={`sidebarsmalllink ${isActive("/logout") ? "sidebarsmalllink-active" : ""}`}
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Logout</span>}
          </Link>
        </Tooltip>
      </div>
    </div>
  );
};

export default SideBarSmall;
