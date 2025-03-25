import { RefObject, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "../../../helper/Constants";
import {
  TooltipContent,
  Tooltip,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import PencilIcon from "@/components/icons/PencilIcon";

interface CustomPromptButtonProps {
  /** Currently selected DOM range */
  selectedRange: Range | null;
  /** Sets the selected range */
  setSelectedRange: (range: Range | null) => void;
  /** Sets the text that was selected for a prompt */
  setPromptTarget: (text: string) => void;
  /** Sets the result text returned from AI processing */
  setPromptResult: (text: string) => void;
  /** Controls the visibility of the side pane */
  setSidepaneOpen: (open: boolean) => void;
  /** Controls the loading state for evidence fetching */
  setIsLoadingEvidence: (loading: boolean) => void;
  /** Sets the current action type */
  setActionType: (type: string) => void;
  /** Reference to the authentication token */
  tokenRef: RefObject<string>;
  /** Current bid's object ID used for API calls */
  objectId: string | null;
}

/**
 * CustomPromptButton provides a UI for users to enter custom instructions
 * for processing selected text using AI.
 */
const CustomPromptButton: React.FC<CustomPromptButtonProps> = ({
  selectedRange,
  setSelectedRange,
  setPromptTarget,
  setPromptResult,
  setSidepaneOpen,
  setIsLoadingEvidence,
  setActionType,
  tokenRef,
  objectId
}) => {
  // State for custom prompt dialog
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");
  const [temporarySelectedText, setTemporarySelectedText] = useState("");

  /**
   * Opens the custom processing dialog.
   * Stores the selected text for later processing.
   */
  const handleCustomClick = () => {
    if (!selectedRange) {
      toast.error("Please select text for custom processing");
      return;
    }

    const selectedText = selectedRange.toString();
    if (!selectedText || selectedText.trim() === "") {
      toast.error("Please select text for custom processing");
      return;
    }

    // Store the selected text and range for later use
    setTemporarySelectedText(selectedText);

    // Open the custom prompt dialog
    setIsCustomDialogOpen(true);
  };

  /**
   * Processes the selected text with custom instructions.
   * Called when the user submits the custom dialog.
   */
  const handleCustomSubmit = async () => {
    // Close the dialog
    setIsCustomDialogOpen(false);

    if (!selectedRange) {
      toast.error("Selection was lost. Please try again.");
      return;
    }

    if (!customInstructions.trim()) {
      toast.error("Please enter custom instructions.");
      return;
    }

    setPromptTarget(temporarySelectedText);
    setActionType("custom");

    // Store a deep clone of the range for later use
    const storedRange = selectedRange.cloneRange();
    setSelectedRange(storedRange);

    // Highlight the selected text
    const span = document.createElement("span");
    span.className = "custom-text";
    span.dataset.customId = `custom-${Date.now()}`;
    span.style.backgroundColor = "#FFE5CC";

    try {
      selectedRange.surroundContents(span);
    } catch (e) {
      console.log("Using alternative custom highlighting method");
      const fragment = selectedRange.extractContents();
      span.appendChild(fragment);
      selectedRange.insertNode(span);
    }

    // Apply the style to all child elements
    const childElements = span.querySelectorAll("*");
    childElements.forEach((element) => {
      (element as HTMLElement).style.backgroundColor = "#E6E6FA";
    });

    setSidepaneOpen(true);
    setIsLoadingEvidence(true);

    try {
      // Format the copilot_mode by adding prefix "4" and converting to snake_case
      const copilot_mode =
        "4" + customInstructions.toLowerCase().replace(/\s+/g, "_");

      console.log("Calling copilot API with mode:", copilot_mode);

      // Make API call with the properly formatted copilot_mode
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/copilot`,
        {
          input_text: temporarySelectedText,
          extra_instructions: "", // Empty string for instructions as in the example
          copilot_mode: copilot_mode,
          datasets: [],
          bid_id: objectId
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      if (response.data) {
        setPromptResult(response.data);
      } else {
        setPromptResult("Could not process text. Please try again.");
      }
    } catch (error) {
      console.error("Error in custom processing:", error);
      setPromptResult("Error processing text. Please try again.");
      toast.error("Failed to process text");
    } finally {
      setIsLoadingEvidence(false);
      // Clear the custom instructions for next time
      setCustomInstructions("");
    }
  };

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCustomClick}
              className="p-2 flex flex-col items-center text-xs [&_svg]:size-6 h-auto"
            >
              <PencilIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Custom</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Custom Prompt Dialog */}
      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Custom Prompt</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-2">
              Enter instructions for how you want to modify the selected text:
            </p>
            <Textarea
              placeholder="e.g., Make it more formal, add technical details..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCustomSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomPromptButton;
