import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

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

  const handleEditClick = () => {
    setIsEditing(true);
  };

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
    setShowModal(false); // Close the FileContentModal
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center">File Content</DialogTitle>
        </DialogHeader>

        <div className="relative h-[500px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
              <Spinner />
            </div>
          )}

          {isEditing ? (
            <Textarea
              className="h-full w-full p-5 whitespace-pre-wrap break-words resize-none"
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
            />
          ) : (
            <pre className="h-full w-full p-5 whitespace-pre-wrap break-words overflow-x-hidden rounded border">
              {modalContent}
            </pre>
          )}
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
