import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import SelectFolder from "@/components/SelectFolder";

const SelectFolderModal = ({
  onSaveSelectedFolders,
  initialSelectedFolders = []
}) => {
  const [open, setOpen] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState(() => {
    const initialSelection = new Set(initialSelectedFolders);
    return Array.from(initialSelection);
  });

  const handleFolderSelection = (folders) => {
    console.log("Folders selected in SelectFolder component:", folders);
    setSelectedFolders(folders);
    onSaveSelectedFolders(folders);
  };

  return (
    <>
      <Button
        variant="outline"
        id="select-folder"
        onClick={() => setOpen(true)}
      >
        Select Folders
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Select Folders to Use as Context
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <SelectFolder
              onFolderSelect={handleFolderSelection}
              initialSelectedFolders={selectedFolders}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectFolderModal;
