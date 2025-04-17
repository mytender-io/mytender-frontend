import React, { useState, useEffect, useRef } from "react";
import { useAuthUser } from "react-auth-kit";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "../helper/Constants.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/utils";

interface ProfilePhotoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  refreshImage?: boolean;
  showTeamMembers?: boolean;
  showName?: boolean;
  answererId?: string;
}

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({
  size = "md",
  className = "",
  showTeamMembers = false,
  refreshImage = false,
  showName = false,
  answererId = ""
}) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [organizationUsers, setOrganizationUsers] = useState([]);

  // Fetch current user profile if needed
  useEffect(() => {
    const fetchProfileData = async () => {
      if (answererId) return; // Skip if we're trying to show another user's profile

      setLoading(true);
      try {
        const profileResponse = await axios.get(
          `http${HTTP_PREFIX}://${API_URL}/profile`,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`
            }
          }
        );
        
        setUserProfile(profileResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load profile photo:", err);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [answererId, refreshImage]);

  // Fetch organization users when needed
  useEffect(() => {
    const fetchOrganizationUsers = async () => {
      if (!answererId && !showTeamMembers) return; // Skip if we don't need org users

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("include_pending", "false");

        const response = await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/get_organization_users`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );
        setOrganizationUsers(response.data);

        // If we have an answererId, find and set the matching user profile
        if (answererId && response.data.length > 0) {
          const matchedUser = response.data.find(
            (user) => user.username === answererId
          );
          
          if (matchedUser) {
            setUserProfile(matchedUser);
            setUserProfile({
              login: matchedUser.username,
              company_logo: matchedUser.company_logo,
              email: matchedUser.email
            });
          } else {
            // Fallback to displaying initials if no matching user found
            setUserProfile({
              login: answererId,
              company_logo: ""  // Empty string for consistent fallback handling
            });
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching organization users:", err);
        // Fallback for errors
        if (answererId) {
          setUserProfile({
            login: answererId,
            company_logo: ""
          });
        }
        setLoading(false);
      }
    };

    fetchOrganizationUsers();
  }, [answererId, showTeamMembers]);

  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  if (loading) {
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

  // Only show up to 3 organisation users
  const displayedUsers = organizationUsers.slice(0, 3);

  // Make sure we have a profile to display with consistent fallback
  const displayProfile = userProfile || {
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