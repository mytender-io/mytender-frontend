import React, { useState } from "react";
import withAuth from "@/routes/withAuth";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation";
import LibraryContent from "./LibraryContent"; // Component for the existing library content
import CaseStudies from "./CaseStudies";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/utils";

const Library = () => {
  const [activeTab, setActiveTab] = useState("library");

  const baseNavLinkStyles =
    "mr-6 text-base font-semibold text-gray-hint_text hover:text-orange px-3 py-2.5 cursor-pointer transition-all duration-300 ease-in-out relative";
  const activeNavLinkStyles = "text-orange";

  // Get width and position for the sliding indicator
  const getIndicatorStyle = () => {
    // Define widths for each tab
    const tabWidths = {
      library: 130, // Width for "Company Library"
      "case-studies": 110 // Width for "Case Studies"
    };

    // Define positions (cumulative widths plus margins)
    const tabPositions = {
      library: 0,
      "case-studies": tabWidths["library"] + 24 // 24px for margin
    };

    return {
      width: `${tabWidths[activeTab as keyof typeof tabWidths] || 100}px`,
      transform: `translateX(${tabPositions[activeTab as keyof typeof tabPositions] || 0}px)`,
      opacity: activeTab ? 1 : 0
    };
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const parentPages = [] as Array<{ name: string; path: string }>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between w-full border-b border-typo-200 px-6 py-2 min-h-14">
        <BreadcrumbNavigation
          currentPage="Content Library"
          parentPages={parentPages}
        />
      </div>
      <div className="flex justify-between items-center border-b border-gray-line">
        <div className="flex items-center mt-3 mb-1 px-3 relative">
          {/* Sliding indicator */}
          <div
            className="absolute -bottom-1 h-0.5 bg-orange transition-all duration-300 ease-in-out"
            style={getIndicatorStyle()}
          />

          <span
            className={cn(
              baseNavLinkStyles,
              activeTab === "library" && activeNavLinkStyles
            )}
            onClick={() => handleTabClick("library")}
          >
            Company Library
          </span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    baseNavLinkStyles,
                    activeTab === "case-studies" && activeNavLinkStyles
                  )}
                  onClick={() => handleTabClick("case-studies")}
                >
                  Case Studies
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                align="center"
                sideOffset={5}
                className="flex flex-col items-center max-w-[200px] text-center"
              >
                <TooltipArrow className="text-primary" />
                <p>
                  Upload Case Studies here to directly reference them in the Bid
                  Inputs Page
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === "library" ? <LibraryContent /> : <CaseStudies />}
      </div>
    </div>
  );
};

export default withAuth(Library);
