import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "../resources/images/mytender.io_badge.png";
import { ChevronLeft, ChevronRight } from "lucide-react";
// import HomeIcon from "@/components/icons/HomeIcon";
import DashboardIcon from "@/components/icons/DashboardIcon";
import ContentLibraryIcon from "@/components/icons/ContentLibraryIcon";
import LibraryChatIcon from "@/components/icons/LibraryChatIcon";
import QAIcon from "@/components/icons/QAIcon";
import WordpaneIcon from "@/components/icons/WordpaneIcon";
import UserIcon from "@/components/icons/UserIcon";
import HowtoIcon from "@/components/icons/HowtoIcon";
import LogoutIcon from "@/components/icons/LogoutIcon";
import { cn } from "@/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface LastActiveBid {
  _id: string;
  bid_title: string;
  status: string;
  [key: string]: string | number | boolean | object;
}

interface BidUpdateEvent extends Event {
  detail: LastActiveBid;
}

interface SideBarProps {
  onCollapseChange?: (isCollapsed: boolean) => void;
}

const SideBar = ({ onCollapseChange }: SideBarProps) => {
  const location = useLocation();
  const [lastActiveBid, setLastActiveBid] = useState<LastActiveBid | null>(
    null
  );
  const initialCollapsedState = JSON.parse(
    localStorage.getItem("sidebarCollapsed") || "false"
  );
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsedState);
  const [isHovering, setIsHovering] = useState(false);

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

  // const handleDashboardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  //   e.preventDefault();
  //   if (lastActiveBid) {
  //     const lastActiveTab =
  //       localStorage.getItem("lastActiveTab") || "/bid-extractor";
  //     navigate(lastActiveTab, {
  //       state: { bid: lastActiveBid, fromBidsTable: true }
  //     });
  //   } else {
  //     navigate("/bids");
  //   }
  // };

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-transparent transition-all duration-300 z-[1] ${
        isCollapsed ? "w-20" : "w-56"
      }`}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className={cn(
                "absolute top-1/2 -translate-y-1/2 p-1 bg-white border border-gray-200 shadow-md hover:bg-gray-50 text-gray-hint_text",
                isHovering
                  ? "w-6 h-6 rounded-full -right-3"
                  : "w-4 h-6 rounded-sm -right-2"
              )}
              onClick={toggleCollapse}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {isHovering ? (
                isCollapsed ? (
                  <ChevronRight size={20} />
                ) : (
                  <ChevronLeft size={20} />
                )
              ) : (
                <div className="w-[2px] h-3 bg-gray-hint_text"></div>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {isCollapsed ? "Expand" : "Collapse"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex flex-col h-full space-y-6">
        <div
          className={cn(
            "flex items-center p-4",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          <img
            src={Logo}
            alt="mytender.io logo"
            className="h-10 w-10 min-w-10 min-h-10"
          />
          {!isCollapsed && (
            <span className="ml-2 font-semibold text-xl">mytender.io</span>
          )}
        </div>
        {/* <Tooltip
          title={isCollapsed ? "Expand" : "Collapse"}
          placement="right"
          enterDelay={1000}
          leaveDelay={0}
         </Tooltip> */}
        <div className="flex flex-col flex-1 overflow-y-auto px-4 gap-10">
          <div className="space-y-3">
            {/* <Link
            to="/home"
            className={cn(
              "flex items-center hover:bg-typo-200 rounded-xl px-3 py-2 gap-3",
              isActive("/home") ? "bg-typo-200" : "bg-transparent"
            )}
          >
            <HomeIcon
              className="text-gray-hint_text min-w-5 min-h-5"
              width={20}
              height={20}
            />
            {!isCollapsed && (
              <span className="text-sm text-gray-hint_text font-medium whitespace-nowrap">
                Home
              </span>
            )}
          </Link> */}
            <Link
              to="/bids"
              className="flex items-center hover:bg-typo-200 bg-transparent rounded-xl px-3 py-2 gap-3"
            >
              <DashboardIcon
                className={cn(
                  "min-w-5 min-h-5",
                  isActive("/bids") ||
                    isActive("/bid-extractor") ||
                    isActive("/bid-intel") ||
                    isActive("/proposal-planner") ||
                    isActive("/proposal-review")
                    ? "text-orange"
                    : "text-gray-hint_text"
                )}
                width={20}
                height={20}
              />
              {!isCollapsed && (
                <span
                  className={cn(
                    "text-sm font-medium whitespace-nowrap",
                    isActive("/bids") ||
                      isActive("/bid-extractor") ||
                      isActive("/bid-intel") ||
                      isActive("/proposal-planner") ||
                      isActive("/proposal-review")
                      ? "text-orange"
                      : "text-gray-hint_text"
                  )}
                >
                  Tender Dashboard
                </span>
              )}
            </Link>
            <Link
              to="/library"
              className="flex items-center hover:bg-typo-200 rounded-xl px-3 py-2 gap-3 bg-transparent"
            >
              <ContentLibraryIcon
                className={cn(
                  "min-w-5 min-h-5",
                  isActive("/library") ? "text-orange" : "text-gray-hint_text"
                )}
                width={20}
                height={20}
              />
              {!isCollapsed && (
                <span
                  className={cn(
                    "text-sm font-medium whitespace-nowrap",
                    isActive("/library") ? "text-orange" : "text-gray-hint_text"
                  )}
                >
                  Content Library
                </span>
              )}
            </Link>
          </div>
          <div className="space-y-3">
            <span
              className={cn(
                "text-xs font-bold text-gray-hint_text",
                isCollapsed ? "opacity-0" : "opacity-100"
              )}
            >
              Tools
            </span>
            <Link
              to="/chat"
              className="flex items-center hover:bg-typo-200 bg-transparent rounded-xl px-3 py-2 gap-3"
            >
              <LibraryChatIcon
                className={cn(
                  "min-w-5 min-h-5",
                  isActive("/chat") ? "text-orange" : "text-gray-hint_text"
                )}
                width={20}
                height={20}
              />
              {!isCollapsed && (
                <span
                  className={cn(
                    "text-sm font-medium whitespace-nowrap",
                    isActive("/chat") ? "text-orange" : "text-gray-hint_text"
                  )}
                >
                  Library Chat
                </span>
              )}
            </Link>
            <Link
              to="/question-answer"
              className="flex items-center hover:bg-typo-200 bg-transparent rounded-xl px-3 py-2 gap-3"
            >
              <QAIcon
                className={cn(
                  "min-w-5 min-h-5 rotate-[270deg]",
                  isActive("/question-answer")
                    ? "text-orange"
                    : "text-gray-hint_text"
                )}
                width={20}
                height={20}
              />
              {!isCollapsed && (
                <span
                  className={cn(
                    "text-sm font-medium whitespace-nowrap",
                    isActive("/question-answer")
                      ? "text-orange"
                      : "text-gray-hint_text"
                  )}
                >
                  Q&A Generator
                </span>
              )}
            </Link>
            <Link
              to="https://appsource.microsoft.com/en-us/product/office/WA200007690?src=office&corrid=bd0c24c3-6022-e897-73ad-0dc9bdf3558b&omexanonuid=&referralurl="
              className="flex items-center hover:bg-typo-200 rounded-xl px-3 py-2 gap-3 bg-transparent"
              target="_blank"
              rel="noopener noreferrer"
            >
              <WordpaneIcon
                className="text-gray-hint_text min-w-5 min-h-5"
                width={20}
                height={20}
              />
              {!isCollapsed && (
                <span className="text-sm text-gray-hint_text font-medium whitespace-nowrap">
                  Word Pane
                </span>
              )}
            </Link>
            <Link
              to="https://app.storylane.io/demo/tui6kl0bnkrw?embed=inline"
              className="flex items-center hover:bg-typo-200 rounded-xl px-3 py-2 gap-3 bg-transparent"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HowtoIcon
                className="text-gray-hint_text min-w-5 min-h-5"
                width={20}
                height={20}
              />
              {!isCollapsed && (
                <span className="text-sm text-gray-hint_text font-medium whitespace-nowrap">
                  How To
                </span>
              )}
            </Link>
            {/* <Tooltip
            title="Tender Dashboard - View and manage all your tenders in one place"
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
              className={`flex items-center px-4 py-3 hover:bg-gray-50 ${
                isActive("/bids") ? "bg-blue-50 text-blue-600" : "text-gray-700"
              }`}
            >
              <DashboardIcon className="text-gray-hint_text min-w-5 min-h-5" width={20} height={20} />
              {!isCollapsed && (
                <span className="ml-3 text-sm text-gray-hint_text">
                  Tender Dashboard
                </span>
              )}
            </Link>
          </Tooltip> */}
            {/* <Tooltip
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
              className={`flex items-center px-4 py-3 hover:bg-gray-50 ${
                isActive("/library")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700"
              }`}
            >
              <BookMarked size={24} />
              {!isCollapsed && <span className="ml-3">Content Library</span>}
            </Link>
          </Tooltip> */}
            {/* <Tooltip
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
              className={`flex items-center px-4 py-3 hover:bg-gray-50 ${
                isActive("/chatResponse")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700"
              }`}
            >
              <Sparkles size={24} />
              {!isCollapsed && <span className="ml-3">Library Chat</span>}
            </Link>
          </Tooltip> */}
            {/* <Tooltip
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
              className={`flex items-center px-4 py-3 hover:bg-gray-50 ${
                isActive("/question-answer")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700"
              }`}
            >
              <Files size={24} />
              {!isCollapsed && <span className="ml-3">Q&A Generator</span>}
            </Link>
          </Tooltip> */}
            {/* <Tooltip
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
              className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
              onClick={handleWordAddInClick}
            >
              <FileText size={24} />
              {!isCollapsed && <span className="ml-3">Wordpane</span>}
            </Link>
          </Tooltip> */}
            {/* <Tooltip
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
              className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GraduationCap size={24} />
              {!isCollapsed && <span className="ml-3">How To</span>}
            </Link>
          </Tooltip> */}
          </div>
        </div>

        <div className="flex flex-col border-t border-gray-200 p-4 gap-3">
          <Link
            to="/profile"
            className={cn(
              "flex items-center hover:bg-typo-200 rounded-xl px-3 py-2 gap-3 bg-transparent"
            )}
          >
            <UserIcon
              className={cn(
                "min-w-5 min-h-5",
                isActive("/profile") ? "text-orange" : "text-gray-hint_text"
              )}
              width={20}
              height={20}
            />
            {!isCollapsed && (
              <span
                className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  isActive("/profile") ? "text-orange" : "text-gray-hint_text"
                )}
              >
                Profile
              </span>
            )}
          </Link>
          <Link
            to="/logout"
            className={cn(
              "flex items-center hover:bg-typo-200 rounded-xl px-3 py-2 gap-3 bg-transparent"
            )}
          >
            <LogoutIcon
              className={cn(
                "min-w-5 min-h-5",
                isActive("/logout") ? "text-orange" : "text-gray-hint_text"
              )}
              width={20}
              height={20}
            />
            {!isCollapsed && (
              <span
                className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  isActive("/logout") ? "text-orange" : "text-gray-hint_text"
                )}
              >
                Logout
              </span>
            )}
          </Link>
          {/* <Tooltip
            title="Profile - Manage your account settings"
            placement="right"
            enterDelay={2000}
            leaveDelay={0}
          >
            <Link
              to="/profile"
              className={`flex items-center px-2 py-2 mb-2 rounded hover:bg-gray-50 ${
                isActive("/profile")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700"
              }`}
            >
              <User2 size={16} />
              {!isCollapsed && <span className="ml-3">Profile</span>}
            </Link>
          </Tooltip> */}

          {/* <Tooltip
            title="Logout - Sign out of your account"
            placement="right"
            enterDelay={2000}
            leaveDelay={0}
          >
            <Link
              to="/logout"
              className={`flex items-center px-2 py-2 rounded hover:bg-gray-50 ${
                isActive("/logout")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700"
              }`}
            >
              <LogOut size={16} />
              {!isCollapsed && <span className="ml-3">Logout</span>}
            </Link>
          </Tooltip> */}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
