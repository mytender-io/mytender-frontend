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
}

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({
  size = "md",
  className = "",
  showTeamMembers = false,
  refreshImage = false
}) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
   const tokenRef = useRef(auth?.token || "default");

  const [profile, setProfile] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [organizationUsers, setOrganizationUsers] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
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
        console.log(response);
        setOrganizationUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching organization users:", err);
        setLoading(false);
      }
    };

    if (profile.userType === "owner" && showTeamMembers) {
      fetchOrganizationUsers();
    }
  }, [tokenRef, profile, showTeamMembers]);

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

  return (
    <div className="flex items-center">
      <TooltipProvider>
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
              {profile.company_logo ? (
                <AvatarImage
                  src={`data:image/jpeg;base64,${profile.company_logo}`}
                  alt="Profile"
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-orange-lighter text-primary font-semibold">
                {profile.login?.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <div className="flex items-center">
                <div>
                  <p className="font-semibold">{profile.login}</p>
                  <p className="text-xs">{profile.email}</p>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
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
                        {member.image ? (
                          <AvatarImage
                            src={`data:image/jpeg;base64,${member.image}`}
                            alt={member.username}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-orange-lighter text-primary font-semibold text-xs">
                          {member.username?.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
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
