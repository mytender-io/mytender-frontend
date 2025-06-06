import React, { useContext, useRef, useState } from "react";
import { BidContext } from "@/views/BidWritingStateManagerView";
import { cn } from "@/utils";
import { tenderTabs } from "@/utils/tenderTabsConfig";
import LightbulbIcon from "@/components/icons/LightbulbIcon";
import CursorIcon from "@/components/icons/CursorIcon";
import BulletsIcon from "@/components/icons/BulletsIcon";
import SidebarCollapseIcon from "@/components/icons/SidebarCollapseIcon";
import SidebarExpandIcon from "@/components/icons/SidebarExpandIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import { useAuthUser } from "react-auth-kit";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import DocsIcon from "@/components/icons/DocsIcon";
import DocIcon from "@/components/icons/DocIcon";
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
  onCollapseChange = () => {}
}) => {
  const { sharedState, setSharedState } = useContext(BidContext);
  const { outline } = sharedState;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllSections, setShowAllSections] = useState(false);

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
  const activeNavLinkStyles = "bg-orange-active text-orange-600";

  const baseSubTabStyles =
    "pl-4 py-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 -ml-0.5";
  const activeSubTabStyles =
    "font-semibold text-orange-600 border-l-2 border-orange-500";

  // Limit to max 20 sections to avoid overwhelming the UI
  const displayOutline =
    outline && outline.length > 0
      ? showAllSections
        ? outline
        : outline.slice(0, 20)
      : [];
  const hasMoreSections = !showAllSections && outline && outline.length > 20;

  const handleAddSection = async (targetIndex: number) => {
    const insertIndex = targetIndex + 1;

    // Return early if no object_id or no valid index to insert at
    if (!sharedState.object_id || insertIndex === null) return;

    const newSection = {
      heading: "New Section",
      word_count: 250,
      reviewer: "",
      answerer: "",
      status: "Not Started" as const,
      subsections: 0,
      question: "",
      answer: "",
      weighting: "",
      page_limit: "",
      subheadings: [],
      choice: "3b",
      writingplan: ""
    };

    try {
      const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );

      const updatedOutline = [...sharedState.outline];
      updatedOutline.splice(insertIndex, 0, {
        ...newSection,
        section_id: uuid
      });

      setSharedState((prevState) => ({
        ...prevState,
        outline: updatedOutline
      }));

      // Show success toast
      toast.success("New section added");
    } catch (err) {
      console.error("Error adding section:", err);
      toast.error("Failed to add section");
    }
  };

  return (
    <div
      className={cn(
        "w-60 min-w-60 h-full border-r border-gray-line transition-all duration-300 ease-in-out max-h-[calc(100vh-66px)] overflow-y-auto",
        isCollapsed ? "min-w-20 w-20" : ""
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-1 relative bg-white rounded-lg p-2 h-full transition-all duration-300 ease-in-out pt-12"
        )}
      >
        {/* Collapse/Expand Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="absolute top-1 right-2 transition-all px-2"
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
                activeTab === "/tender-documents"
                  ? "bg-orange-active text-orange-600"
                  : "text-gray-hint_text hover:bg-gray-100"
              )}
              onClick={() => handleTabClick("/tender-documents")}
            >
              <DocsIcon className="w-5 h-5" />
            </div>

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
          </div>
        ) : (
          // Expanded view with full navigation
          <>
            <span
              className={cn(
                baseNavLinkStyles,
                activeTab === "/tender-documents" && activeNavLinkStyles
              )}
              onClick={() => handleTabClick("/tender-documents")}
            >
              <div className="flex items-center gap-2">
                <DocsIcon className="w-5 h-5" />
                Tender Documents
              </div>
            </span>

            <span
              className={cn(
                baseNavLinkStyles,
                activeTab === "/bid-extractor" && activeNavLinkStyles
              )}
              onClick={() => handleTabClick("/bid-extractor")}
            >
              <div className="flex items-center gap-2">
                <LightbulbIcon className="w-5 h-5" />
                Insights
              </div>
            </span>

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

            <span
              className={cn(
                baseNavLinkStyles,
                activeTab === "/bid-intel" && activeNavLinkStyles
              )}
              onClick={() => handleTabClick("/bid-intel")}
            >
              <div className="flex items-center gap-2">
                <CursorIcon className="w-5 h-5" />
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
                <BulletsIcon className="w-5 h-5" />
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
                    <div
                      className="text-xs text-gray-500 italic pl-4 pt-1 cursor-pointer hover:text-orange-500"
                      onClick={() => setShowAllSections(true)}
                    >
                      + {outline.length - 20} more sections
                    </div>
                  )}
                  {showAllSections && (
                    <div
                      className="text-xs text-gray-500 italic pl-4 pt-1 cursor-pointer hover:text-orange-500"
                      onClick={() => setShowAllSections(false)}
                    >
                      Show fewer sections
                    </div>
                  )}
                </div>
              )}
              <Button
                variant="ghost"
                className="text-xs justify-start text-gray border-none hover:bg-transparent"
                onClick={() => handleAddSection(displayOutline.length - 1)}
              >
                <PlusIcon />
                Add Section
              </Button>
            </div>

            <span
              className={cn(
                baseNavLinkStyles,
                activeTab === "/full-proposal" && activeNavLinkStyles
              )}
              onClick={() => handleTabClick("/full-proposal")}
            >
              <div className="flex items-center gap-2">
                <DocIcon className="w-5 h-5" />
                Full Proposal
              </div>
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default BidNavbar;
