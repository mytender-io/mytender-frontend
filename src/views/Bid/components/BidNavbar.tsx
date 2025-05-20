import React, { useContext } from "react";
import { BidContext } from "@/views/BidWritingStateManagerView";
import { cn } from "@/utils";

const BidNavbar: React.FC<{
  activeTab: string;
  handleTabClick: (path: string) => void;
}> = ({ activeTab, handleTabClick }) => {
  const { sharedState } = useContext(BidContext);

  const baseNavLinkStyles =
    "px-4 py-3 cursor-pointer rounded-md bg-transaprent text-gray-hint_text font-medium transition-all duration-300 ease-in-out w-full";
  const activeNavLinkStyles = "bg-orange-active font-bold";

  return (
    <div className="flex flex-col relative">
      <span
        className={cn(
          baseNavLinkStyles,
          activeTab === "/bid-extractor" && activeNavLinkStyles
        )}
        onClick={() => handleTabClick("/bid-extractor")}
      >
        Tender Insights
      </span>
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
      {/* <SaveStatus
          isLoading={sharedState.isLoading}
          saveSuccess={sharedState.saveSuccess} */}
    </div>
  );
};

export default BidNavbar;
