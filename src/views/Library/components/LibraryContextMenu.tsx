import { File, FileText, Folder, Trash2 } from "lucide-react";
import { Menu, MenuItem } from "@mui/material";

interface Position {
  x: number;
  y: number;
}

interface LibraryContextMenuProps {
  /**
   * The position where the context menu should be anchored
   */
  anchorPosition: Position | null;

  /**
   * Whether the context menu is currently open
   */
  isOpen: boolean;

  /**
   * Callback function to handle closing the context menu
   */
  onClose: () => void;

  /**
   * Callback function to handle delete action
   */
  onDelete: () => void;

  /**
   * Whether the context menu is for a folder
   */
  isFolder: boolean;

  /**
   * Folder path for the current item
   */
  folderPath: string;

  /**
   * Callbacks for folder actions
   */
  onUploadPDF: (event: React.MouseEvent) => void;
  onUploadText: (event: React.MouseEvent) => void;
  onNewSubfolder: () => void;
}

const LibraryContextMenu: React.FC<LibraryContextMenuProps> = ({
  anchorPosition,
  isOpen,
  onClose,
  onDelete,
  isFolder,
  folderPath,
  onUploadPDF,
  onUploadText,
  onNewSubfolder
}) => {
  const handleUploadPDF = (event: React.MouseEvent) => {
    onUploadPDF(event);
    onClose();
  };

  const handleUploadText = (event: React.MouseEvent) => {
    onUploadText(event);
    onClose();
  };

  const handleNewSubfolder = () => {
    onNewSubfolder();
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <Menu
      open={isOpen}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        anchorPosition
          ? { top: anchorPosition.y, left: anchorPosition.x }
          : undefined
      }
      PaperProps={{
        elevation: 1,
        style: {
          width: "220px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
        }
      }}
    >
      {isFolder ? (
        <>
          <MenuItem onClick={handleUploadPDF} className="styled-menu-item">
            <File className="styled-menu-item-icon" />
            Upload PDF/Word/Excel
          </MenuItem>
          <MenuItem onClick={handleUploadText} className="styled-menu-item">
            <FileText className="styled-menu-item-icon" />
            Upload Text
          </MenuItem>
          <MenuItem onClick={handleNewSubfolder} className="styled-menu-item">
            <Folder className="styled-menu-item-icon" />
            New Subfolder
          </MenuItem>
          <MenuItem onClick={handleDelete} className="styled-menu-item">
            <Trash2 className="styled-menu-item-icon" />
            Delete Folder
          </MenuItem>
        </>
      ) : (
        <MenuItem onClick={handleDelete} className="styled-menu-item">
          <Trash2 className="styled-menu-item-icon" />
          Delete File
        </MenuItem>
      )}
    </Menu>
  );
};

export default LibraryContextMenu;
