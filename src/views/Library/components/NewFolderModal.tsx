import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { memo, useState } from "react";

interface NewFolderModalProps {
  show: boolean;
  onHide: () => void;
  onCreateFolder: (folderName: string, parentFolder?: null) => Promise<void>;
  title: string;
  parentFolder: string | null;
}

const NewFolderModal = memo(
  ({
    show,
    onHide,
    onCreateFolder,
    title,
    parentFolder
  }: NewFolderModalProps) => {
    const [localNewFolderName, setLocalNewFolderName] = useState("");
    const [error, setError] = useState("");

    const validateFolderName = (name: string) => {
      if (name.trim().length < 3 || name.trim().length > 63) {
        return "Folder name must be between 3 and 63 characters long.";
      }
      if (!/^[a-zA-Z0-9].*[a-zA-Z0-9\s]$/.test(name)) {
        return "Folder name must start and end with an alphanumeric character.";
      }
      if (!/^[a-zA-Z0-9_\s-]+$/.test(name)) {
        return "Folder name can only contain alphanumeric characters, spaces, underscores, or hyphens.";
      }
      if (name.includes("..")) {
        return "Folder name cannot contain two consecutive periods.";
      }
      if (/^(\d{1,3}\.){3}\d{1,3}$/.test(name)) {
        return "Folder name cannot be a valid IPv4 address.";
      }
      return "";
    };

    const handleInputChange = (e) => {
      const newName = e.target.value;
      setLocalNewFolderName(newName);
      setError(validateFolderName(newName));
    };

    const handleCreate = () => {
      const validationError = validateFolderName(localNewFolderName);
      if (validationError) {
        setError(validationError);
      } else {
        onCreateFolder(localNewFolderName, parentFolder);
        setLocalNewFolderName("");
        setError("");
      }
    };

    return (
      <Dialog open={show} onOpenChange={onHide}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title || "Create New Folder"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">
                {parentFolder ? "Subfolder Name" : "Folder Name"}
              </Label>
              <Input
                id="folderName"
                placeholder={`Enter ${parentFolder ? "subfolder" : "folder"} name`}
                value={localNewFolderName}
                onChange={handleInputChange}
                className={error ? "border-destructive" : ""}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreate}
              disabled={!!error || localNewFolderName.length === 0}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

export default NewFolderModal;

