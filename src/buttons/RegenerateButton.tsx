// RegenerateButton.tsx
import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { Section } from "@/views/BidWritingStateManagerView";

interface RegenerateButtonProps {
  section: Section;
  index: number;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}

const RegenerateButton: React.FC<RegenerateButtonProps> = ({
  isExpanded,
  setIsExpanded
}) => {
  return (
    <button
      className="orange-button flex items-center"
      onClick={() => setIsExpanded(!isExpanded)}
      type="button"
    >
      <FontAwesomeIcon icon={faWandMagicSparkles} className="me-2" />
      <span>Regenerate</span>
    </button>
  );
};

export default RegenerateButton;