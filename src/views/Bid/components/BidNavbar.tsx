import React, { useContext, useState } from "react";
import { BidContext } from "@/views/BidWritingStateManagerView";
import { cn } from "@/utils";
import { tenderTabs } from "@/utils/tenderTabsConfig";

interface BidNavbarProps {
  activeTab?: string;
  activeSubTab?: string;
  activeSection?: string;
  handleTabClick?: (path: string) => void;
  handleSubTabClick?: (subTab: string) => void;
  handleSectionClick?: (sectionId: string) => void;
}

const BidNavbar: React.FC<BidNavbarProps> = ({
  activeTab = "",
  activeSubTab = "tender_summary",
  activeSection = "",
  handleTabClick = () => {},
  handleSubTabClick = () => {},
  handleSectionClick = () => {}
}) => {
  const { sharedState } = useContext(BidContext);
  const { outline } = sharedState;

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

  return (
    <div className="flex flex-col gap-1 relative bg-white rounded-lg p-2 h-full">
      <span
        className={cn(
          baseNavLinkStyles,
          activeTab === "/bid-extractor" && activeNavLinkStyles
        )}
        onClick={() => handleTabClick("/bid-extractor")}
      >
        Tender Insights
      </span>

      <div className="flex flex-col ml-2 border-l border-gray-200">
        {tenderTabs.map((tab, index) => (
          <span
            key={index}
            className={cn(
              baseSubTabStyles,
              activeSubTab === tab.stateKey && activeSubTabStyles
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
        Bid Inputs
      </span>

      <span
        className={cn(
          baseNavLinkStyles,
          (activeTab === "/proposal-planner" ||
            activeTab === "/proposal-preview") &&
            activeNavLinkStyles
        )}
        onClick={() => handleTabClick("/proposal-planner")}
      >
        Proposal Workspace
      </span>

      {displayOutline.length > 0 && (
        <div className="flex flex-col ml-2 border-l border-gray-200">
          {displayOutline.map((section, index) => (
            <span
              key={section.section_id}
              className={cn(
                baseSubTabStyles,
                activeSection === section.section_id && activeSubTabStyles
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
    </div>
  );
};

export default BidNavbar;
