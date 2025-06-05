import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UploadPDF from "@/components/UploadPDF.tsx";
import { API_URL, HTTP_PREFIX } from "../../../helper/Constants.tsx";
import { FC } from "react";

interface UploadPDFModalProps {
  show: boolean;
  onHide: (open: boolean) => void;
  folder: string | null | undefined;
  get_collections: () => void;
  onClose: () => void;
}

const UploadPDFModal: FC<UploadPDFModalProps> = ({
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
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <UploadPDF
            folder={folder || ""}
            get_collections={get_collections}
            onClose={onClose}
            apiUrl={`http${HTTP_PREFIX}://${API_URL}/uploadfile/`}
            descriptionText="Upload previous bids here for the AI to use as context in the Q&A Generator. This might take a while for large documents because we need to convert the documents into a format the AI can understand so sit tight!"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadPDFModal; 