import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AddCriteriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionHeading?: string;
  criteria: string;
  onCriteriaChange: (value: string) => void;
  onSave: () => void;
}

const AddCriteriaModal = ({
  open,
  onOpenChange,
  sectionHeading,
  criteria,
  onCriteriaChange,
  onSave
}: AddCriteriaModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-gray-light">
        <DialogHeader>
          <DialogTitle>Paste in the Evaluation Criteria</DialogTitle>
          <span className="text-sm text-gray-black">
            This will help make the feedback tailored to the response
          </span>
        </DialogHeader>
        <div className="grid gap-4 p-4 bg-white border border-gray-line rounded-lg">
          {sectionHeading && (
            <div>
              <label className="text-sm font-medium text-gray-black mb-1 block">
                Question
              </label>
              <Input value={sectionHeading} disabled />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-black mb-1 block">
              Tender Requirements
            </label>
            <Textarea
              value={criteria}
              onChange={(e) => onCriteriaChange(e.target.value)}
              placeholder="Enter tender requirements or scoring criteria..."
              className="min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={onSave} disabled={!criteria.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCriteriaModal;
