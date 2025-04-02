import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import SelectFile from "@/components/SelectFile";
import { toast } from "react-toastify";

const SelectFilePopup = ({
  onSaveSelectedFiles,
  initialSelectedFiles = []
}) => {
  console.log(
    "SelectFilePopup RENDER - initialSelectedFiles:",
    initialSelectedFiles
  );

  const [open, setOpen] = useState(false);

  // Store a reference to the initial files so we can compare changes
  const initialFilesRef = useRef(initialSelectedFiles);

  // Track both the file IDs and full metadata
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFilesMetadata, setSelectedFilesMetadata] = useState([]);

  // Define maximum number of allowed files
  const MAX_FILES = 3;

  // This flag helps prevent circular updates
  const processingUpdateRef = useRef(false);

  console.log("initialselectedfiiles");
  console.log(initialSelectedFiles);

  // Log when selected files change
  useEffect(() => {
    console.log(
      "SelectFilePopup EFFECT - selectedFiles changed:",
      selectedFiles
    );
  }, [selectedFiles]);

  const handleFileSelection = (files) => {
    console.log(
      "SelectFilePopup - Files selected in SelectFile component:",
      files
    );

    // Check if the user is trying to select more than MAX_FILES
    if (files.length > MAX_FILES) {
      // Show toast notification about the file limit
      toast.warning(
        `You can select a maximum of ${MAX_FILES} documents. Only the first ${MAX_FILES} will be used.`
      );

      // Limit to first MAX_FILES
      const limitedFiles = files.slice(0, MAX_FILES);

      // Store the limited metadata objects
      setSelectedFilesMetadata(limitedFiles);

      // Extract just the IDs to match SelectFile's expectations
      const fileIds = limitedFiles.map((file) => file.unique_id);
      console.log("SelectFilePopup - Limited to first 3 files:", fileIds);

      setSelectedFiles(fileIds);
    } else {
      // Store the full metadata objects
      setSelectedFilesMetadata(files);

      // Extract just the IDs to match SelectFile's expectations
      const fileIds = files.map((file) => file.unique_id);
      console.log("SelectFilePopup - Extracted file IDs:", fileIds);

      setSelectedFiles(fileIds);
    }
  };

  const handleSave = () => {
    console.log(
      "SelectFilePopup - Saving selected files:",
      selectedFilesMetadata
    );

    // Set the processing flag to prevent circular updates
    processingUpdateRef.current = true;

    try {
      // Pass the full metadata objects to the parent
      onSaveSelectedFiles(selectedFilesMetadata);
    } finally {
      // Reset the processing flag after a short delay to allow parent updates to complete
      setTimeout(() => {
        processingUpdateRef.current = false;
      }, 500);
    }

    // Close the dialog
    setOpen(false);
  };

  const handleDialogClose = (isOpen) => {
    console.log("SelectFilePopup - Dialog state changing to:", isOpen);

    // If closing without saving, revert to the initial files
    if (!isOpen && open) {
      console.log(
        "Dialog closing without save, reverting to initial state:",
        initialFilesRef.current
      );
      setSelectedFiles(initialFilesRef.current);
    }

    // Update the dialog state
    setOpen(isOpen);
  };

  return (
    <>
      <Button
        variant="outline"
        id="select-file"
        onClick={() => {
          console.log(
            "SelectFilePopup - Opening dialog with selected files:",
            selectedFiles
          );
          setOpen(true);
        }}
      >
        Highlight Documents
      </Button>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="texta-lg font-semibold">
              Highlight specific documents you want the answer to focus on
              <span className="text-sm text-gray-500 font-normal ml-2">
                (Max: {MAX_FILES})
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <SelectFile
              onFileSelect={handleFileSelection}
              initialSelectedFiles={selectedFiles}
            />
            <div className="flex justify-end mt-4">
              <Button onClick={handleSave}>Save Selected Documents</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectFilePopup;
