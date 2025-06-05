import { FC } from "react";
import { DeleteConfirmationDialog } from "@/modals/DeleteConfirmationModal.tsx";

interface DeleteFileModalProps {
  show: boolean;
  onHide: () => void;
  onDelete: () => void;
  fileName: string;
}

const DeleteFileModal: FC<DeleteFileModalProps> = ({
  show,
  onHide,
  onDelete,
  fileName
}) => (
  <DeleteConfirmationDialog
    isOpen={show}
    onClose={onHide}
    onConfirm={onDelete}
    title="Delete File"
    message={`Are you sure you want to delete the file "${fileName}"?`}
  />
);

export default DeleteFileModal; 