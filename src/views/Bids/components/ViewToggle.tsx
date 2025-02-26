import React from "react";
import { Button } from "../../../components/ui/button";
import LayoutGridIcon from "../../../components/icons/LayoutGridIcon";
import LayoutTableIcon from "../../../components/icons/LayoutTableIcon";
import { cn } from "@/utils";

interface ViewToggleProps {
  value: string;
  onChange: (view: "table" | "kanban") => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ value, onChange }) => {
  return (
    <div className="flex rounded-lg border border-typo-grey-7 overflow-hidden">
      <Button
        variant="secondary"
        size="lg"
        className={cn(
          "text-typo-900 px-4 rounded-none hover:bg-white",
          value === "table" ? "bg-white" : "bg-button/50"
        )}
        onClick={() => onChange("table")}
      >
        <LayoutTableIcon className="text-gray-hint_text" />
      </Button>
      <Button
        variant="secondary"
        size="lg"
        className={cn(
          "text-typo-900 px-4 rounded-none hover:bg-white",
          value === "kanban" ? "bg-white" : "bg-button/50"
        )}
        onClick={() => onChange("kanban")}
      >
        <LayoutGridIcon className="text-gray-hint_text" />
      </Button>
    </div>
  );
};

export default ViewToggle;
