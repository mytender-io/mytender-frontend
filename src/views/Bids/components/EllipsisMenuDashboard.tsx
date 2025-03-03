import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ElipsisMenuIcon from "@/components/icons/ElipsisMenuIcon";
import RecyclebinIcon from "@/components/icons/RecyclebinIcon";

interface EllipsisMenuDashboardProps {
  onClick: () => void;
  disabled?: boolean;
}

const EllipsisMenuDashboard: React.FC<EllipsisMenuDashboardProps> = ({
  onClick,
  disabled = false
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="ghost"
          className={`h-10 w-10 p-0 rounded-full bg-transparent hover:bg-gray-light focus-visible:ring-0 [&_svg]:w-3 [&_svg]:h-3 ${
            disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
          }`}
        >
          <ElipsisMenuIcon className={`${disabled ? "text-gray-300" : "text-gray-hint_text"}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[120px]">
        <DropdownMenuItem onClick={onClick} disabled={disabled}>
          <RecyclebinIcon className="text-typo-900" />
          Delete Bid
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EllipsisMenuDashboard;