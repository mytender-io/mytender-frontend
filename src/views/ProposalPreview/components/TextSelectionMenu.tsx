import { Dispatch, RefObject, SetStateAction } from "react";
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
import CommentIcon from "@/components/icons/CommentIcon";
import UpscaleSparkIcon from "@/components/icons/UpscaleSparkIcon";
import ExpandVerticalIcon from "@/components/icons/ExpandVerticalIcon";
import ShortenHorizontalIcon from "@/components/icons/ShortenHorizontalIcon";
import PencilIcon from "@/components/icons/PencilIcon";
import posthog from "posthog-js";

interface TextSelectionMenuProps {
  /** Position of the selection menu relative to the editor */
  selectionMenuPosition: { top: number };
  /** Currently selected DOM range */
  selectedRange: Range | null;
  /** State setter for the selected range */
  setSelectedRange: Dispatch<SetStateAction<Range | null>>;
  /** Controls the visibility of the comment input */
  setShowCommentInput: Dispatch<SetStateAction<boolean>>;
  /** Sets the text that was selected for a prompt */
  setPromptTarget: Dispatch<SetStateAction<string>>;
  /** Sets the result text returned from AI processing */
  setPromptResult: Dispatch<SetStateAction<string>>;
  /** Controls the visibility of the side pane */
  setSidepaneOpen: Dispatch<SetStateAction<boolean>>;
  /** Controls the loading state for evidence fetching */
  setIsLoadingEvidence: Dispatch<SetStateAction<boolean>>;
  /** Sets the current action type (evidence, expand, summarize) */
  setActionType: Dispatch<SetStateAction<string>>;
  /** Reference to the authentication token */
  tokenRef: RefObject<string>;
  /** Current bid's object ID used for API calls */
  objectId: string | null;
}

/**
 * TextSelectionMenu component displays a floating menu with actions for selected text.
 * Provides options to comment on, find evidence for, expand, or summarize the selected text.
 */
const TextSelectionMenu: React.FC<TextSelectionMenuProps> = ({
  selectionMenuPosition,
  selectedRange,
  setSelectedRange,
  setShowCommentInput,
  setPromptTarget,
  setPromptResult,
  setSidepaneOpen,
  setIsLoadingEvidence,
  setActionType,
  tokenRef,
  objectId
}) => {
  /**
   * Handles adding a comment to the selected text.
   * Activates the comment input and highlights the selected text.
   */
  const handleAddComment = () => {
    setShowCommentInput(true);

    // Only proceed if there's a valid selection
    if (selectedRange) {
      // Create a span to wrap the selected content
      const span = document.createElement("span");
      span.className = "commented-text";
      span.dataset.commentId = `pending-${Date.now()}`;
      span.style.backgroundColor = "#FFE5CC";

      try {
        // Attempt to surround the contents with our span
        selectedRange.surroundContents(span);
      } catch (e) {
        // Fall back to a more robust method if surroundContents fails
        // (which can happen with complex selections spanning multiple DOM nodes)
        console.log("Using alternative comment highlighting method");

        // Extract the content
        const fragment = selectedRange.extractContents();
        span.appendChild(fragment);
        selectedRange.insertNode(span);
      }

      // Apply the highlighting style to all child elements for consistency
      const childElements = span.querySelectorAll("*");
      childElements.forEach((element) => {
        (element as HTMLElement).style.backgroundColor = "#FFE5CC";
      });
    }

    posthog.capture("Add Comment Clicked", {
      selection: selectedRange?.toString()
    });
  };

  /**
   * Handles finding evidence for the selected text.
   * Calls the evidence API and displays results in the sidepane.
   */
  const handleEvidencePrompt = async () => {
    if (!selectedRange) {
      toast.error("Please select text to find evidence for");
      return;
    }

    // Get the selected text
    const selectedText = selectedRange.toString();
    if (!selectedText || selectedText.trim() === "") {
      toast.error("Please select text to find evidence for");
      return;
    }

    posthog.capture("Evidence Clicked", { selection: selectedText });

    setPromptTarget(selectedText);
    setActionType("evidence");

    // Store a deep clone of the range for later use
    const storedRange = selectedRange.cloneRange();
    setSelectedRange(storedRange);

    // Create a highlighted span to indicate the text is being processed
    const span = document.createElement("span");
    span.className = "evidence-text";
    span.dataset.evidenceId = `evidence-${Date.now()}`;
    span.style.backgroundColor = "#FFE5CC";

    try {
      selectedRange.surroundContents(span);
    } catch (e) {
      // Handle complex selections that cross DOM boundaries
      console.log("Using alternative evidence highlighting method");

      // Extract the content
      const fragment = selectedRange.extractContents();

      // Add the content to our span
      span.appendChild(fragment);

      // Insert the span
      selectedRange.insertNode(span);
    }

    // Apply the style to all child elements
    const childElements = span.querySelectorAll("*");
    childElements.forEach((element) => {
      (element as HTMLElement).style.backgroundColor = "#FFE5CC";
    });

    setSidepaneOpen(true); // Open the sidepane instead of evidence panel
    setIsLoadingEvidence(true);

    try {
      const formData = new FormData();
      formData.append("selected_text", selectedText);

      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/get_evidence_from_company_lib`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      if (
        response.data.success &&
        response.data.evidence &&
        response.data.evidence.length > 0
      ) {
        // Check if enhanced_text is available
        if (response.data.enhanced_text) {
          setPromptResult(response.data.enhanced_text);
        } else {
          // Format the evidence results manually if enhanced_text is not available
          const formattedEvidence = response.data.evidence
            .map((item, index) => {
              return `Evidence ${index + 1} [Source: ${item.source}]:\n${item.content}`;
            })
            .join("\n\n");

          setPromptResult(formattedEvidence);
        }
      } else {
        // Show the error message from the API if available
        setPromptResult(
          response.data.message ||
            "No relevant evidence found in your company library."
        );
      }
    } catch (error) {
      console.error("Error fetching evidence:", error);
      setPromptResult("Error retrieving evidence. Please try again.");
      toast.error("Failed to retrieve evidence from company library");
    } finally {
      setIsLoadingEvidence(false);
    }
  };

  /**
   * Handles expanding the selected text using AI.
   * Processes the selection and displays expanded content in the sidepane.
   */
  const handleExpand = async () => {
    if (!selectedRange) {
      toast.error("Please select text to expand");
      return;
    }

    // Get the selected text
    const selectedText = selectedRange.toString();
    if (!selectedText || selectedText.trim() === "") {
      toast.error("Please select text to expand");
      return;
    }

    posthog.capture("Expand Clicked", { selection: selectedText });

    setPromptTarget(selectedText);
    setActionType("expand");

    // Store a deep clone of the range for later use
    const storedRange = selectedRange.cloneRange();
    setSelectedRange(storedRange);

    // Highlight the selected text with a different color
    const span = document.createElement("span");
    span.className = "expand-text";
    span.dataset.expandId = `expand-${Date.now()}`;
    span.style.backgroundColor = "#FFE5CC";

    try {
      selectedRange.surroundContents(span);
    } catch (e) {
      // If surroundContents fails (which can happen with complex selections),
      // use a more robust approach that preserves the structure
      console.log("Using alternative expand highlighting method");

      // Extract the content
      const fragment = selectedRange.extractContents();

      // Add the content to our span
      span.appendChild(fragment);

      // Insert the span
      selectedRange.insertNode(span);
    }

    // Apply the style to all child elements
    const childElements = span.querySelectorAll("*");
    childElements.forEach((element) => {
      (element as HTMLElement).style.backgroundColor = "#FFE5CC";
    });

    setSidepaneOpen(true);
    setIsLoadingEvidence(true);

    try {
      // Make API call to expand text using copilot endpoint
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/copilot`,
        {
          input_text: selectedText,
          extra_instructions: "",
          copilot_mode: "1expand",
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
        setPromptResult("Could not expand text. Please try again.");
      }
    } catch (error) {
      console.error("Error expanding text:", error);
      setPromptResult("Error expanding text. Please try again.");
      toast.error("Failed to expand text");
    } finally {
      setIsLoadingEvidence(false);
    }
  };

  /**
   * Handles summarizing the selected text using AI.
   * Processes the selection and displays summarized content in the sidepane.
   */
  const handleSummarise = async () => {
    if (!selectedRange) {
      toast.error("Please select text to summarise");
      return;
    }

    // Get the selected text
    const selectedText = selectedRange.toString();
    if (!selectedText || selectedText.trim() === "") {
      toast.error("Please select text to summarise");
      return;
    }

    posthog.capture("Summirise Clicked", { selection: selectedText });

    setPromptTarget(selectedText);
    setActionType("summarise");
    // Store a deep clone of the range for later use
    const storedRange = selectedRange.cloneRange();
    setSelectedRange(storedRange);

    // Highlight the selected text with a different color
    const span = document.createElement("span");
    span.className = "summarise-text";
    span.dataset.summariseId = `summarise-${Date.now()}`;
    span.style.backgroundColor = "#FFE5CC";

    try {
      selectedRange.surroundContents(span);
    } catch (e) {
      // If surroundContents fails (which can happen with complex selections),
      // use a more robust approach that preserves the structure
      console.log("Using alternative summarise highlighting method");

      // Extract the content
      const fragment = selectedRange.extractContents();

      // Add the content to our span
      span.appendChild(fragment);

      // Insert the span
      selectedRange.insertNode(span);
    }

    // Apply the style to all child elements
    const childElements = span.querySelectorAll("*");
    childElements.forEach((element) => {
      (element as HTMLElement).style.backgroundColor = "#FFE5CC";
    });

    setSidepaneOpen(true);
    setIsLoadingEvidence(true);

    try {
      // Make API call to get summary using copilot endpoint
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/copilot`,
        {
          input_text: selectedText,
          extra_instructions: "",
          copilot_mode: "1summarise",
          datasets: [],
          bid_id: objectId
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      console.log(response.data);

      if (response.data) {
        setPromptResult(response.data); // Copilot returns an array of options, take the first one
      } else {
        setPromptResult("Could not generate summary. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
      setPromptResult("Error generating summary. Please try again.");
      toast.error("Failed to generate summary");
    } finally {
      setIsLoadingEvidence(false);
    }
  };

  /**
   * Handles custom prompt the selected text using AI.
   * Processes the selection and displays custom prompt content in the sidepane.
   */
  const handleCustomPrompt = async () => {
    if (!selectedRange) {
      toast.error("Please select text to custom prompt");
      return;
    }

    // Get the selected text
    const selectedText = selectedRange.toString();
    if (!selectedText || selectedText.trim() === "") {
      toast.error("Please select text to custom prompt");
      return;
    }

    setPromptTarget(selectedText);
    setActionType("custom");
    // Store a deep clone of the range for later use
    const storedRange = selectedRange.cloneRange();
    setSelectedRange(storedRange);

    // Highlight the selected text with a different color
    const span = document.createElement("span");
    span.className = "custom-text";
    span.dataset.customPromptId = `custom-${Date.now()}`;
    span.style.backgroundColor = "#FFE5CC";

    try {
      selectedRange.surroundContents(span);
    } catch (e) {
      // If surroundContents fails (which can happen with complex selections),
      // use a more robust approach that preserves the structure
      console.log("Using alternative custom prompt highlighting method");

      // Extract the content
      const fragment = selectedRange.extractContents();

      // Add the content to our span
      span.appendChild(fragment);

      // Insert the span
      selectedRange.insertNode(span);
    }

    // Apply the style to all child elements
    const childElements = span.querySelectorAll("*");
    childElements.forEach((element) => {
      (element as HTMLElement).style.backgroundColor = "#FFE5CC";
    });

    setSidepaneOpen(true);

    posthog.capture("Custom Prompt Clicked", { selection: selectedText });
  };

  return (
    <>
      <div
        className="absolute right-1"
        style={{
          top: `${selectionMenuPosition.top}px`
        }}
      >
        <div className="flex flex-col bg-white shadow-lg rounded-2xl border border-gray-200 z-50 overflow-hidden gap-1 py-2">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddComment}
                  className="p-2 flex flex-col items-center text-xs [&_svg]:size-6 h-auto"
                >
                  <CommentIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Add Comment</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEvidencePrompt}
                  className="p-2 flex flex-col items-center text-xs [&_svg]:size-6 h-auto"
                >
                  <UpscaleSparkIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Evidence</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCustomPrompt}
                  className="p-2 flex flex-col items-center text-xs [&_svg]:size-6 h-auto"
                >
                  <PencilIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Custom</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExpand}
                  className="p-2 flex flex-col items-center text-xs [&_svg]:size-6 h-auto"
                >
                  <ExpandVerticalIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Expand</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSummarise}
                  className="p-2 flex flex-col items-center text-xs [&_svg]:size-6 h-auto"
                >
                  <ShortenHorizontalIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Summarise</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </>
  );
};

export default TextSelectionMenu;

