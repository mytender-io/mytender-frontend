import React, { useContext, useState } from "react";
// import { BidContext } from "@/views/BidWritingStateManagerView";
import { cn } from "@/utils";
import { tenderTabs } from "@/utils/tenderTabsConfig";

const BidNavbar: React.FC<{
  activeTab: string;
  activeSubTab: string;
  handleTabClick: (path: string) => void;
  handleSubTabClick: (subTab: string) => void;
}> = ({ activeTab, activeSubTab, handleTabClick, handleSubTabClick }) => {
  // const { sharedState } = useContext(BidContext);

  const baseNavLinkStyles =
    "px-4 py-3 cursor-pointer rounded-md bg-transparent text-gray-hint_text font-medium transition-all duration-300 ease-in-out w-full hover:bg-gray-100";
  const activeNavLinkStyles = "bg-orange-active font-bold shadow-sm";

  const baseSubTabStyles =
    "pl-8 py-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 -ml-0.5";
  const activeSubTabStyles =
    "font-semibold text-orange-600 border-l-2 border-orange-500";

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

      <div className="flex flex-col ml-1 border-l border-gray-200">
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
          activeTab === "/proposal-planner" && activeNavLinkStyles
        )}
        onClick={() => handleTabClick("/proposal-planner")}
      >
        Bid Outline
      </span>
      <span
        className={cn(
          baseNavLinkStyles,
          activeTab === "/proposal-preview" && activeNavLinkStyles
        )}
        onClick={() => handleTabClick("/proposal-preview")}
      >
        Bid Enhancer
      </span>
    </div>
  );
};

export default BidNavbar;
