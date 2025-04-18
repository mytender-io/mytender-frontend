import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/utils";

// Define interfaces for the expected data structures
interface UserProfile {
  login?: string;
  company_logo?: string;
  email?: string;
  userType?: string;
  [key: string]: any; // For any additional properties
}

interface OrganizationUser {
  username: string;
  company_logo?: string;
  email: string;
  [key: string]: any; // For any additional properties
}

interface ProfilePhotoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showTeamMembers?: boolean;
  showName?: boolean;
  answererId?: string;
  userProfile?: UserProfile | null;
  organizationUsers?: OrganizationUser[];
  isLoading?: boolean;
}

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({
  size = "md",
  className = "",
  showTeamMembers = false,
  showName = false,
  answererId = "",
  userProfile = null,
  organizationUsers = [],
  isLoading = false
}) => {
  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          sizeClasses[size],
          className
        )}
      >
        <Spinner />
      </div>
    );
  }

  // Determine which profile to display
  let displayProfile = userProfile;
  
  // If we need to show another user's profile (answererId is provided)
  if (answererId && organizationUsers.length > 0) {
    const matchedUser = organizationUsers.find(
      (user) => user.username === answererId
    );
    
    if (matchedUser) {
      displayProfile = {
        login: matchedUser.username,
        company_logo: matchedUser.company_logo,
        email: matchedUser.email
      };
    } else {
      // Fallback to displaying initials if no matching user found
      displayProfile = {
        login: answererId,
        company_logo: ""  // Empty string for consistent fallback handling
      };
    }
  }

  // Only show up to 3 organisation users
  const displayedUsers = organizationUsers.slice(0, 3);

  // Make sure we have a profile to display with consistent fallback
  displayProfile = displayProfile || {
    login: answererId || "User",
    company_logo: ""
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar
                className={cn(
                  "border border-gray-300",
                  sizeClasses[size],
                  className,
                  "cursor-pointer z-50"
                )}
              >
                {displayProfile.company_logo ? (
                  <AvatarImage
                    src={`data:image/jpeg;base64,${displayProfile.company_logo}`}
                    alt="Profile"
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-orange-lighter text-primary font-semibold">
                    {displayProfile.login?.slice(0, 1).toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <div>
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold">{displayProfile.login || "User"}</p>
                    {displayProfile.email && (
                      <p className="text-xs">{displayProfile.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
          {showName && (
            <span className="font-medium text-gray-600">
              {displayProfile.login || "User"}
            </span>
          )}
        </div>
        {showTeamMembers &&
          userProfile?.userType === "owner" &&
          displayedUsers.length > 0 && (
            <div className="flex -space-x-3 -ml-3 opacity-50">
              {displayedUsers.map((member, index) => (
                <Tooltip key={member?.email || index}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "relative",
                        index === 0
                          ? "z-[49]"
                          : index === 1
                            ? "z-[48]"
                            : index === 2
                              ? "z-[47]"
                              : ""
                      )}
                    >
                      <Avatar
                        className={cn(
                          "border border-gray-300",
                          sizeClasses.md,
                          "cursor-pointer"
                        )}
                      >
                        {member.company_logo ? (
                          <AvatarImage
                            src={`data:image/jpeg;base64,${member.company_logo}`}
                            alt={member.username}
                            className="object-cover"
                          />
                        ) : (
                          <AvatarFallback className="bg-orange-lighter text-primary font-semibold text-xs">
                            {member.username?.slice(0, 1).toUpperCase() || "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div>
                      <p className="font-semibold">{member.username || "User"}</p>
                      <p className="text-xs">{member.email || ""}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
              {organizationUsers.length > 3 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar
                      className={cn(
                        "border border-gray-300",
                        sizeClasses.md,
                        "bg-gray-100"
                      )}
                    >
                      <AvatarFallback className="text-gray-500 text-xs font-medium">
                        +{organizationUsers.length - 3}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      {organizationUsers.length - 3} more team members
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
      </TooltipProvider>
    </div>
  );
};

export default ProfilePhoto;