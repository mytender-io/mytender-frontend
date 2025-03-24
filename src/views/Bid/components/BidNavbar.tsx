import React, { useContext } from "react";
import { BidContext, Section } from "../../BidWritingStateManagerView";
// import { faEdit, faEye, faUsers } from "@fortawesome/free-solid-svg-icons";
import BidTitle from "../../../components/BidTitle";
import GenerateProposalModal from "../../../modals/GenerateProposalModal";
import SaveStatus from "@/components/SaveStatus";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import PlusIcon from "@/components/icons/PlusIcon";

const BidNavbar: React.FC<{
  showViewOnlyMessage: () => void;
  initialBidName: string;
  description?: string;
  outline?: Section[];
  object_id?: string | null;
  handleRegenerateClick?: () => void;
  activeTab: string;
  handleTabClick: (path: string) => void;
}> = ({
  showViewOnlyMessage,
  initialBidName,
  description,
  outline,
  object_id,
  handleRegenerateClick,
  activeTab,
  handleTabClick
}) => {
  const { sharedState } = useContext(BidContext);

  const baseNavLinkStyles =
    "mr-6 text-base font-semibold text-gray-hint_text hover:text-orange px-3 py-2.5 cursor-pointer transition-all duration-300 ease-in-out relative";
  const activeNavLinkStyles = "text-orange";

  // Get width and position for the sliding indicator
  const getIndicatorStyle = () => {
    // Define widths for each tab (adjust these values based on your actual text widths)
    const tabWidths = {
      "/bid-extractor": 120, // Width for "Tender Insights"
      "/bid-intel": 90, // Width for "Bid Inputs"
      "/proposal-planner": 85, // Width for "Bid Outline"
      "/proposal-preview": 110 // Width for "Bid Enhancer"
    };

    // Define positions (cumulative widths plus margins)
    const tabPositions = {
      "/bid-extractor": 0,
      "/bid-intel": tabWidths["/bid-extractor"] + 24, // 24px for margin
      "/proposal-planner":
        tabWidths["/bid-extractor"] + tabWidths["/bid-intel"] + 48,
      "/proposal-preview":
        tabWidths["/bid-extractor"] +
        tabWidths["/bid-intel"] +
        tabWidths["/proposal-planner"] +
        72
    };
    return {
      width: `${tabWidths[activeTab as keyof typeof tabWidths] || 100}px`,
      transform: `translateX(${tabPositions[activeTab as keyof typeof tabPositions] || 0}px)`,
      opacity: activeTab ? 1 : 0
    };
  };

  return (
    <div>
      <div className="space-y-2">
        <BidTitle
          canUserEdit={true}
          showViewOnlyMessage={showViewOnlyMessage}
          initialBidName={initialBidName}
        />
        <span className="block text-base text-gray-hint_text">
          {description}
        </span>
      </div>

      <div>
        <div className="flex justify-between items-center border-b border-gray-line">
          <div className="flex items-center mt-3 mb-1 relative">
            {/* Sliding indicator */}
            <div
              className="absolute -bottom-1 h-0.5 bg-orange transition-all duration-300 ease-in-out"
              style={getIndicatorStyle()}
            />

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
            <SaveStatus
              isLoading={sharedState.isLoading}
              saveSuccess={sharedState.saveSuccess}
            />
          </div>
          {activeTab === "/proposal-planner" &&
          outline &&
          outline.length > 0 ? (
            <div className="flex items-center flex-shrink-0 gap-2">
              <Button variant="outline" onClick={handleRegenerateClick}>
                <PlusIcon />
                New Outline
              </Button>
              <GenerateProposalModal
                bid_id={object_id}
                handleTabClick={handleTabClick}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BidNavbar;
