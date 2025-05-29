import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "/images/mytender.io_badge.png";
import { HomeIcon, UserRound } from "lucide-react";
import DashboardIcon from "@/components/icons/DashboardIcon";
import ContentLibraryIcon from "@/components/icons/ContentLibraryIcon";
import LibraryChatIcon from "@/components/icons/LibraryChatIcon";
import { cn } from "@/utils";

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

  const isActive = (path: string): boolean =>
    location.pathname === path ||
    (path !== "/" && location.pathname.startsWith(path + "/"));

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

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-transparent transition-all duration-300 z-[1] w-24`}
    >
      <div className="flex flex-col h-full p-2 gap-4">
        <div className="flex items-center p-2">
          <img src={Logo} alt="mytender.io logo" className="w-full h-full" />
        </div>
        <div className="flex flex-col gap-4">
          <Link
            to="/home"
            className="flex flex-col items-center justify-center bg-transparent group"
          >
            <HomeIcon
              className={cn(
                "min-w-12 min-h-12 stroke-1 group-hover:bg-typo-200 rounded-md p-2",
                isActive("/home") ? "text-orange" : "text-gray-hint_text"
              )}
              width={20}
              height={20}
            />
            {!isCollapsed && (
              <span
                className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  isActive("/home") ? "text-orange" : "text-gray-hint_text"
                )}
              >
                Home
              </span>
            )}
          </Link>
          <Link
            to="/bids"
            className="flex flex-col items-center justify-center bg-transparent group"
          >
            <DashboardIcon
              className={cn(
                "min-w-12 min-h-12 group-hover:bg-typo-200 rounded-md p-2",
                isActive("/bids") || isActive("/bid")
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
                  isActive("/bids") || isActive("/bid")
                    ? "text-orange"
                    : "text-gray-hint_text"
                )}
              >
                Dashboard
              </span>
            )}
          </Link>
          <Link
            to="/library"
            className="flex flex-col items-center justify-center bg-transparent group"
          >
            <ContentLibraryIcon
              className={cn(
                "min-w-12 min-h-12 group-hover:bg-typo-200 rounded-md p-2",
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
                Library
              </span>
            )}
          </Link>
          <Link
            to="/chat"
            className="flex flex-col items-center justify-center bg-transparent group"
          >
            <LibraryChatIcon
              className={cn(
                "min-w-12 min-h-12 group-hover:bg-typo-200 rounded-md p-2",
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
                Chat
              </span>
            )}
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center justify-center bg-transparent group"
          >
            <UserRound
              className={cn(
                "min-w-12 min-h-12 stroke-1 group-hover:bg-typo-200 rounded-md p-2",
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
                Account
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
