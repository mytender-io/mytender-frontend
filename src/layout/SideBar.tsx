import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "../resources/images/mytender.io_badge.png";
import { ChevronLeft, ChevronRight, HomeIcon, UserRound } from "lucide-react";
// import HomeIcon from "@/components/icons/HomeIcon";
import DashboardIcon from "@/components/icons/DashboardIcon";
import ContentLibraryIcon from "@/components/icons/ContentLibraryIcon";
import LibraryChatIcon from "@/components/icons/LibraryChatIcon";
import QAIcon from "@/components/icons/QAIcon";
import WordpaneIcon from "@/components/icons/WordpaneIcon";
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
            <Link
              to="/home"
              className="flex items-center hover:bg-typo-200 bg-transparent rounded-md px-3 py-2 gap-3"
            >
              <HomeIcon
                className={cn(
                  "min-w-5 min-h-5 stroke-1",
                  isActive("/home")
                    ? "text-orange stroke-2"
                    : "text-gray-hint_text"
                )}
                width={20}
                height={20}
              />
              {!isCollapsed && (
                <span
                  className={cn(
                    "text-sm font-medium whitespace-nowrap",
                    isActive("/home")
                      ? "text-orange font-bold"
                      : "text-gray-hint_text"
                  )}
                >
                  Home
                </span>
              )}
            </Link>
            <Link
              to="/bids"
              className="flex items-center hover:bg-typo-200 bg-transparent rounded-md px-3 py-2 gap-3"
            >
              <DashboardIcon
                className={cn(
                  "min-w-5 min-h-5",
                  isActive("/bids") || isActive("/bid")
                    ? "text-orange"
                    : "text-gray-hint_text"
                )}
                strokeWidth={isActive("/bids") || isActive("/bid") ? 2 : 1}
                width={20}
                height={20}
              />
              {!isCollapsed && (
                <span
                  className={cn(
                    "text-sm font-medium whitespace-nowrap",
                    isActive("/bids") || isActive("/bid")
                      ? "text-orange font-bold"
                      : "text-gray-hint_text"
                  )}
                >
                  Tender Dashboard
                </span>
              )}
            </Link>
            <Link
              to="/library"
              className="flex items-center hover:bg-typo-200 rounded-md px-3 py-2 gap-3 bg-transparent"
            >
              <ContentLibraryIcon
                className={cn(
                  "min-w-5 min-h-5",
                  isActive("/library") ? "text-orange" : "text-gray-hint_text"
                )}
                strokeWidth={isActive("/library") ? 1.5 : 1}
                width={20}
                height={20}
              />
              {!isCollapsed && (
                <span
                  className={cn(
                    "text-sm font-medium whitespace-nowrap",
                    isActive("/library")
                      ? "text-orange font-bold"
                      : "text-gray-hint_text"
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
              className="flex items-center hover:bg-typo-200 bg-transparent rounded-md px-3 py-2 gap-3"
            >
              <LibraryChatIcon
                className={cn(
                  "min-w-5 min-h-5",
                  isActive("/chat") ? "text-orange" : "text-gray-hint_text"
                )}
                strokeWidth={isActive("/chat") ? 2 : 1}
                width={20}
                height={20}
              />
              {!isCollapsed && (
                <span
                  className={cn(
                    "text-sm font-medium whitespace-nowrap",
                    isActive("/chat")
                      ? "text-orange font-bold"
                      : "text-gray-hint_text"
                  )}
                >
                  Library Chat
                </span>
              )}
            </Link>
            <Link
              to="/question-answer"
              className="flex items-center hover:bg-typo-200 bg-transparent rounded-md px-3 py-2 gap-3"
            >
              <QAIcon
                className={cn(
                  "min-w-5 min-h-5 rotate-[270deg]",
                  isActive("/question-answer")
                    ? "text-orange"
                    : "text-gray-hint_text"
                )}
                strokeWidth={isActive("/question-answer") ? 2 : 1}
                width={20}
                height={20}
              />
              {!isCollapsed && (
                <span
                  className={cn(
                    "text-sm font-medium whitespace-nowrap",
                    isActive("/question-answer")
                      ? "text-orange font-bold"
                      : "text-gray-hint_text"
                  )}
                >
                  Q&A Generator
                </span>
              )}
            </Link>
            <Link
              to="https://appsource.microsoft.com/en-us/product/office/WA200007690?src=office&corrid=bd0c24c3-6022-e897-73ad-0dc9bdf3558b&omexanonuid=&referralurl="
              className="flex items-center hover:bg-typo-200 rounded-md px-3 py-2 gap-3 bg-transparent"
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
              to="https://app.storylane.io/share/emiqkpwn2e5r?embed=inline"
              className="flex items-center hover:bg-typo-200 rounded-md px-3 py-2 gap-3 bg-transparent"
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
          </div>
        </div>

        <div className="flex flex-col border-t border-gray-200 p-4 gap-3">
          <Link
            to="/profile"
            className={cn(
              "flex items-center hover:bg-typo-200 rounded-md px-3 py-2 gap-3 bg-transparent"
            )}
          >
            <UserRound
              className={cn(
                "min-w-5 min-h-5 stroke-1",
                isActive("/profile")
                  ? "text-orange stroke-2"
                  : "text-gray-hint_text"
              )}
              width={20}
              height={20}
            />
            {!isCollapsed && (
              <span
                className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  isActive("/profile")
                    ? "text-orange font-bold"
                    : "text-gray-hint_text"
                )}
              >
                Profile
              </span>
            )}
          </Link>
          <Link
            to="/logout"
            className={cn(
              "flex items-center hover:bg-typo-200 rounded-md px-3 py-2 gap-3 bg-transparent"
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
                  isActive("/logout")
                    ? "text-orange font-bold"
                    : "text-gray-hint_text"
                )}
              >
                Logout
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
