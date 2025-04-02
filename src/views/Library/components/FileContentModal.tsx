import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import posthog from "posthog-js";

const FileContentModal = ({
  showModal,
  setShowModal,
  modalContent,
  onSave,
  documentId,
  fileName,
  folderName,
  onViewPdf,
  isLoading
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(modalContent);
  console.log("isloading", isLoading);

  useEffect(() => {
    setEditableContent(modalContent);
  }, [modalContent]);

  const handleSaveClick = () => {
    onSave(editableContent);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditableContent(modalContent);
  };

  const handleViewPdfClick = () => {
    onViewPdf(fileName, folderName);

    posthog.capture("view_pdf_file", {
      file_name: fileName,
      profile_name: folderName
    });

    setShowModal(false);
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center">File Content</DialogTitle>
        </DialogHeader>
        <div className="relative h-[500px] w-full max-w-full overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
              <Spinner />
            </div>
          )}

          <div className="h-full w-full overflow-auto">
            <pre className="w-full p-5 whitespace-pre-wrap break-all rounded border overflow-hidden">
              {modalContent}
            </pre>
          </div>
        </div>

        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button onClick={handleSaveClick}>Save Changes</Button>
            </>
          ) : (
            <>
              {fileName && fileName.endsWith(".pdf") && (
                <Button onClick={handleViewPdfClick}>View PDF Uploaded</Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileContentModal;

