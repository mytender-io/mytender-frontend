import { useContext, useRef, useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import withAuth from "../../routes/withAuth";
import { BidContext } from "../BidWritingStateManagerView";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Check,
  Download,
  X,
  Send
} from "lucide-react";
import "./ProposalPreview.css";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  TooltipContent,
  Tooltip,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import ProfilePhoto from "@/layout/ProfilePhoto";
import ProposalPreviewSidepane from "./components/ProposalPreviewSidepane";
import ToolSparkIcon from "@/components/icons/ToolSparkIcon";
import CopyIcon from "@/components/icons/CopyIcon";
import RedoSparkIcon from "@/components/icons/RedoSparkIcon";
import PencilEditCheckIcon from "@/components/icons/PencilEditCheckIcon";
import CommentIcon from "@/components/icons/CommentIcon";
import UpscaleSparkIcon from "@/components/icons/UpscaleSparkIcon";
import RedoIcon from "@/components/icons/RedoIcon";
import UndoIcon from "@/components/icons/UndoIcon";
import QuoteIcon from "@/components/icons/QuoteIcon";
import StrikeThroughIcon from "@/components/icons/StrikeThroughIcon";
import HyperlinkIcon from "@/components/icons/HyperlinkIcon";
import UnderlineIcon from "@/components/icons/UnderlineIcon";
import ItalicIcon from "@/components/icons/ItalicIcon";
import BoldIcon from "@/components/icons/BoldIcon";
import ParagraphIcon from "@/components/icons/ParagraphIcon";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PlusCircleIcon from "@/components/icons/PlusCircleIcon";
import ArrowDownIcon from "@/components/icons/ArrowDownIcon";
import ShortenHorizontalIcon from "@/components/icons/ShortenHorizontalIcon";
import ExpandVerticalIcon from "@/components/icons/ExpandVerticalIcon";
// import PencilIcon from "@/components/icons/PencilIcon";
import { cn, getSectionHeading } from "@/utils";
import { toast } from "react-toastify";
import posthog from "posthog-js";
import DebouncedContentEditable from "./components/DebouncedContentEditable";
import {
  getCommentsForCurrentSection,
  handleCancelComment,
  handleCancelReply,
  handleSaveComment,
  handleSubmitReply,
  handleToggleResolution
} from "./commentFunctions";
import { Textarea } from "@/components/ui/textarea";

const ProposalPreview = () => {
  const editorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeEditorRef = useRef<HTMLDivElement | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
  const { sharedState, setSharedState } = useContext(BidContext);
  const [showSelectionMenu, setShowSelectionMenu] = useState(false);
  const [selectionMenuPosition, setSelectionMenuPosition] = useState({
    top: 0
  });
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [promptTarget, setPromptTarget] = useState("");
  const [promptResult, setPromptResult] = useState("");
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [sidepaneOpen, setSidepaneOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(
    null
  );
  const [rewriteFeedback, setRewriteFeedback] = useState("");
  const [rewritingSectionIndex, setRewritingSectionIndex] = useState<
    number | null
  >(null);
  const [rewritingSection, setRewritingSection] = useState<string | null>(null);

  // Get sections from shared state
  const { outline } = sharedState;
  const [localLoading, setLocalLoading] = useState(false);

  const [organizationUsers, setOrganizationUsers] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("version2");
  const [versionPopoverOpen, setVersionPopoverOpen] = useState(false);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);

  const [actionType, setActionType] = useState("evidence");

  const handleSelectVersion = (version: string) => {
    setSelectedVersion(version);
    setVersionPopoverOpen(false); // Close the popover when a version is selected
  };

  useEffect(() => {
    const fetchOrganizationUsers = async () => {
      try {
        // Create form data
        const formData = new FormData();
        formData.append("include_pending", "false");

        const response = await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/get_organization_users`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );

        setOrganizationUsers(response.data);
      } catch (err) {
        console.error("Error fetching organization users:", err);
      }
    };

    fetchOrganizationUsers();
  }, [tokenRef]);

  useEffect(() => {
    // Set local loading when component mounts
    setLocalLoading(true);

    // When outline data is available, turn off loading
    if (sharedState.outline) {
      setLocalLoading(false);
    }
  }, [sharedState.outline]);

  // Function to toggle the sidepane
  const toggleSidepane = () => {
    setSidepaneOpen((prevState) => !prevState);
  };

  // 3. Add this function to handle rewrite submission

  // 2. Update the handleRewriteSubmit function to use section-specific loading
  const handleRewriteSubmit = async () => {
    if (rewritingSectionIndex !== null && rewriteFeedback.trim()) {
      try {
        // Instead of setting the global isLoading, set the specific section as rewriting
        setRewritingSection(outline[rewritingSectionIndex].section_id);

        const formData = new FormData();
        formData.append(
          "section",
          JSON.stringify(outline[rewritingSectionIndex])
        );
        formData.append("user_feedback", rewriteFeedback);
        formData.append("bid_id", sharedState.object_id);

        const response = await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/rewrite_section`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`
            }
          }
        );

        if (response.data) {
          // Update only the specific section in the shared state
          setSharedState((prevState) => {
            // Create a shallow copy of the previous outline
            const newOutline = [...prevState.outline];

            // Update only the specific section at the rewritingSectionIndex
            newOutline[rewritingSectionIndex] = response.data;

            // Return the new state with only the needed section updated
            return {
              ...prevState,
              outline: newOutline
            };
          });

          toast.success("Section rewritten successfully");
        }
      } catch (error) {
        console.error("Error rewriting section:", error);
        toast.error("Failed to rewrite section");
      } finally {
        // Clear the rewriting state
        setRewritingSection(null);
        setRewriteFeedback("");
        setRewritingSectionIndex(null);
      }
    }
  };

  const handleRewriteClick = (index: number) => {
    // Toggle the rewrite section if clicking on the same section
    if (rewritingSectionIndex === index) {
      setRewritingSectionIndex(null);
      setRewriteFeedback("");
    } else {
      setRewritingSectionIndex(index);
      setRewriteFeedback("");
    }
  };

  const handleMarkAsReviewReady = async (index: number) => {
    try {
      const section = outline[index];

      // If no reviewer has been assigned, show a toast and return
      if (!section.reviewer) {
        toast.warning(
          "Please assign a reviewer before marking as review ready"
        );
        return;
      }

      // Find the reviewer in the organization users to get their email
      const reviewerUser = organizationUsers.find(
        (user) => user.username === section.reviewer
      );

      if (!reviewerUser || !reviewerUser.email) {
        toast.error(
          "Could not find reviewer's email. Please reassign the reviewer."
        );
        return;
      }

      // After successfully updating the status, create a task for the reviewer
      try {
        const taskData = {
          name: `Review section: ${section.heading} (Ready for Review)`,
          bid_id: sharedState.object_id,
          index: index,
          priority: "high", // Optionally set higher priority for review tasks
          target_user: reviewerUser.username // Use login if available, fall back to email or username
        };

        console.log(reviewerUser.username);

        // Create the task
        const response = await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/set_user_task`,
          taskData,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`
            }
          }
        );

        if (response.data.success) {
          // Track review ready action with posthog
          posthog.capture("section_marked_review_ready", {
            bidId: sharedState.object_id,
            sectionId: section.section_id,
            sectionHeading: section.heading,
            reviewer: section.reviewer,
            emailSent: true
          });
          toast.success(
            `Section "${section.heading}" marked as Review Ready and notification sent to ${reviewerUser.username}`
          );
        } else {
          console.error("Error creating review task:", response.data.error);
          toast.error("Failed to assign review task");
        }
      } catch (error) {
        console.error("Error creating task for review:", error);
        toast.error("Failed to create review task");
      }
    } catch (error) {
      console.error("Error marking section as review ready:", error);
      toast.error("Failed to mark section as review ready");
    }
  };
  // Rich text editor functions
  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (activeEditorRef.current) {
      activeEditorRef.current.focus();
    }
  };

  // Add this function to handle hyperlinks
  const handleLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) {
      execCommand("createLink", url);
    }
  };

  // Fix the list functions to ensure they work properly
  const handleBulletedList = () => {
    try {
      // Check if the selection is empty or just whitespace
      const selection = window.getSelection();
      if (selection && selection.toString().trim() === "") {
        // If empty, insert a list with a default item
        const listItem = document.createElement("ul");
        const li = document.createElement("li");
        li.innerHTML = "&nbsp;"; // Add a non-breaking space
        listItem.appendChild(li);

        // Insert at current position
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(listItem);

        // Place cursor inside the list item
        const newRange = document.createRange();
        newRange.setStart(li, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // If there's content, use the standard command
        document.execCommand("insertUnorderedList", false, null);
      }
    } catch (e) {
      // Fallback implementation if the command fails
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        // Create a list element
        const ul = document.createElement("ul");
        const li = document.createElement("li");
        li.textContent = selectedText || "List item";
        ul.appendChild(li);

        // Replace the selection with the list
        range.deleteContents();
        range.insertNode(ul);

        // Set cursor at the end of the list item
        const newRange = document.createRange();
        newRange.setStartAfter(li);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    if (activeEditorRef.current) {
      activeEditorRef.current.focus();
    }
  };

  const handleNumberedList = () => {
    try {
      // Check if the selection is empty or just whitespace
      const selection = window.getSelection();
      if (selection && selection.toString().trim() === "") {
        // If empty, insert a list with a default item
        const listItem = document.createElement("ol");
        const li = document.createElement("li");
        li.innerHTML = "&nbsp;"; // Add a non-breaking space
        listItem.appendChild(li);

        // Insert at current position
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(listItem);

        // Place cursor inside the list item
        const newRange = document.createRange();
        newRange.setStart(li, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // If there's content, use the standard command
        document.execCommand("insertOrderedList", false, null);
      }
    } catch (e) {
      // Fallback implementation if the command fails
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        // Create a list element
        const ol = document.createElement("ol");
        const li = document.createElement("li");
        li.textContent = selectedText || "List item";
        ol.appendChild(li);

        // Replace the selection with the list
        range.deleteContents();
        range.insertNode(ol);

        // Set cursor at the end of the list item
        const newRange = document.createRange();
        newRange.setStartAfter(li);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    if (activeEditorRef.current) {
      activeEditorRef.current.focus();
    }
  };

  // Fix the blockquote command
  const handleBlockquote = () => {
    // First try the standard approach
    try {
      document.execCommand("formatBlock", false, "<blockquote>");
    } catch (e) {
      // If that fails, try a more manual approach
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedContent = range.extractContents();
        const blockquote = document.createElement("blockquote");
        blockquote.appendChild(selectedContent);
        range.insertNode(blockquote);

        // Ensure the editor maintains focus
        if (activeEditorRef.current) {
          activeEditorRef.current.focus();
        }
      }
    }
  };

  // Add this function to handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== "") {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      const editorContainerRect =
        editorContainerRef.current?.getBoundingClientRect();

      // Store the selected range for later use
      setSelectedRange(range.cloneRange());

      // Position the menu above the selection, relative to the editor
      const topPosition = rect.top - (editorContainerRect?.top || 0);
      setSelectionMenuPosition({
        top: topPosition // Position above the selection, relative to editor
      });

      setShowSelectionMenu(true);
    } else {
      setShowSelectionMenu(false);
      setSelectedRange(null);
    }
  };

  // Add comment handler
  const handleAddComment = () => {
    setShowCommentInput(true);

    // Highlight the selected text in grey instead of orange
    if (selectedRange) {
      // Create a span to wrap the selected content
      const span = document.createElement("span");
      span.className = "commented-text";
      span.dataset.commentId = `pending-${Date.now()}`;

      // Make sure the style applies to all child elements
      span.style.backgroundColor = "#FFE5CC";

      // Preserve the original HTML structure by cloning the range contents
      // instead of just wrapping everything in a span
      try {
        selectedRange.surroundContents(span);
      } catch (e) {
        // If surroundContents fails (which can happen with complex selections),
        // use a more robust approach that preserves the structure
        console.log("Using alternative comment highlighting method");

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
    }
  };

  // Add this new function to highlight comment and text
  const highlightCommentAndText = (commentId: string) => {
    setActiveComment(commentId);

    // First reset all comments and spans to default state
    document
      .querySelectorAll(
        "span.commented-text[data-comment-id]:not([data-comment-id^='pending-'])"
      )
      .forEach((span) => {
        (span as HTMLElement).style.backgroundColor = "#FFE5CC";

        // Reset all child elements
        const childElements = span.querySelectorAll("*");
        childElements.forEach((element) => {
          (element as HTMLElement).style.backgroundColor = "#FFE5CC";
        });
      });

    // Then highlight the selected comment and text
    const commentSpan = document.querySelector(
      `span.commented-text[data-comment-id="${commentId}"]`
    );

    if (commentSpan) {
      (commentSpan as HTMLElement).style.backgroundColor = "#FF8019";

      // Apply highlight to all child elements
      const childElements = commentSpan.querySelectorAll("*");
      childElements.forEach((element) => {
        (element as HTMLElement).style.backgroundColor = "#FF8019";
      });
    }
  };

  const handleContentChange = (index: number, newContent: string) => {
    setSharedState((prevState) => {
      // Create a shallow copy of the outline
      const newOutline = [...prevState.outline];

      // Update only the specific section
      newOutline[index] = {
        ...newOutline[index], // Keep all other properties
        answer: newContent // Update only the answer field
      };

      // Return the new state with only the outline updated
      return {
        ...prevState,
        outline: newOutline
      };
    });
  };

  // Modify the handleEvidencePrompt function to store the range more reliably
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

    setPromptTarget(selectedText);
    setActionType("evidence");
    // Store a deep clone of the range for later use
    const storedRange = selectedRange.cloneRange();
    setSelectedRange(storedRange);

    // Highlight the selected text with a different color
    const span = document.createElement("span");
    span.className = "evidence-text";
    span.dataset.evidenceId = `evidence-${Date.now()}`;
    span.style.backgroundColor = "#FFE5CC"; // Light blue background

    try {
      selectedRange.surroundContents(span);
    } catch (e) {
      // If surroundContents fails (which can happen with complex selections),
      // use a more robust approach that preserves the structure
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
      // Create FormData instead of using JSON
      const formData = new FormData();
      formData.append("selected_text", selectedText);

      // Make API call to get evidence using FormData
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
          bid_id: sharedState.object_id
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
          bid_id: sharedState.object_id
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

  const handleReplaceWithPrompt = (text: string) => {
    if (!text) {
      toast.error("No content to replace");
      return;
    }

    try {
      // Find any of the special spans
      const span =
        document.querySelector("span.evidence-text") ||
        document.querySelector("span.summarise-text") ||
        document.querySelector("span.expand-text");

      if (span) {
        // Create a new range targeting the span
        const range = document.createRange();
        range.selectNode(span);

        // Delete the span and its contents
        range.deleteContents();

        // Insert the text parameter instead of promptResult
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);

        // Clear the prompt result
        setPromptResult("");

        // Update the shared state with the new content if we have a current section
        if (currentSectionIndex !== null && activeEditorRef.current) {
          const newContent = activeEditorRef.current.innerHTML;

          setSharedState((prevState) => {
            const newOutline = [...prevState.outline];
            newOutline[currentSectionIndex] = {
              ...newOutline[currentSectionIndex],
              answer: newContent
            };
            return {
              ...prevState,
              outline: newOutline
            };
          });
        }
      } else if (selectedRange) {
        console.log("selected range");
        // Fall back to using the stored selectedRange if span not found
        selectedRange.deleteContents();
        const textNode = document.createTextNode(text);
        selectedRange.insertNode(textNode);
        setPromptResult("");

        // Update the shared state with the new content if we have a current section
        if (currentSectionIndex !== null && activeEditorRef.current) {
          const newContent = activeEditorRef.current.innerHTML;

          setSharedState((prevState) => {
            const newOutline = [...prevState.outline];
            newOutline[currentSectionIndex] = {
              ...newOutline[currentSectionIndex],
              answer: newContent
            };
            return {
              ...prevState,
              outline: newOutline
            };
          });
        }
      } else {
        // If no specific location found, insert at current cursor position or end of editor
        if (currentSectionIndex !== null && activeEditorRef.current) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            // Get the range at the current cursor position
            const range = selection.getRangeAt(0);

            // Check if the cursor is within the editor
            if (
              activeEditorRef.current.contains(range.commonAncestorContainer)
            ) {
              // Insert text at current cursor position
              document.execCommand("insertText", false, text);
            } else {
              // If cursor is not in the editor, place it at the end of editor content
              const endRange = document.createRange();
              endRange.selectNodeContents(activeEditorRef.current);
              endRange.collapse(false); // Collapse to end

              selection.removeAllRanges();
              selection.addRange(endRange);

              // Now insert at the end
              document.execCommand("insertText", false, text);
            }
          } else {
            // If no selection exists, append to the end of the editor
            activeEditorRef.current.focus();
            const endRange = document.createRange();
            endRange.selectNodeContents(activeEditorRef.current);
            endRange.collapse(false); // Collapse to end

            const sel = window.getSelection();
            if (sel) {
              sel.removeAllRanges();
              sel.addRange(endRange);
              document.execCommand("insertText", false, text);
            }
          }

          // Clear the prompt result
          setPromptResult("");

          // Update the shared state with the new content
          const newContent = activeEditorRef.current.innerHTML;
          setSharedState((prevState) => {
            const newOutline = [...prevState.outline];
            newOutline[currentSectionIndex] = {
              ...newOutline[currentSectionIndex],
              answer: newContent
            };
            return {
              ...prevState,
              outline: newOutline
            };
          });

          // toast.success("Text inserted at cursor position");
        } else {
          toast.error("Please select a section to edit first");
        }
      }
    } catch (error) {
      console.error("Error replacing text:", error);
      toast.error("Failed to replace text");
    }
  };

  const handleCancelPrompt = () => {
    // Find any of the special spans
    const span =
      document.querySelector("span.evidence-text") ||
      document.querySelector("span.summarise-text") ||
      document.querySelector("span.expand-text");

    if (span) {
      // Get the text content
      const textContent = span.textContent || "";

      // Create a text node to replace the span
      const textNode = document.createTextNode(textContent);

      // Replace the span with its text content
      span.parentNode?.replaceChild(textNode, span);
    }

    setPromptResult("");
    setPromptTarget("");
  };

  // Copy section handler
  const handleCopySection = (index: number) => {
    if (index >= 0 && index < outline.length) {
      const section = outline[index];
      if (section) {
        navigator.clipboard.writeText(section.answer).catch((err) => {
          console.error("Failed to copy section: ", err);
          toast.error("Failed to copy section");
        });
        toast.success("Copied to clipboard");
      }
    }
  };

  const handleDownloadDocument = async () => {
    if (!sharedState.object_id) {
      toast.error("No bid ID found");
      return;
    }
    try {
      toast.info("Preparing document for download...");

      // Create FormData instead of JSON
      const formData = new FormData();
      formData.append("bid_id", sharedState.object_id);

      const response = await axios({
        method: "post",
        url: `http${HTTP_PREFIX}://${API_URL}/generate_docx`,
        data: formData,
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${tokenRef.current}`
          // Don't set Content-Type - axios will set it correctly with boundaries
        }
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a temporary link element to trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sharedState.bidInfo || "proposal"}.docx`;

      // Append to the DOM, click and then remove
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success("Document downloaded successfully");

      // Track download with posthog
      posthog.capture("proposal_document_downloaded", {
        bidId: sharedState.object_id,
        format: "docx"
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

  // Add this new effect to handle clicks outside of highlighted text
  useEffect(() => {
    // Handler for clicks outside of highlighted text
    const handleClickOutsideHighlight = (event: MouseEvent) => {
      // Check if we have any of the special highlight spans
      const evidenceSpans = document.querySelectorAll("span.evidence-text");
      const expandSpans = document.querySelectorAll("span.expand-text");
      const summariseSpans = document.querySelectorAll("span.summarise-text");

      // Only proceed if we have at least one highlighted span
      if (
        evidenceSpans.length === 0 &&
        expandSpans.length === 0 &&
        summariseSpans.length === 0
      ) {
        return;
      }

      // Check if the click is inside any of these spans
      let isClickInsideHighlight = false;

      // Check evidence spans
      evidenceSpans.forEach((span) => {
        if (span.contains(event.target as Node)) {
          isClickInsideHighlight = true;
        }
      });

      // Check expand spans
      expandSpans.forEach((span) => {
        if (span.contains(event.target as Node)) {
          isClickInsideHighlight = true;
        }
      });

      // Check summarise spans
      summariseSpans.forEach((span) => {
        if (span.contains(event.target as Node)) {
          isClickInsideHighlight = true;
        }
      });

      // Check if the click is inside the sidepane - use more robust detection methods
      // Check both by class and by checking the sidepane DOM reference directly
      const sidepaneElement = document.querySelector(
        ".proposal-preview-sidepane"
      );

      // Also check if this is a click within any element inside the sidepane section of our component
      const sidePane = document.querySelector(
        '[class*="proposal-preview-sidepane"]'
      );
      const isInsideSidepaneElement =
        sidepaneElement && sidepaneElement.contains(event.target as Node);
      const isInsideSidePane =
        sidePane && sidePane.contains(event.target as Node);

      // Also check if we're clicking inside the right sidebar where the sidepane lives
      const rightSidebar = document.querySelector(
        ".max-h-\\[calc\\(100vh-66px\\)\\]"
      );
      const isInsideRightSidebar =
        rightSidebar && rightSidebar.contains(event.target as Node);

      if (isInsideSidepaneElement || isInsideSidePane || isInsideRightSidebar) {
        isClickInsideHighlight = true;
      }

      // If click is outside, remove the highlighting by calling handleCancelPrompt
      if (!isClickInsideHighlight && !isLoadingEvidence) {
        handleCancelPrompt();
      }
    };

    // Add event listener for mousedown
    document.addEventListener("mousedown", handleClickOutsideHighlight);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideHighlight);
    };
  }, [isLoadingEvidence]); // Re-attach when loading state changes

  // Add this new useEffect to handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only process if the active editor has focus
      if (
        activeEditorRef.current &&
        (document.activeElement === activeEditorRef.current ||
          activeEditorRef.current.contains(document.activeElement))
      ) {
        // Undo: Ctrl+Z
        if (event.ctrlKey && event.key === "z") {
          event.preventDefault(); // Prevent browser's default undo
          execCommand("undo");
        }

        // Redo: Ctrl+Y or Ctrl+Shift+Z
        if (
          (event.ctrlKey && event.key === "y") ||
          (event.ctrlKey && event.shiftKey && event.key === "z")
        ) {
          event.preventDefault(); // Prevent browser's default redo
          execCommand("redo");
        }
      }
    };

    // Add event listener for keydown
    document.addEventListener("keydown", handleKeyDown);

    // Clean up
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Empty dependency array as we don't need to re-add the listener

  useEffect(() => {
    // Add click handler to document to minimize comments when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is inside a comment
      const commentElements = document.querySelectorAll("[data-comment-id]");
      let isClickInsideComment = false;

      commentElements.forEach((element) => {
        if (element.contains(event.target as Node)) {
          isClickInsideComment = true;
        }
      });

      // Only reset if click is outside comments
      if (!isClickInsideComment) {
        setActiveComment(null);
        document
          .querySelectorAll(
            "span.commented-text[data-comment-id]:not([data-comment-id^='pending-'])"
          )
          .forEach((span) => {
            (span as HTMLElement).style.backgroundColor = "#FFE5CC";
          });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to set active editor ref when a section is focused
  const setActiveEditor = (ref: HTMLDivElement | null, index: number) => {
    activeEditorRef.current = ref;
    setCurrentSectionIndex(index);
  };

  return (
    <div className="proposal-preview-container pb-8">
      <div>
        {localLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner className="w-8 h-8" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-end pr-8">
              <Button onClick={handleDownloadDocument}>
                <Download size={16} />
                Download
              </Button>
            </div>
            <div className="flex gap-2 pr-4">
              <div
                className={cn(
                  "h-full relative flex justify-center gap-4 flex-1"
                )}
              >
                <div className="rounded-md bg-white w-full max-w-4xl flex-1">
                  <div className="border border-gray-line bg-gray-50 px-4 py-2 rounded-t-md flex items-center justify-between gap-2 sticky -top-4 z-10">
                    <span>
                      {currentSectionIndex !== null
                        ? `Question ${getSectionHeading(outline[currentSectionIndex].heading)}`
                        : "Proposal Preview"}
                    </span>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-8 flex items-center gap-1"
                          >
                            <ParagraphIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2">
                          <div className="grid gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => execCommand("formatBlock", "<h1>")}
                              className="justify-start"
                            >
                              <Heading1 size={16} className="mr-2" /> Heading 1
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => execCommand("formatBlock", "<h2>")}
                              className="justify-start"
                            >
                              <Heading2 size={16} className="mr-2" /> Heading 2
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => execCommand("formatBlock", "<h3>")}
                              className="justify-start"
                            >
                              <Heading3 size={16} className="mr-2" /> Heading 3
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => execCommand("formatBlock", "<h4>")}
                              className="justify-start"
                            >
                              <Heading4 size={16} className="mr-2" /> Heading 4
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => execCommand("formatBlock", "<p>")}
                              className="justify-start"
                            >
                              <Type size={16} className="mr-2" /> Paragraph
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleBulletedList}
                              className="justify-start"
                            >
                              <List size={16} className="mr-2" /> Bulleted List
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleNumberedList}
                              className="justify-start"
                            >
                              <ListOrdered size={16} className="mr-2" />{" "}
                              Numbered List
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => execCommand("bold")}
                        className="p-1 h-8"
                      >
                        <BoldIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => execCommand("italic")}
                        className="p-1 h-8"
                      >
                        <ItalicIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => execCommand("underline")}
                        className="p-1 h-8"
                      >
                        <UnderlineIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLink}
                        className="p-1 h-8"
                      >
                        <HyperlinkIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => execCommand("strikeThrough")}
                        className="p-1 h-8"
                      >
                        <StrikeThroughIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBlockquote}
                        className="p-1 h-8"
                      >
                        <QuoteIcon />
                      </Button>
                      <div className="h-6 w-px bg-gray-300 mx-1"></div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => execCommand("justifyLeft")}
                        className="p-1 h-8"
                      >
                        <AlignLeft size={16} className="text-gray-hint_text" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => execCommand("justifyCenter")}
                        className="p-1 h-8"
                      >
                        <AlignCenter
                          size={16}
                          className="text-gray-hint_text"
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => execCommand("justifyRight")}
                        className="p-1 h-8"
                      >
                        <AlignRight size={16} className="text-gray-hint_text" />
                      </Button>
                      <div className="h-6 w-px bg-gray-300 mx-1"></div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => execCommand("undo")}
                        className="p-1 h-8"
                      >
                        <UndoIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => execCommand("redo")}
                        className="p-1 h-8"
                      >
                        <RedoIcon />
                      </Button>
                    </div>

                    <Popover
                      open={versionPopoverOpen}
                      onOpenChange={setVersionPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className="text-gray-hint_text [&_svg]:w-3 opacity-0"
                        >
                          <span>
                            {selectedVersion === "version2"
                              ? "Version 2"
                              : "Version 1"}
                          </span>
                          <ArrowDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48">
                        <div className="px-3 py-2 border-b border-gray-line">
                          <Button
                            className="w-full rounded-2xl"
                            size="sm"
                            onClick={() => {
                              toast.success("New version saved");
                            }}
                          >
                            <PlusCircleIcon /> Save Version
                          </Button>
                        </div>
                        <RadioGroup
                          defaultValue="version2"
                          value={selectedVersion}
                          onValueChange={handleSelectVersion}
                        >
                          {["version2", "version1"].map((version) => (
                            <div
                              key={version}
                              className="flex items-center space-x-2 px-3 py-2 cursor-pointer border-b last:border-none border-gray-line"
                              onClick={() => handleSelectVersion(version)}
                            >
                              <RadioGroupItem value={version} id={version} />
                              <div className="flex flex-col gap-1">
                                <span className="font-medium text-gray-hint_text">
                                  {version === "version2"
                                    ? "Version 2"
                                    : "Version 1"}
                                </span>
                                <span className="text-xs text-gray">
                                  Created 15 Mar
                                </span>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div
                    className="h-auto relative border-x border-gray-line"
                    ref={editorContainerRef}
                  >
                    {outline.length > 0 ? (
                      // Display sections from the outline
                      outline.map((section, index) => (
                        <div
                          key={section.section_id}
                          className={cn(
                            "border-b border-gray-line relative last:rounded-b-md"
                          )}
                        >
                          <div className="bg-white p-8 relative">
                            <h2 className="text-xl font-semibold mb-4">
                              {section.heading}
                            </h2>

                            {/* Display section question if it exists */}
                            {section.question && (
                              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                <p className="font-medium text-gray-700 mb-1">
                                  Question:
                                </p>
                                <p className="text-gray-600">
                                  {section.question}
                                </p>
                              </div>
                            )}

                            <DebouncedContentEditable
                              content={section.answer || ""}
                              onChange={(newContent) =>
                                handleContentChange(index, newContent)
                              }
                              onFocus={() => {
                                setActiveEditor(
                                  editorRefs.current[index],
                                  index
                                );
                              }}
                              onClick={() => {
                                if (currentSectionIndex !== index) {
                                  setActiveEditor(
                                    editorRefs.current[index],
                                    index
                                  );
                                }
                              }}
                              onSelectionChange={(selection) => {
                                if (selection) {
                                  handleTextSelection();
                                }
                              }}
                              disabled={false}
                              editorRef={(el) => {
                                editorRefs.current[index] = el;
                                if (currentSectionIndex === index) {
                                  activeEditorRef.current = el;
                                }
                              }}
                            />

                            {/* Inline rewrite feedback section */}
                            {rewritingSectionIndex === index && (
                              <div className="flex items-center gap-2 relative border border-gray-200 rounded-md p-2 bg-white shadow-tooltip my-2">
                                <Input
                                  placeholder="Please type your instructions in here..."
                                  value={rewriteFeedback}
                                  onChange={(e) =>
                                    setRewriteFeedback(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      if (rewriteFeedback.trim()) {
                                        handleRewriteSubmit();
                                      }
                                    }
                                  }}
                                  className="flex-1 border-none outline-none bg-transparent focus-visible:ring-0 shadow-none text-sm h-8 px-2"
                                />
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setRewritingSectionIndex(null);
                                      setRewriteFeedback("");
                                    }}
                                  >
                                    <X size={16} />
                                  </Button>
                                  <Button
                                    onClick={handleRewriteSubmit}
                                    disabled={
                                      !rewriteFeedback.trim() ||
                                      rewritingSection === section.section_id
                                    }
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                  >
                                    {rewritingSection === section.section_id ? (
                                      <Spinner className="text-white" />
                                    ) : (
                                      <Send className="text-white" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Section action buttons */}
                            <div className="flex gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopySection(index)}
                                className="text-xs text-gray-hint_text"
                              >
                                <CopyIcon /> Copy
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRewriteClick(index)}
                                disabled={
                                  rewritingSection === section.section_id
                                }
                                className="text-xs text-gray-hint_text"
                              >
                                <RedoSparkIcon /> Rewrite
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs text-gray-hint_text"
                                onClick={() => handleMarkAsReviewReady(index)}
                              >
                                <PencilEditCheckIcon />
                                Mark as Review Ready
                              </Button>
                            </div>
                          </div>

                          {/* Show a meta info box with section details */}
                          <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 flex justify-between border-t border-gray-200">
                            <div>
                              <span className="font-medium">Status:</span>{" "}
                              {section.status}
                            </div>
                            <div>
                              <span className="font-medium">Words:</span>{" "}
                              {section.word_count || 0}
                            </div>
                            {section.reviewer && (
                              <div>
                                <span className="font-medium">Reviewer:</span>{" "}
                                {section.reviewer}
                              </div>
                            )}
                            {section.answerer && (
                              <div>
                                <span className="font-medium">Answerer:</span>{" "}
                                {section.answerer}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-center items-center h-full bg-muted p-5 text-center">
                        <p>
                          No sections found in the outline. Add sections in the
                          bid outline tab to start building your proposal.
                        </p>
                      </div>
                    )}

                    {/* Selection Menu */}
                    {showSelectionMenu && (
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
                              <TooltipContent side="left">
                                Add Comment
                              </TooltipContent>
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
                              <TooltipContent side="left">
                                Evidence
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {/* <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleEvidencePrompt}
                                  className="p-2 flex flex-col items-center text-xs [&_svg]:size-6 h-auto"
                                >
                                  <PencilIcon />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                Custom
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider> */}
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
                              <TooltipContent side="left">
                                Expand
                              </TooltipContent>
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
                              <TooltipContent side="left">
                                Summarise
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {showCommentInput ||
                (currentSectionIndex !== null &&
                  getCommentsForCurrentSection(
                    outline,
                    outline[currentSectionIndex].section_id
                  ).length > 0) ? (
                  <div className="h-auto w-72 relative">
                    {/* Comment Input */}
                    {showCommentInput && (
                      <div
                        className="absolute left-0 bg-white shadow-lg rounded-md border border-gray-200 z-[51] p-3 w-72"
                        style={{
                          top: `${selectionMenuPosition.top}px`
                        }}
                      >
                        <Textarea
                          className="w-full mb-2"
                          rows={3}
                          placeholder="Add your comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCancelComment(
                                setCommentText,
                                setShowSelectionMenu,
                                setShowCommentInput
                              )
                            }
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              handleSaveComment(
                                commentText,
                                currentSectionIndex,
                                selectionMenuPosition,

                                outline,
                                auth,
                                setSharedState,

                                setCommentText,
                                setShowSelectionMenu,
                                setShowCommentInput,
                                highlightCommentAndText
                              )
                            }
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Comments Display */}
                    {currentSectionIndex !== null &&
                      getCommentsForCurrentSection(
                        outline,
                        outline[currentSectionIndex].section_id
                      ).map((comment) => (
                        <div
                          key={comment.id}
                          className={cn(
                            "transition-all duration-300 w-fit absolute left-0",
                            activeComment === comment.id &&
                              "p-2 rounded-md border bg-white border-gray-line shadow-md z-[52]"
                          )}
                          data-comment-id={comment.id}
                          style={{
                            top: `${comment.position}px`
                          }}
                        >
                          <div className="flex justify-between items-start w-72">
                            <div
                              className="space-y-1 w-full"
                              onClick={() =>
                                highlightCommentAndText(comment.id)
                              }
                            >
                              <ProfilePhoto size="sm" showName={true} />
                              <p className="text-sm cursor-pointer">
                                {comment.text}
                              </p>

                              {/* Show reply count when comment is not active */}
                              {activeComment !== comment.id &&
                                comment.replies?.length > 0 && (
                                  <p className="text-xs text-gray-hint_text mt-1">
                                    {comment.replies.length === 1
                                      ? "1 reply"
                                      : `${comment.replies.length} replies`}
                                  </p>
                                )}
                            </div>
                            {activeComment === comment.id && (
                              <div className="flex">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleResolution(
                                            comment.id,
                                            currentSectionIndex,
                                            setSharedState
                                          );
                                        }}
                                        className="group p-0 hover:bg-transparent border-none"
                                      >
                                        <Check
                                          size={16}
                                          className="group-hover:text-orange"
                                        />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Resolve and hide
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                          </div>

                          {/* Show replies when comment is active */}
                          {activeComment === comment.id &&
                            comment.replies.length > 0 && (
                              <div className="mt-2 border-t border-gray-200 pt-2">
                                <p className="text-xs font-medium text-gray-hint_text mb-2">
                                  Replies
                                </p>
                                <div className="space-y-3">
                                  {comment.replies.map((reply) => (
                                    <div
                                      key={reply.id}
                                      className="pl-3 border-l-2 border-gray-200"
                                    >
                                      <div className="flex flex-col gap-2">
                                        <ProfilePhoto
                                          size="sm"
                                          showName={true}
                                        />
                                        <div>
                                          <p className="text-xs">
                                            {reply.text}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {activeComment === comment.id ? (
                            <div className="mt-2 w-full">
                              <Textarea
                                className="w-full border border-gray-300 rounded p-2 mb-2 text-sm"
                                rows={2}
                                placeholder="Add your reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleCancelReply(
                                      setReplyText,
                                      setActiveComment
                                    )
                                  }
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() =>
                                    handleSubmitReply(
                                      comment.id,
                                      replyText,
                                      currentSectionIndex,
                                      auth,
                                      setSharedState,

                                      setReplyText
                                    )
                                  }
                                >
                                  Reply
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ))}
                  </div>
                ) : null}
              </div>
              <div
                className={cn(
                  "max-h-[calc(100vh-66px)] overflow-auto z-50 sticky -top-4 right-0"
                )}
              >
                {sidepaneOpen && (
                  <ProposalPreviewSidepane
                    bid_id={sharedState.object_id}
                    open={sidepaneOpen}
                    onOpenChange={setSidepaneOpen}
                    promptTarget={promptTarget}
                    promptResult={promptResult}
                    isLoadingEvidence={isLoadingEvidence}
                    onReplace={handleReplaceWithPrompt}
                    onCancelPrompt={handleCancelPrompt}
                    actionType={actionType} // Add this line
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tools sidebar */}
      <div className="fixed top-[58px] right-[8px] z-50 border-l border-gray-line h-[calc(100vh-66px)] rounded-br-2xl overflow-hidden">
        <div className="flex flex-col gap-2 p-2 bg-white h-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidepane}
                  className="[&_svg]:size-6 text-gray-hint_text"
                >
                  <ToolSparkIcon
                    className={cn(sidepaneOpen ? "text-orange" : "")}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                className="border-[0.5px] border-gray-line rounded-md p-2 px-1.5 py-1 shadow-tooltip bg-white"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-gray-hint_text font-medium text-sm">
                    AI Chat
                  </span>
                  <span className="text-gray-border text-xs">
                    Chat, brainstorm, research
                  </span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="[&_svg]:size-6">
                  <ConsultIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                className="border-[0.5px] border-gray-line rounded-md p-2 px-1.5 py-1 shadow-tooltip bg-white"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-gray-hint_text font-medium text-sm">
                    Consult
                  </span>
                  <span className="text-gray-border text-xs">
                    Polish your writing
                  </span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="[&_svg]:size-6">
                  <CheckDocumentIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                className="border-[0.5px] border-gray-line rounded-md p-2 px-1.5 py-1 shadow-tooltip bg-white"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-gray-hint_text font-medium text-sm">
                    Checks
                  </span>
                  <span className="text-gray-border text-xs">
                    Use ready made prompts
                  </span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
        </div>
      </div>
    </div>
  );
};

export default withAuth(ProposalPreview);
