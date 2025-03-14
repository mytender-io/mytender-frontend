import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { X } from "lucide-react";

interface EvidencePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  promptResult: string;
  onInsert: () => void;
}

const EvidencePanel = ({
  open,
  onOpenChange,
  isLoading,
  promptResult,
  onInsert
}: EvidencePanelProps) => {
  if (!open) return null;

  return (
    <div className="w-96 h-full bg-white border-l border-gray-line shadow-md flex flex-col">
      <div className="border-b border-gray-line p-4 flex justify-between items-center">
        <h3 className="font-medium">Evidence from Company Library</h3>
        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
          <span className="sr-only">Close</span>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <Spinner className="w-6 h-6" />
          </div>
        ) : promptResult ? (
          <div className="border border-gray-200 rounded p-4 mb-3 text-sm bg-gray-50">
            <pre className="whitespace-pre-wrap">{promptResult}</pre>
          </div>
        ) : (
          <div className="flex justify-center items-center h-20 text-sm text-gray-500">
            No evidence found
          </div>
        )}
      </div>

      <div className="border-t border-gray-line p-4">
        {promptResult && !isLoading && (
          <Button variant="default" className="w-full" onClick={onInsert}>
            Insert Evidence
          </Button>
        )}
      </div>
    </div>
  );
};

export default EvidencePanel;
