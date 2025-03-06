import * as React from "react";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";

const RegeneratePopover = ({
  subIndex,
  isOpen,
  onOpenChange,
  onRegenerateSubheading,
  isLoading = false
}) => {
  const [instructions, setInstructions] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegenerateSubheading(e, subIndex, instructions);
    setInstructions(""); // Reset instructions after submission
  };

  return (
    <div className="relative z-[9999]">
      <Popover
        open={isOpen}
        onOpenChange={(open) => onOpenChange(open, subIndex)}
      >
        <PopoverTrigger asChild>
          <Button variant="ghost" className="[&_svg]:w-6 [&_svg]:h-6">
            <Sparkles className="text-gray-hint_text" />
            <span className="text-gray-hint_text">Modify</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[450px] z-[9999] relative text-lg"
          side="top"
          align="end"
          sideOffset={5}
        >
          <form onSubmit={handleSubmit} className="flex items-center">
            <Input
              type="text"
              placeholder="Type instructions to adjust subsection"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg h-12 px-4 placeholder:text-lg"
              disabled={isLoading}
            />
            {isLoading ? (
              <div className="px-4 h-12 flex items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <Button
                type="submit"
                size="lg"
                variant="ghost"
                className="px-4 h-12"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 rotate-90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </Button>
            )}
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RegeneratePopover;
