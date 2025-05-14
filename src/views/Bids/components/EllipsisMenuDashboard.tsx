import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ElipsisMenuIcon from "@/components/icons/ElipsisMenuIcon";
import RecyclebinIcon from "@/components/icons/RecyclebinIcon";
import FeedbackIcon from "@/components/icons/FeedbackIcon";
import DuplicateIcon from "@/components/icons/DuplicateIcon";
import EditIcon from "@/components/icons/EditIcon";
import { Spinner } from "@/components/ui/spinner";

interface EllipsisMenuDashboardProps {
  onDeleteClick: () => void;
  onFeedbackClick: () => void;
  onDuplicateClick: () => Promise<void>;
  onEditClick: () => void;
  disabled?: boolean;
}

const EllipsisMenuDashboard: React.FC<EllipsisMenuDashboardProps> = ({
  onDeleteClick,
  onFeedbackClick,
  onDuplicateClick,
  onEditClick,
  disabled = false
}) => {
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDuplicateClick = async () => {
    setIsDuplicating(true);
    setMenuOpen(false); // Close the dropdown when duplication starts

    try {
      await onDuplicateClick();
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <>
      {isDuplicating ? (
        // Show spinner when duplicating
        <Button
          variant="ghost"
          className={`h-10 w-10 p-0 rounded-full bg-transparent pointer-events-none`}
        >
          <Spinner className="h-5 w-5" />
        </Button>
      ) : (
        // Show normal dropdown when not duplicating
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild disabled={disabled}>
            <Button
              variant="ghost"
              className={`h-10 w-10 p-0 rounded-full bg-transparent hover:bg-gray-light focus-visible:ring-0 [&_svg]:w-3 [&_svg]:h-3 ${
                disabled
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : ""
              }`}
            >
              <ElipsisMenuIcon
                className={`${disabled ? "text-gray-300" : "text-gray-hint_text"}`}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[150px]">
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2"
              onClick={onEditClick}
              disabled={disabled}
            >
              <EditIcon className="h-4 w-4" />
              Edit Bid
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2"
              onClick={handleDuplicateClick}
              disabled={disabled}
            >
              <DuplicateIcon className="h-4 w-4" />
              Duplicate Bid
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDeleteClick} disabled={disabled}>
              <RecyclebinIcon className="text-typo-900" />
              Delete Bid
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2"
              onClick={onFeedbackClick}
              disabled={disabled}
            >
              <FeedbackIcon className="h-4 w-4" />
              Add Feedback
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};

export default EllipsisMenuDashboard;
