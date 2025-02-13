import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const BreadcrumbNavigation = ({
  currentPage,
  parentPages = [] as Array<{ name: string; path: string }>,
  showHome = true
}: {
  currentPage: string;
  parentPages?: Array<{ name: string; path: string }>;
  showHome?: boolean;
}) => {
  return (
    <nav className="flex items-center gap-2 rounded-lg">
      {parentPages.map((page) => (
        <React.Fragment key={page.path}>
          <Link
            to={page.path}
            className="font-medium text-orange hover:text-orange-hover transition-colors ease-in-out"
          >
            {page.name}
          </Link>
          <ChevronRight className="w-4 h-4 text-breadcrumb" />
        </React.Fragment>
      ))}
      {currentPage && (
        <span className="text-gray-black font-semibold">{currentPage}</span>
      )}
    </nav>
  );
};

export default BreadcrumbNavigation;
