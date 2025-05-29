import React, { useContext, useRef, useState } from "react";
import { BidContext } from "@/views/BidWritingStateManagerView";
import { cn } from "@/utils";
import { tenderTabs } from "@/utils/tenderTabsConfig";
import LightbulbIcon from "@/components/icons/LightbulbIcon";
import CursorIcon from "@/components/icons/CursorIcon";
import BulletsIcon from "@/components/icons/BulletsIcon";
import DownloadIcon from "@/components/icons/DownloadIcon";
import SidebarCollapseIcon from "@/components/icons/SidebarCollapseIcon";
import SidebarExpandIcon from "@/components/icons/SidebarExpandIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import { useAuthUser } from "react-auth-kit";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
interface BidNavbarProps {
  activeTab?: string;
  activeSubTab?: string;
  activeSectionId?: string;
  handleTabClick?: (path: string, isParentTab?: boolean) => void;
  handleSubTabClick?: (subTab: string) => void;
  handleSectionClick?: (sectionId: string) => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
  handleRegenerateClick: () => void;
}

const BidNavbar: React.FC<BidNavbarProps> = ({
  activeTab = "",
  activeSubTab = "tender_summary",
  activeSectionId = "",
  handleTabClick = () => {},
  handleSubTabClick = () => {},
  handleSectionClick = () => {},
  onCollapseChange = () => {},
  handleRegenerateClick
}) => {
  const { sharedState } = useContext(BidContext);
  const { outline } = sharedState;
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange(newState);
  };

  const baseNavLinkStyles =
    "px-4 py-3 cursor-pointer rounded-md bg-transparent text-gray-hint_text font-medium transition-all duration-300 ease-in-out w-full hover:bg-gray-100";
  const activeNavLinkStyles = "bg-orange-active font-bold shadow-sm";

  const baseSubTabStyles =
    "pl-4 py-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 -ml-0.5";
  const activeSubTabStyles =
    "font-semibold text-orange-600 border-l-2 border-orange-500";

  // Limit to max 20 sections to avoid overwhelming the UI
  const displayOutline =
    outline && outline.length > 0 ? outline.slice(0, 20) : [];
  const hasMoreSections = outline && outline.length > 20;

  const handleDownloadDocument = async () => {
    if (!sharedState.object_id) {
      toast.error("No bid ID found");
      return;
    }

    setIsDownloading(true);

    try {
      toast.info("Preparing document for download...");

      // Create FormData instead of JSON
      const formData = new FormData();
      formData.append("bid_id", sharedState.object_id);

      const response = await axios({
        method: "post",
        url: `http${HTTP_PREFIX}://${API_URL}/generate_docx`,
        data: formData,
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${tokenRef.current}`
        }
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a temporary link element to trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sharedState.bidInfo || "proposal"}.docx`;

      // Append to the DOM, click and then remove
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success("Document downloaded successfully");

      // Track download with posthog
      posthog.capture("proposal_document_downloaded", {
        bidId: sharedState.object_id,
        format: "docx"
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className={cn(
        "w-60 min-w-60 h-full border-r border-gray-line transition-all duration-300 ease-in-out",
        isCollapsed ? "min-w-20 w-20" : ""
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-1 relative bg-white rounded-lg p-2 h-full transition-all duration-300 ease-in-out pt-8"
        )}
      >
        {/* Collapse/Expand Button */}
        <Button
          variant="ghost"
          onClick={toggleCollapse}
          className="absolute top-1 right-2 transition-all p-1 h-auto"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <SidebarCollapseIcon className="transition-transform duration-300" />
          ) : (
            <SidebarExpandIcon className="transition-transform duration-300" />
          )}
        </Button>

        {isCollapsed ? (
          // Collapsed view with only icons
          <div className="flex flex-col items-center gap-4 py-2">
            <div
              className={cn(
                "p-2 rounded-md cursor-pointer",
                activeTab === "/bid-extractor"
                  ? "bg-orange-active text-orange-600"
                  : "text-gray-hint_text hover:bg-gray-100"
              )}
              onClick={() => handleTabClick("/bid-extractor")}
            >
              <LightbulbIcon className="w-5 h-5" />
            </div>

            <div
              className={cn(
                "p-2 rounded-md cursor-pointer",
                activeTab === "/bid-intel"
                  ? "bg-orange-active text-orange-600"
                  : "text-gray-hint_text hover:bg-gray-100"
              )}
              onClick={() => handleTabClick("/bid-intel")}
            >
              <CursorIcon className="w-5 h-5" />
            </div>

            <div
              className={cn(
                "p-2 rounded-md cursor-pointer",
                activeTab === "/proposal-planner" ||
                  activeTab === "/proposal-preview"
                  ? "bg-orange-active text-orange-600"
                  : "text-gray-hint_text hover:bg-gray-100"
              )}
              onClick={() => handleTabClick("/proposal-planner", true)}
            >
              <BulletsIcon className="w-5 h-5" />
            </div>

            <div
              className={cn(
                "p-2 rounded-md cursor-pointer mt-auto",
                isDownloading
                  ? "opacity-50 cursor-not-allowed"
                  : "text-gray-hint_text hover:bg-gray-100"
              )}
              onClick={!isDownloading ? handleDownloadDocument : undefined}
            >
              <DownloadIcon className="w-5 h-5" />
            </div>
          </div>
        ) : (
          // Expanded view with full navigation
          <>
            <span
              className={cn(
                baseNavLinkStyles,
                activeTab === "/bid-extractor" && activeNavLinkStyles
              )}
              onClick={() => handleTabClick("/bid-extractor")}
            >
              <div className="flex items-center gap-2">
                <LightbulbIcon className="text-black" />
                Insights
              </div>
            </span>

            {activeTab === "/bid-extractor" && (
              <div className="flex flex-col ml-4 border-l border-gray-200">
                {tenderTabs.map((tab, index) => (
                  <span
                    key={index}
                    className={cn(
                      baseSubTabStyles,
                      activeTab === "/bid-extractor" &&
                        activeSubTab === tab.stateKey &&
                        activeSubTabStyles
                    )}
                    onClick={() => handleSubTabClick(tab.stateKey)}
                  >
                    {tab.name}
                  </span>
                ))}
              </div>
            )}

            <span
              className={cn(
                baseNavLinkStyles,
                activeTab === "/bid-intel" && activeNavLinkStyles
              )}
              onClick={() => handleTabClick("/bid-intel")}
            >
              <div className="flex items-center gap-2">
                <CursorIcon className="text-black" />
                Response Inputs
              </div>
            </span>

            <span
              className={cn(
                baseNavLinkStyles,
                (activeTab === "/proposal-planner" ||
                  activeTab === "/proposal-preview") &&
                  activeNavLinkStyles
              )}
              onClick={() => handleTabClick("/proposal-planner", true)}
            >
              <div className="flex items-center gap-2">
                <BulletsIcon className="text-black" />
                Outline
              </div>
            </span>

            <div className="flex flex-col gap-2">
              {displayOutline.length > 0 && (
                <div className="flex flex-col ml-4 border-l border-gray-200">
                  {displayOutline.map((section, index) => (
                    <span
                      key={section.section_id}
                      className={cn(
                        baseSubTabStyles,
                        (activeTab === "/proposal-planner" ||
                          activeTab === "/proposal-preview") &&
                          activeSectionId === section.section_id &&
                          activeSubTabStyles
                      )}
                      onClick={() => handleSectionClick(section.section_id)}
                      title={section.heading}
                    >
                      {section.heading.length > 25
                        ? section.heading.substring(0, 25) + "..."
                        : section.heading}
                    </span>
                  ))}
                  {hasMoreSections && (
                    <div className="text-xs text-gray-500 italic pl-4 pt-1">
                      + {outline.length - 20} more sections
                    </div>
                  )}
                </div>
              )}
              <Button
                variant="ghost"
                className="text-xs justify-start text-gray border-none hover:bg-transparent"
                onClick={handleRegenerateClick}
              >
                <PlusIcon  />
                Add Section
              </Button>
            </div>
            {/* Download Tab */}
            <span
              className={cn(
                baseNavLinkStyles,
                isDownloading && "opacity-50 cursor-not-allowed"
              )}
              onClick={!isDownloading ? handleDownloadDocument : undefined}
            >
              <div className="flex items-center gap-2">
                <DownloadIcon className={cn("text-black")} />
                {isDownloading ? "Downloading..." : "Download Bid"}
              </div>
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default BidNavbar;
