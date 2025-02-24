import React from "react";
import { FolderIcon, ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import ElipsisMenuIcon from "@/components/icons/ElipsisMenuIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import RecyclebinIcon from "@/components/icons/RecyclebinIcon";

interface EllipsisMenuProps {
  filename: string;
  unique_id: string;
  onDelete: () => void;
  availableFolders: string[];
  currentFolder: string;
  onMove: (newFolder: string) => void;
  isMoving?: boolean;
}

const EllipsisMenu: React.FC<EllipsisMenuProps> = ({
  filename,
  unique_id,
  onDelete,
  availableFolders,
  currentFolder,
  onMove,
  isMoving = false
}) => {
  // Filter out current folder from available folders and sort alphabetically
  const availableDestinations = availableFolders
    .filter((folder) => folder !== currentFolder)
    .sort((a, b) => {
      if (a === "default") return -1;
      if (b === "default") return 1;
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });

  return (
    <div>
      {isMoving ? (
        <div className="flex justify-end">
          <Spinner />
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-10 w-10 p-0 rounded-full bg-transparent hover:bg-gray-light focus-visible:ring-0 [&_svg]:w-3 [&_svg]:h-3"
            >
              <ElipsisMenuIcon className="text-gray-hint_text" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  <span>Move to</span>
                </DropdownMenuItem>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" className="w-[200px]">
                {availableDestinations.map((folder) => (
                  <DropdownMenuItem
                    key={folder}
                    onSelect={() => onMove(folder)}
                  >
                    <FolderIcon className="mr-2 h-4 w-4" />
                    <span className="text-nowrap">
                      {folder === "default"
                        ? "Whole Content Library"
                        : folder.replace(/FORWARDSLASH/g, "/")}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenuItem onClick={onDelete}>
              <RecyclebinIcon className="text-typo-900" />
              Delete File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default EllipsisMenu;
