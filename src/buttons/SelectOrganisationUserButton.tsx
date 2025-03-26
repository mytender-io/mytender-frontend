import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface SelectOrganisationUserButton {
  size?: "sm" | "md" | "lg";
  className?: string;
  onSelectUser?: (user: any) => void;
  selectedUser?: string;
  organizationUsers?: any[];
  isReviewReady?: boolean;
}

const SelectOrganisationUserButton: React.FC<SelectOrganisationUserButton> = ({
  size = "md",
  onSelectUser,
  selectedUser: initialSelectedUser,
  organizationUsers = [],
  isReviewReady = false
}) => {
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Initialize selected user when component mounts or when props change
  useEffect(() => {
    if (
      initialSelectedUser &&
      initialSelectedUser.trim() !== "" &&
      organizationUsers.length > 0
    ) {
      const matchedUser = organizationUsers.find(
        (user) => user.username === initialSelectedUser
      );
      if (matchedUser) {
        setSelectedUserData(matchedUser);
        setUsername(matchedUser.username || "");
        setProfilePicture(matchedUser.company_logo || "");
      } else {
        // If no match found but we have a name
        setUsername(initialSelectedUser);
        setProfilePicture("");
      }
    } else {
      // Reset to empty state if no initialSelectedUser or it's empty
      setSelectedUserData(null);
      setUsername("");
      setProfilePicture("");
    }
  }, [initialSelectedUser, organizationUsers]);

  const handleSelectUser = (user) => {
    setSelectedUserData(user);
    setUsername(user.username || "");
    setProfilePicture(user.company_logo || "");
    setDropdownOpen(false);

    if (onSelectUser) {
      onSelectUser(user);
    }
  };

  // Handle any clicks within the component to stop event propagation
  const handleComponentClick = (e) => {
    console.log("SelectOrganisationUserButton clicked");
    e.stopPropagation();
  };

  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  return (
    <div data-org-user-dropdown onClick={handleComponentClick}>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger
          className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 focus:outline-none"
          onClick={(e) => e.stopPropagation()} // Explicitly stop propagation on trigger click
        >
          <div className="relative">
            <Avatar className={`${sizeClasses[size]} me-2`}>
              {profilePicture ? (
                <AvatarImage
                  src={`data:image/jpeg;base64,${profilePicture}`}
                  alt="Company Logo"
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-orange-lighter text-primary font-semibold">
                {username ? username.slice(0, 1).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>

            {/* Review Ready Indicator */}

            {isReviewReady && (
              <div className="absolute bottom-0 right-0 bg-green-600 rounded-full p-0.5 border border-white shadow-sm z-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56 max-h-80 overflow-y-auto"
          onClick={(e) => e.stopPropagation()} // Explicitly stop propagation on menu content
        >
          {organizationUsers.length > 0 ? (
            organizationUsers.map((user, index) => (
              <DropdownMenuItem
                key={index}
                className="flex items-center gap-2 p-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation(); // Stop propagation on menu item click
                  handleSelectUser(user);
                }}
              >
                <Avatar className="h-8 w-8">
                  {user.company_logo ? (
                    <AvatarImage
                      src={`data:image/jpeg;base64,${user.company_logo}`}
                      alt="Company Logo"
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="bg-orange-lighter text-primary font-semibold">
                    {user.username
                      ? user.username.slice(0, 1).toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium truncate max-w-[160px]">
                  {user.username || "Unnamed User"}
                </span>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-2 text-center text-gray-500">
              No users available
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SelectOrganisationUserButton;
