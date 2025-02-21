import React from "react";
import { WandIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/views/BidWritingStateManagerView";

interface RegenerateButtonProps {
  section: Section;
  index: number;
  onRegenerate: (e: React.MouseEvent) => Promise<void>;
  isLoading?: boolean;
}

const RegenerateButton: React.FC<RegenerateButtonProps> = ({
  onRegenerate,
  isLoading = false
}) => {
  return (
    <div className="flex items-center">
      <Button variant="default" onClick={onRegenerate} disabled={isLoading}>
        <WandIcon className="mr-2 h-4 w-4" />
        {isLoading ? "Regenerating..." : "Regenerate"}
      </Button>
    </div>
  );
};

export default RegenerateButton;
