import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faArrowDown,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import ElipsisMenuIcon from "@/components/icons/ElipsisMenuIcon";

interface SectionControlsProps {
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const SectionControls: React.FC<SectionControlsProps> = ({
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}) => {
  const handleAction = (action: () => void) => (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click event
    action();
  };

  return (
    <div className="flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-10 w-10 p-0 rounded-full bg-transparent hover:bg-gray-light focus-visible:ring-0"
            onClick={(e) => e.stopPropagation()}
          >
            <ElipsisMenuIcon className="text-gray-hint_text" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40">
          {!isFirst && (
            <DropdownMenuItem onClick={handleAction(onMoveUp)}>
              <FontAwesomeIcon icon={faArrowUp} className="mr-2 h-4 w-4" />
              Move Up
            </DropdownMenuItem>
          )}
          {!isLast && (
            <DropdownMenuItem onClick={handleAction(onMoveDown)}>
              <FontAwesomeIcon icon={faArrowDown} className="mr-2 h-4 w-4" />
              Move Down
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleAction(onDelete)}>
            <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SectionControls;
