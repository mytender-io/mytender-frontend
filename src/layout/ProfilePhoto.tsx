import React, { useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "../helper/Constants.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";

interface ProfilePhotoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({
  size = "md",
  className = ""
}) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const token = auth?.token || "default";

  const [profilePicture, setProfilePicture] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch profile picture
        const pictureResponse = await axios.get(
          `http${HTTP_PREFIX}://${API_URL}/get_company_logo`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        // Fetch username for fallback
        const profileResponse = await axios.get(
          `http${HTTP_PREFIX}://${API_URL}/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setProfilePicture(pictureResponse.data.image || "");
        setUsername(profileResponse.data.login || "");
        setLoading(false);
      } catch (err) {
        console.error("Failed to load profile photo:", err);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [token]);

  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}
      >
        <Spinner />
      </div>
    );
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {profilePicture ? (
        <AvatarImage
          src={`data:image/jpeg;base64,${profilePicture}`}
          alt="Profile"
          className="object-cover"
        />
      ) : null}
      <AvatarFallback className="bg-orange-lighter text-primary font-semibold">
        {username.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfilePhoto;
