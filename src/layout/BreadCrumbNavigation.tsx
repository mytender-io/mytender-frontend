import React, { ReactNode, useContext } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import SupportChat from "@/components/SupportChat";
import ProfilePhoto from "@/layout/ProfilePhoto";
import { useUserData } from "@/context/UserDataContext";
import SaveStatus from "@/views/Bid/components/SaveStatus";
import { BidContext } from "@/views/BidWritingStateManagerView";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import LogoutIcon from "@/components/icons/LogoutIcon";

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
  const { userProfile, organizationUsers, isLoading } = useUserData();
  const { sharedState, setSharedState } = useContext(BidContext);

  const shouldShowSaveStatus = parentPages.length > 0 && sharedState?.object_id;

  return (
    <nav className="flex items-center justify-between w-full rounded-lg">
      <div className="flex items-center gap-3">
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
        {shouldShowSaveStatus && (
          <SaveStatus
            isLoading={sharedState.isLoading}
            saveSuccess={sharedState.saveSuccess}
          />
        )}
      </div>
      <div className="flex items-center gap-4">
        {rightContent}
        <SupportChat />
        <div className="relative">
          <Popover>
            <PopoverTrigger asChild>
              <div>
                <ProfilePhoto
                  size="md"
                  showTeamMembers={true}
                  userProfile={userProfile}
                  organizationUsers={organizationUsers}
                  isLoading={isLoading}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="flex flex-col gap-1">
                <Link
                  to="/logout"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors text-black hover:text-black/70"
                >
                  <LogoutIcon
                    className="text-gray-hint_text"
                    width={16}
                    height={16}
                  />
                  <span className="text-sm font-medium">Logout</span>
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  );
};

export default BreadcrumbNavigation;
