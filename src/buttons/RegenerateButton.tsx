import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
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
    <button
      className="orange-button flex items-center"
      onClick={onRegenerate}
      type="button"
      disabled={isLoading}
    >
      <FontAwesomeIcon icon={faWandMagicSparkles} className="me-2" />
      <span>{isLoading ? "Regenerating..." : "Regenerate"}</span>
    </button>
  );
};

export default RegenerateButton;