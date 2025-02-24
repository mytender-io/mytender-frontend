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
}

const EllipsisMenuDashboard: React.FC<EllipsisMenuDashboardProps> = ({
  onClick
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 w-10 p-0 rounded-full bg-transparent hover:bg-gray-light focus-visible:ring-0 [&_svg]:w-3 [&_svg]:h-3"
        >
          <ElipsisMenuIcon className="text-gray-hint_text" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[120px]">
        <DropdownMenuItem onClick={onClick}>
          <RecyclebinIcon className="text-typo-900" />
          Delete Bid
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EllipsisMenuDashboard;
