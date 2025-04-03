import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Check, Plus } from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";
import { Link } from "react-router-dom";

const AddCompetitors = () => {
  const [competitorsUrl, setCompetitorsUrl] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(true);

  const handleEndOfTyping = (
    e: React.FocusEvent<HTMLInputElement, Element>
  ) => {
    e.preventDefault();
    const url = e.target.value;

    if (url) {
      posthog.capture("added_competitor_url", {
        url
      });
      setCompetitorsUrl((prev) => [url, ...prev]);
      setInputVisible(false);
      e.target.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const url = e.currentTarget.value;

      if (url) {
        posthog.capture("added_competitor_url", {
          url
        });
        setCompetitorsUrl((prev) => [url, ...prev]);
        setInputVisible(false);
        e.currentTarget.value = "";
      }
    }
  };

  return (
    <>
      <TooltipProvider>
        <Dialog>
          <DialogTrigger>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="">
                  <Plus className="h-5 w-5 text-white" />
                  Competitors URLs
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                align="center"
                sideOffset={5}
                className="flex flex-col items-center max-w-[200px] text-center"
              >
                <TooltipArrow className="text-primary" />
                <p>Add Specific competitors you know to improve accuracy</p>
              </TooltipContent>
            </Tooltip>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Add Competitors
              </DialogTitle>
              <DialogDescription className="font-medium">
                Paste in your competitors websites to the analyse
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {competitorsUrl.map((url, i) => (
                <Link
                  to={url}
                  target="_blank"
                  key={i}
                  className="flex gap-2 items-center text-orange"
                >
                  <Check />
                  {url}
                </Link>
              ))}
              {inputVisible && (
                <Input
                  placeholder="Type Competitor URL..."
                  onBlur={handleEndOfTyping}
                  onKeyDown={handleKeyDown}
                  className="!border-0 !shadow-none focus-visible:!ring-0"
                />
              )}

              {competitorsUrl.length > 0 && (
                <Button
                  variant="ghost"
                  className="hover:bg-transparent border-0 justify-start text-[#575859] font-semibold"
                  onClick={() => setInputVisible(true)}
                >
                  + Add Competitor
                </Button>
              )}
            </div>
            <DialogFooter className="!justify-between">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm py-4 hover:bg-transparent border-0 justify-start text-[#575859] font-semibold"
                >
                  Back
                </Button>
              </DialogClose>
              <Button className="text-sm py-4 text-white bg-orange hover:bg-orange-light">
                Search
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </>
  );
};

export default AddCompetitors;

