import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import SelectFile from "@/components/SelectFile";
import SelectTenderLibraryFile from "@/components/SelectTenderLibraryFile";
import { toast } from "react-toastify";
import FileStarIcon from "@/components/icons/FileStarIcon";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SelectFilePopup = ({
  onSaveSelectedFiles,
  initialSelectedFiles = [],
  onSaveSelectedTenderFiles,
  initialTenderSelectedFiles = [],
  bid_id
}) => {
  console.log(
    "SelectFilePopup RENDER - initialSelectedFiles:",
    initialSelectedFiles
  );

  if (bid_id) {
    console.log(
      "SelectFilePopup RENDER - initialTenderSelectedFiles:",
      initialTenderSelectedFiles
    );
  }

  console.log("BID ID");
  console.log(bid_id);

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  // Determine if tender tab should be shown
  const showTenderTab = !!bid_id;

  // Store a reference to the initial files so we can compare changes
  const initialFilesRef = useRef(initialSelectedFiles);
  const initialTenderFilesRef = useRef(initialTenderSelectedFiles);

  // Track files for both tabs separately
  const [contentFiles, setContentFiles] = useState([]);
  const [contentFilesMetadata, setContentFilesMetadata] = useState([]);
  const [tenderFiles, setTenderFiles] = useState([]);
  const [tenderFilesMetadata, setTenderFilesMetadata] = useState([]);

  // This flag helps prevent circular updates
  const processingUpdateRef = useRef(false);

  // Maximum number of allowed files (combined from both tabs)
  const MAX_FILES = 3;

  console.log("initialselectedfiiles");
  console.log(initialSelectedFiles);

  useEffect(() => {
    if (processingUpdateRef.current) return;
    if (!showTenderTab) return;

    console.log("Processing initial tender files:", initialTenderSelectedFiles);

    // Initialize tender files with the initial tender files as they are (strings)
    const metadataObjects = initialTenderSelectedFiles.map((filename) => ({
      filename,
      unique_id: filename,
      folder: "tender"
    }));

    setTenderFilesMetadata(metadataObjects);
    setTenderFiles(initialTenderSelectedFiles); // Store filenames directly
  }, [initialTenderSelectedFiles, showTenderTab]);

  // Reset to content tab if tender tab is hidden
  useEffect(() => {
    if (!showTenderTab && activeTab === "tender") {
      setActiveTab("content");
    }
  }, [showTenderTab, activeTab]);

  // Log when selected files change
  useEffect(() => {
    console.log(
      "SelectFilePopup EFFECT - content files changed:",
      contentFiles
    );
    if (showTenderTab) {
      console.log(
        "SelectFilePopup EFFECT - tender files changed:",
        tenderFiles
      );
    }
  }, [contentFiles, tenderFiles, showTenderTab]);

  // Handler for content file selection
  const handleContentFileSelection = (files) => {
    console.log("SelectFilePopup - Content files selected:", files);

    // Check if selection exceeds MAX_FILES
    if (files.length > MAX_FILES) {
      toast.warning(
        `You can select a maximum of ${MAX_FILES} documents. Only the first ${MAX_FILES} will be used.`
      );

      // Limit to first MAX_FILES
      const limitedFiles = files.slice(0, MAX_FILES);

      // Store the metadata objects for content files
      setContentFilesMetadata(limitedFiles);
      // Extract just the IDs to match SelectFile's expectations
      const fileIds = limitedFiles.map((file) => file.unique_id);
      console.log("SelectFilePopup - Limited to first 3 files:", fileIds);

      setContentFiles(fileIds);
    } else {
      // Store the metadata objects for content files
      setContentFilesMetadata(files);
      setContentFiles(files.map((file) => file.unique_id));
    }
  };

  // Handler for tender file selection

  const handleTenderFileSelection = (filenames) => {
    console.log("SelectFilePopup - Tender files selected:", filenames);

    // Check if selection exceeds MAX_FILES
    if (filenames.length > MAX_FILES) {
      toast.warning(
        `You can select a maximum of ${MAX_FILES} documents. Only the first ${MAX_FILES} will be used.`
      );

      // Limit to first MAX_FILES
      const limitedFilenames = filenames.slice(0, MAX_FILES);

      // Convert string filenames to metadata objects
      const metadataObjects = limitedFilenames.map((filename) => ({
        filename,
        unique_id: filename,
        folder: "tender"
      }));

      // Store the metadata objects for tender files
      setTenderFilesMetadata(metadataObjects);
      setTenderFiles(limitedFilenames); // Just store the filenames
    } else {
      // Convert string filenames to metadata objects
      const metadataObjects = filenames.map((filename) => ({
        filename,
        unique_id: filename,
        folder: "tender"
      }));

      // Store the metadata objects for tender files
      setTenderFilesMetadata(metadataObjects);
      setTenderFiles(filenames); // Just store the filenames
    }
  };

  const handleSave = () => {
    console.log(
      "SelectFilePopup - Saving content files:",
      contentFilesMetadata
    );

    if (showTenderTab) {
      console.log(
        "SelectFilePopup - Saving tender files:",
        tenderFilesMetadata
      );
    }

    // Set the processing flag to prevent circular updates
    processingUpdateRef.current = true;

    try {
      // Save content files
      onSaveSelectedFiles(contentFilesMetadata);

      // Save tender files if the tab is shown and callback exists
      if (showTenderTab && onSaveSelectedTenderFiles) {
        onSaveSelectedTenderFiles(tenderFilesMetadata);
      }
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
      console.log("Dialog closing without save, reverting to initial states");

      // Reset content files to initial files
      setContentFilesMetadata(initialFilesRef.current);
      setContentFiles(initialFilesRef.current.map((file) => file.unique_id));

      // Reset tender files to initial files if tab is shown
      if (showTenderTab) {
        setTenderFilesMetadata(
          initialTenderFilesRef.current.map((filename) => ({
            filename,
            unique_id: filename,
            folder: "tender"
          }))
        );
        setTenderFiles(initialTenderFilesRef.current); // Just filenames
      }
    }

    // Update the dialog state
    setOpen(isOpen);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              id="select-file"
              onClick={() => {
                console.log("SelectFilePopup - Opening dialog");
                setOpen(true);
              }}
              className="font-medium"
            >
              <FileStarIcon className="text-black" />
              Select Highlight Document
              <Info className="size-4 stroke-[1.5]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Select the documents you want the answer to focus on
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="texta-lg font-semibold">
              Highlight specific documents you want the answer to focus on
              <span className="text-sm text-gray-500 font-normal ml-2">
                (Max: {MAX_FILES} per library)
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {showTenderTab ? (
              <Tabs
                defaultValue="content"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">Content Library</TabsTrigger>
                  <TabsTrigger value="tender">Tender Library</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="pt-4">
                  <SelectFile
                    onFileSelect={handleContentFileSelection}
                    initialSelectedFiles={contentFiles}
                  />
                  <div className="text-sm text-gray-500 mt-2">
                    Selected content files: {contentFilesMetadata.length}/
                    {MAX_FILES}
                  </div>
                </TabsContent>

                <TabsContent value="tender" className="pt-4">
                  <SelectTenderLibraryFile
                    bid_id={bid_id}
                    onFileSelect={handleTenderFileSelection}
                    initialSelectedFiles={tenderFiles}
                  />
                  <div className="text-sm text-gray-500 mt-2">
                    Selected tender files: {tenderFilesMetadata.length}/
                    {MAX_FILES}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              // Show only content library when no bid_id is provided
              <div>
                <h3 className="font-medium mb-4">Content Library</h3>
                <SelectFile
                  onFileSelect={handleContentFileSelection}
                  initialSelectedFiles={contentFiles}
                />
                <div className="text-sm text-gray-500 mt-2">
                  Selected content files: {contentFilesMetadata.length}/
                  {MAX_FILES}
                </div>
              </div>
            )}

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
