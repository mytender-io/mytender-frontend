import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import ElipsisMenuIcon from "@/components/icons/ElipsisMenuIcon";
import RecyclebinIcon from "@/components/icons/RecyclebinIcon";

const UploadButtonWithDropdown = ({
  folder,
  handleShowPDFModal,
  handleShowTextModal,
  setShowDeleteFolderModal,
  setFolderToDelete,
  handleNewFolderClick
}) => {
  const handlePDFClick = (event) => {
    event.stopPropagation();
    handleShowPDFModal(event, folder);
  };

  const handleTextClick = (event) => {
    event.stopPropagation();
    handleShowTextModal(event, folder);
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    setFolderToDelete(folder);
    setShowDeleteFolderModal(true);
  };

  const handleNewSubfolderClick = (event) => {
    event.stopPropagation();
    handleNewFolderClick(folder);
  };

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
      <DropdownMenuContent className="w-[220px]">
        <DropdownMenuItem onClick={handlePDFClick}>
          <i className="fas fa-file-pdf mr-2" />
          Upload PDF/Word/Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTextClick}>
          <i className="fas fa-file-alt mr-2" />
          Upload Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleNewSubfolderClick}>
          <i className="fas fa-folder mr-2" />
          New Subfolder
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDeleteClick}>
          <RecyclebinIcon className="text-typo-900" />
          Delete Folder
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { UploadButtonWithDropdown };
