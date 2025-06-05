import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UploadZip from "@/components/UploadZip.tsx";
import { FC } from "react";

interface UploadZipModalProps {
  show: boolean;
  onHide: (open: boolean) => void;
  folder: string | null | undefined;
  get_collections: () => void;
  onClose: () => void;
}

const UploadZipModal: FC<UploadZipModalProps> = ({
  show,
  onHide,
  folder,
  get_collections,
  onClose
}) => {
  const handleOpenChange = (open: boolean) => {
    onHide(open);
    if (!open) {
      // Ensure the body pointer-events are reset when modal is closed
      document.body.style.pointerEvents = '';
    }
  };

  return (
    <Dialog open={show} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Zip Folder</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <UploadZip
            folder={folder || ""}
            get_collections={get_collections}
            onClose={onClose}
            descriptionText="Upload ZIP files containing multiple documents. The system will extract and process all files in the ZIP. This might take a while for large archives as we need to convert the documents into a format the AI can understand."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadZipModal; 