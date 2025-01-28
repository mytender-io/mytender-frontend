import React from "react";
import { ButtonGroup, Button } from "react-bootstrap";
import { LayoutGrid, Columns } from "lucide-react";
import "./ViewToggle.css";

interface ViewToggleProps {
  value: string;
  onChange: (view: "table" | "kanban") => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ value, onChange }) => {
  return (
    <div className="toggle-wrapper">
      <ButtonGroup>
        <Button
          variant={value === "table" ? "primary" : "light"}
          onClick={() => onChange("table")}
          className="view-toggle-btn"
        >
          <LayoutGrid size={16} strokeWidth={2} />
        </Button>
        <Button
          variant={value === "kanban" ? "primary" : "light"}
          onClick={() => onChange("kanban")}
          className="view-toggle-btn"
        >
          <Columns size={16} strokeWidth={2} />
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default ViewToggle;