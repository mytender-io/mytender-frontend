import * as React from "react";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

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
          <button className="flex items-center space-x-1 px-2 py-1 text-lg text-gray-600 hover:text-gray-900 transition-colors">
            <Sparkles className="h-6 w-6 me-2" />
            <span className="text-lg">Modify</span>
          </button>
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
              placeholder="Type your prompt in here..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg !text-lg md:!text-lg h-12 px-4 placeholder:text-lg"
              disabled={isLoading}
            />
            {isLoading ? (
              <div className="px-4 h-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
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