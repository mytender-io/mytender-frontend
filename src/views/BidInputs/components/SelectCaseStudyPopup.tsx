import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import SelectFile from "@/components/SelectFile";
import { Button } from "@/components/ui/button";

const SelectCaseStudyPopup = ({
  onSaveSelectedFiles,
  initialSelectedFiles = [],
  open,
  setOpen
}) => {
  console.log(
    "SelectFilePopup RENDER - initialSelectedFiles:",
    initialSelectedFiles
  );
  
  // Use the provided open state if available, otherwise use local state
  const [localOpen, setLocalOpen] = useState(false);
  const dialogOpen = open !== undefined ? open : localOpen;
  const setDialogOpen = setOpen || setLocalOpen;
  
  // Store a reference to the initial files so we can compare changes
  const initialFilesRef = useRef(initialSelectedFiles);
  // Track both the file IDs and full metadata
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFilesMetadata, setSelectedFilesMetadata] = useState([]);
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
    // Store the full metadata objects
    setSelectedFilesMetadata(files);
    // Extract just the IDs to match SelectFile's expectations
    const fileIds = files.map((file) => file.unique_id);
    console.log("SelectFilePopup - Extracted file IDs:", fileIds);
    setSelectedFiles(fileIds);
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
    setDialogOpen(false);
  };
 
  const handleDialogClose = (isOpen) => {
    console.log("SelectFilePopup - Dialog state changing to:", isOpen);
    // If closing without saving, revert to the initial files
    if (!isOpen && dialogOpen) {
      console.log(
        "Dialog closing without save, reverting to initial state:",
        initialFilesRef.current
      );
      setSelectedFiles(initialFilesRef.current);
    }
    // Update the dialog state
    setDialogOpen(isOpen);
  };
 
  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Select Case Study
          </DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <SelectFile
            onFileSelect={handleFileSelection}
            initialSelectedFiles={selectedFiles}
            apiEndpoint="get_case_studies"
          />
          <div className="flex justify-end mt-4">
            <Button onClick={handleSave}>Save Selected Documents</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectCaseStudyPopup;