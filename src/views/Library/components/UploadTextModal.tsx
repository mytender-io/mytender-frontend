import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UploadText from "./UploadText.tsx";
import { FC } from "react";

interface UploadTextModalProps {
  show: boolean;
  onHide: (open: boolean) => void;
  folder: string | null | undefined;
  get_collections: () => void;
  fetchFolderContents?: (folder: string) => void;
  setUpdateTrigger?: (updater: (prev: number) => number) => void;
}

const UploadTextModal: FC<UploadTextModalProps> = ({
  show,
  onHide,
  folder,
  get_collections,
  fetchFolderContents,
  setUpdateTrigger
}) => {
  const handleOpenChange = (open: boolean) => {
    onHide(open);
    if (!open) {
      // Ensure the body pointer-events are reset when modal is closed
      document.body.style.pointerEvents = '';
    }
  };

  const handleClose = () => {
    onHide(false);
    if (setUpdateTrigger) {
      setUpdateTrigger((prev) => prev + 1);
    }
    if (folder && fetchFolderContents) {
      fetchFolderContents(folder);
    }
  };

  return (
    <Dialog open={show} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Text Uploader</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <UploadText
            folder={folder || ""}
            get_collections={get_collections}
            onClose={handleClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadTextModal; 