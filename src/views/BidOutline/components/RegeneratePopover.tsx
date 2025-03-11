import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
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
          <Button variant="ghost">
            <Sparkles className="text-gray-hint_text" />
            <span className="text-gray-hint_text">Modify</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[450px] z-[9999] relative text-md"
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
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-md placeholder:text-md"
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
                <Send className="h-6 w-6" />
              </Button>
            )}
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RegeneratePopover;
