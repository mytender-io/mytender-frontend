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
        size="lg"
        className={cn(
          "text-typo-900 w-[100px] rounded-none hover:bg-button/50",
          value === "table" ? "bg-button/50" : "bg-white"
        )}
        onClick={() => onChange("table")}
      >
        <LayoutTableIcon />
        Table
      </Button>
      <Button
        size="lg"
        className={cn(
          "text-typo-900 w-[100px] rounded-none hover:bg-button/50",
          value === "kanban" ? "bg-button/50" : "bg-white"
        )}
        onClick={() => onChange("kanban")}
      >
        <LayoutGridIcon />
        Kanban
      </Button>
    </div>
  );
};

export default ViewToggle;
