import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import SupportChat from "@/components/SupportChat";
import ProfilePhoto from "@/layout/ProfilePhoto";

const BreadcrumbNavigation = ({
  currentPage,
  parentPages = [] as Array<{ name: string; path: string }>,
  refreshImage = false,
  rightContent
}: {
  currentPage: string;
  parentPages?: Array<{ name: string; path: string }>;
  rightContent?: ReactNode;
  refreshImage?: boolean;
}) => {
  return (
    <nav className="flex items-center justify-between w-full rounded-lg">
      <div className="flex items-center gap-2">
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
      </div>

      <div className="flex items-center gap-4">
        {rightContent}
        <SupportChat />
        <ProfilePhoto
          size="md"
          refreshImage={refreshImage}
          showTeamMembers={true}
        />
      </div>
    </nav>
  );
};

export default BreadcrumbNavigation;
