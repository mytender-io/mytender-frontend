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

  const [profile, setProfile] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [organizationUsers, setOrganizationUsers] = useState([]);
  const [answererProfile, setAnswererProfile] = useState({});

  useEffect(() => {
    const fetchProfileData = async () => {
      // Only use localStorage if token hasn't changed and refreshImage is false
      const cachedProfile = localStorage.getItem("userProfile");
      const savedToken = localStorage.getItem("cachedToken");

      if (cachedProfile && savedToken === tokenRef.current && !refreshImage) {
        setProfile(JSON.parse(cachedProfile));
        return;
      }

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
        setProfile(profileResponse.data);
        // Save to localStorage along with the current token
        localStorage.setItem(
          "userProfile",
          JSON.stringify(profileResponse.data)
        );
        localStorage.setItem("cachedToken", tokenRef.current);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load profile photo:", err);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [tokenRef, refreshImage]);

  useEffect(() => {
    const fetchOrganizationUsers = async () => {
      // Only use localStorage if token hasn't changed
      const cachedProfile = localStorage.getItem("userProfile");
      const cachedOrgUsers = localStorage.getItem("organizationUsers");
      const savedToken = localStorage.getItem("cachedToken");

      if (
        cachedProfile &&
        cachedOrgUsers &&
        savedToken === tokenRef.current &&
        cachedProfile._id === profile._id
      ) {
        setOrganizationUsers(JSON.parse(cachedOrgUsers));
        return;
      }

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
        // Save to localStorage along with current token (if not already saved)
        localStorage.setItem(
          "organizationUsers",
          JSON.stringify(response.data)
        );
        localStorage.setItem("cachedToken", tokenRef.current);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching organization users:", err);
        setLoading(false);
      }
    };

    if (profile.userType === "owner") {
      fetchOrganizationUsers();
    }
  }, [tokenRef, profile]);

  useEffect(() => {
    if (answererId) {
      // First, try to find a match in organization users
      if (organizationUsers.length > 0) {
        const matchedUser = organizationUsers.find(
          (user) => user.username === answererId
        );
        if (matchedUser) {
          setAnswererProfile(matchedUser);
          return;
        }
      }

      // If no match found in org users, check if it's the current user
      if (profile && profile.login === answererId) {
        setAnswererProfile(profile);
        return;
      }
      // If neither matches, set to empty object
      setAnswererProfile({});
    } else {
      // No answererId provided
      setAnswererProfile({});
    }
  }, [organizationUsers, answererId, profile]);

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

  // Only show up to 3 organization users
  const displayedUsers = organizationUsers.slice(0, 3);
  const activeProfile = answererId ? answererProfile : profile;

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
                {activeProfile.company_logo ? (
                  <AvatarImage
                    src={`data:image/jpeg;base64,${activeProfile.company_logo}`}
                    alt="Profile"
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-orange-lighter text-primary font-semibold">
                    {activeProfile.login?.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <div>
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold">{activeProfile.login}</p>
                    <p className="text-xs">{activeProfile.email}</p>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
          {showName && (
            <span className="font-medium text-gray-600">{profile.login}</span>
          )}
        </div>
        {showTeamMembers &&
          profile.userType === "owner" &&
          displayedUsers.length > 0 && (
            <div className="flex -space-x-3 -ml-3 opacity-50">
              {displayedUsers.map((member, index: number) => (
                <Tooltip key={member?.email}>
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
                            {member.username?.slice(0, 1).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div>
                      <p className="font-semibold">{member.username}</p>
                      <p className="text-xs">{member.email}</p>
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
