import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/index.ts";
import LibraryContent from "./LibraryContent"; // Component for the existing library content
import CaseStudies from "./CaseStudies";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation";
import withAuth from "@/routes/withAuth";

const Library = () => {
  const [activeTab, setActiveTab] = useState("library");

  const baseNavLinkStyles =
    "mr-6 text-base font-semibold text-gray-hint_text hover:text-orange px-3 py-2.5 cursor-pointer transition-all duration-300 ease-in-out relative";
  const activeNavLinkStyles =
    "text-orange after:content-[''] after:absolute after:bottom-[-0.3rem] after:left-0 after:w-full after:h-[0.1rem] after:bg-orange after:transition-[width] after:duration-1000 after:ease-in-out after:delay-1000";

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const parentPages = [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between w-full border-b border-typo-200 px-6 py-2 min-h-[3.43785rem]">
        <BreadcrumbNavigation
          currentPage="Content Library"
          parentPages={parentPages}
          showHome={true}
        />
      </div>
      <div className="flex justify-between items-center border-b border-gray-line">
        <div className="flex items-center mt-3 mb-1 px-3">
          <button
            className={cn(
              baseNavLinkStyles,
              activeTab === "library" && activeNavLinkStyles
            )}
            onClick={() => handleTabClick("library")}
          >
            Company Library
          </button>
          <button
            className={cn(
              baseNavLinkStyles,
              activeTab === "case-studies" && activeNavLinkStyles
            )}
            onClick={() => handleTabClick("case-studies")}
          >
            Case Studies
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "library" ? <LibraryContent /> : <CaseStudies />}
      </div>
    </div>
  );
};

export default withAuth(Library);
