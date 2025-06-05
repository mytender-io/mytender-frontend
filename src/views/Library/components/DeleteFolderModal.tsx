import { FC } from "react";
import { DeleteConfirmationDialog } from "@/modals/DeleteConfirmationModal.tsx";

interface DeleteFolderModalProps {
  show: boolean;
  onHide: () => void;
  onDelete: (folderTitle: string) => void;
  folderTitle: string;
}

const DeleteFolderModal: FC<DeleteFolderModalProps> = ({
  show,
  onHide,
  onDelete,
  folderTitle
}) => {
  const displayFolderName = folderTitle
    .replace(/FORWARDSLASH/g, "/")
    .replace(/_/g, " ");

  return (
    <DeleteConfirmationDialog
      isOpen={show}
      onClose={onHide}
      onConfirm={() => onDelete(folderTitle)}
      title="Delete Folder"
      message={`Are you sure you want to delete the folder "${displayFolderName}"?`}
    />
  );
};

export default DeleteFolderModal; 