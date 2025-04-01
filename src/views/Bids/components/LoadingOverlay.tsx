import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/utils";

// Import sloth images
import Sloth1 from "@/resources/images/sloth1.gif";
import Sloth2 from "@/resources/images/sloth2.gif";
import Sloth3 from "@/resources/images/sloth3.gif";
import Sloth4 from "@/resources/images/sloth4.gif";
import Sloth5 from "@/resources/images/sloth5.gif";

interface LoadingOverlayProps {
  isOpen: boolean;
  progress: number;
  loadingMessage: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isOpen,
  progress,
  loadingMessage
}) => {
  const [expanded, setExpanded] = useState(false);

  // Array of sloth images
  const slothImages = [Sloth1, Sloth2, Sloth3, Sloth4, Sloth5];

  // Get random sloth image on component mount
  const [randomSloth] = useState(
    () => slothImages[Math.floor(Math.random() * slothImages.length)]
  );

  // Reset expanded state when the overlay is closed
  useEffect(() => {
    if (!isOpen) {
      setExpanded(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed p-0 bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 z-50",
        expanded
          ? "max-w-[50rem] w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          : "w-80 right-4 bottom-4"
      )}
    >
      <div className="bg-gray-bg border-[0.5px] border-gray-line p-3 flex justify-between items-center">
        <h2 className="text-base font-semibold">Thank you for completing</h2>
        <Button
          onClick={() => setExpanded(!expanded)}
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-600 hover:text-gray-900 p-0"
        >
          {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </Button>
      </div>
      <div
        className={cn(
          "flex flex-col justify-between w-full gap-3 p-3",
          expanded ? "h-fit" : "h-40",
          "w-full transition-all duration-300"
        )}
      >
        <div className="space-y-3">
          <span className="font-semibold">Setting up your bid:</span>
          {expanded ? (
            <img
              src={randomSloth}
              alt="Loading Sloth"
              className="w-80 h-80 mx-auto rounded-lg shadow-md"
            />
          ) : null}
          <span className={cn("block", expanded ? "text-center" : "mb-7")}>
            {loadingMessage}
          </span>
        </div>
        <div className="flex items-center gap-2 max-w-96 w-full mx-auto">
          <Progress value={progress} />
          <p className="text-sm">{`${Math.round(progress)}%`}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
