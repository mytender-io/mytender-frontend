import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import CustomDateInput from "@/buttons/CustomDateInput";

interface EditBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    value: string;
    submission_deadline: string;
  }) => Promise<void>;
  currentValue: string;
  currentDeadline: string;
}

const EditBidModal: React.FC<EditBidModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentValue,
  currentDeadline
}) => {
  const [value, setValue] = useState(currentValue || "");
  const [deadline, setDeadline] = useState(
    currentDeadline ? new Date(currentDeadline).toISOString().split("T")[0] : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({ value, submission_deadline: deadline });
      onClose();
    } catch (error) {
      console.error("Error saving bid data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log(currentDeadline);
    setValue(currentValue || "");
    setDeadline(
      currentDeadline
        ? new Date(currentDeadline).toISOString().split("T")[0]
        : ""
    );
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Tender Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="value" className="text-right w-24">
                Value (£)
              </Label>
              <Input
                id="value"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="col-span-3"
                placeholder="Enter bid value"
              />
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="deadline" className="text-right w-24">
                Deadline
              </Label>
              <CustomDateInput
                value={deadline}
                onChange={(value: string) => setDeadline(value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBidModal;
