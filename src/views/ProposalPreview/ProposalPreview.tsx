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
  Save,
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
// import CheckDocumentIcon from "@/components/icons/CheckDocumentIcon";
// import ConsultIcon from "@/components/icons/ConsultIcon";
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
import PencilIcon from "@/components/icons/PencilIcon";
import { cn, getSectionHeading } from "@/utils";
import {
  addTailwindClasses,
  formatSectionText
} from "@/utils/formatSectionText";
import { toast } from "react-toastify";
import posthog from "posthog-js";
import { debounce } from "lodash";

const ProposalPreview = () => {
  const editorRef = useRef<HTMLDivElement>(null);
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
  const [comments, setComments] = useState<
    {
      id: string;
      text: string;
      resolved: boolean;
      position: number;
      sectionId: string;
      replies: { id: string; text: string; author?: string }[];
    }[]
  >([]);
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
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Create a debounced version of the save function with useRef to maintain the reference
  const debouncedSave = useRef(
    debounce((index, content) => {
      // Update just the specific section in the shared state without replacing the entire outline
      setSharedState((prevState) => {
        // Create a shallow copy of the outline
        const newOutline = [...prevState.outline];

        // Update only the specific section
        newOutline[index] = {
          ...newOutline[index], // Keep all other properties
          answer: content // Update only the answer field
        };

        // Return the new state with only the outline updated
        return {
          ...prevState,
          outline: newOutline
        };
      });
    }, 1000) // 1 second delay
  ).current;

  // 3. Add a cleanup for the debounced function
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // 4. Add an event listener to detect content changes and trigger auto-save
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && currentSectionIndex !== null) {
      const handleInput = () => {
        // Get the current content
        const content = editor.innerHTML;

        // Trigger the debounced save
        debouncedSave(currentSectionIndex, content);
      };

      // Add input event listener
      editor.addEventListener("input", handleInput);

      // Clean up
      return () => {
        editor.removeEventListener("input", handleInput);
      };
    }
  }, [currentSectionIndex, editorRef.current]);

  // Then update the handleSaveEdit function to properly format the content before saving
  const handleSaveEdit = () => {
    if (editorRef.current && currentSectionIndex !== null) {
      // Get the HTML content from the editor
      const rawContent = editorRef.current.innerHTML;

      // Apply any formatting if needed
      const formattedContent = addTailwindClasses(rawContent);

      // Update just the specific section
      setSharedState((prevState) => {
        const newOutline = [...prevState.outline];
        newOutline[currentSectionIndex] = {
          ...newOutline[currentSectionIndex],
          answer: formattedContent
        };

        return {
          ...prevState,
          outline: newOutline
        };
      });

      toast.success("Changes saved successfully");
      setCurrentSectionIndex(null);
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

    if (editorRef.current) {
      editorRef.current.focus();
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

    if (editorRef.current) {
      editorRef.current.focus();
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
        if (editorRef.current) {
          editorRef.current.focus();
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

  // Save comment handler
  const handleSaveComment = () => {
    if (commentText.trim() && currentSectionIndex !== null) {
      const commentId = `comment-${Date.now()}`;
      let position = selectionMenuPosition.top;

      // Check if there's already a comment at this position and adjust if needed
      const existingCommentPositions = comments.map((c) => c.position);
      while (existingCommentPositions.includes(position)) {
        position += 30; // Move down by 30px if position is already taken
      }

      // Update the pending comment span with the actual comment ID
      const pendingSpans = document.querySelectorAll(
        'span.commented-text[data-comment-id^="pending-"]'
      );
      if (pendingSpans.length > 0) {
        const span = pendingSpans[pendingSpans.length - 1];
        span.dataset.commentId = commentId;

        // Make the highlight a darker grey instead of orange
        span.style.backgroundColor = "#FFE5CC";

        // Apply the style to all child elements
        const childElements = span.querySelectorAll("*");
        childElements.forEach((element) => {
          (element as HTMLElement).style.backgroundColor = "#FFE5CC";
        });

        // Add click event to highlight when clicked
        span.addEventListener("click", () => {
          highlightCommentAndText(commentId);
        });
      }

      const newComment = {
        id: commentId,
        text: commentText,
        resolved: false,
        position: position,
        sectionId: outline[currentSectionIndex].section_id,
        replies: [] // Initialize with empty replies array
      };
      setComments([...comments, newComment]);
      setCommentText("");
    }
    setShowSelectionMenu(false);
    setShowCommentInput(false);
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

  // Add this new function to handle comment cancellation
  const handleCancelComment = () => {
    // Find and remove the pending comment span
    const pendingSpans = document.querySelectorAll(
      'span.commented-text[data-comment-id^="pending-"]'
    );
    if (pendingSpans.length > 0) {
      const span = pendingSpans[pendingSpans.length - 1];
      // Replace the span with its text content
      const textNode = document.createTextNode(span.textContent || "");
      span.parentNode?.replaceChild(textNode, span);
    }

    setCommentText("");
    setShowSelectionMenu(false);
    setShowCommentInput(false);
  };

  // Toggle comment resolution
  const handleToggleResolution = (id: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === id) {
          // If resolving the comment, remove the highlight but keep the text
          if (!comment.resolved) {
            const commentedSpan = document.querySelector(
              `span.commented-text[data-comment-id="${id}"]`
            );
            if (commentedSpan) {
              // Create a document fragment to hold all the span's contents
              const fragment = document.createDocumentFragment();

              // Move all child nodes from the span to the fragment
              while (commentedSpan.firstChild) {
                fragment.appendChild(commentedSpan.firstChild);
              }

              // Insert the fragment before the span
              commentedSpan.parentNode?.insertBefore(fragment, commentedSpan);

              // Then remove the empty span
              commentedSpan.parentNode?.removeChild(commentedSpan);
            }
          }
          return { ...comment, resolved: !comment.resolved };
        }
        return comment;
      })
    );
  };

  // Add this function to remove resolved comments from the list
  const filterResolvedComments = () => {
    return comments.filter((comment) => !comment.resolved);
  };

  // Filter comments by current section
  const getCommentsForCurrentSection = () => {
    if (currentSectionIndex === null) return [];
    const currentSectionId = outline[currentSectionIndex].section_id;
    return filterResolvedComments().filter(
      (comment) => comment.sectionId === currentSectionId
    );
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

  const handleReplaceWithPrompt = () => {
    if (!promptResult) {
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

        // Insert the prompt result
        const textNode = document.createTextNode(promptResult);
        range.insertNode(textNode);

        // Clear the prompt result
        setPromptResult("");

        // Update the shared state with the new content if we have a current section
        if (currentSectionIndex !== null && editorRef.current) {
          const newContent = editorRef.current.innerHTML;

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

        toast.success("Text replaced successfully");
      } else if (selectedRange) {
        // Fall back to using the stored selectedRange if span not found
        selectedRange.deleteContents();
        const textNode = document.createTextNode(promptResult);
        selectedRange.insertNode(textNode);
        setPromptResult("");

        // Update the shared state with the new content if we have a current section
        if (currentSectionIndex !== null && editorRef.current) {
          const newContent = editorRef.current.innerHTML;

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

        toast.success("Text replaced successfully");
      } else {
        toast.error("Could not find the location to insert text");
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
  // Add event listeners for selection
  useEffect(() => {
    // The issue is here - we need to check if the selection is within the editor
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      // Check if the selection is within the editor
      const range = selection.getRangeAt(0);
      const editorContainsSelection = editorRef.current?.contains(
        range.commonAncestorContainer
      );

      if (editorContainsSelection) {
        handleTextSelection();
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

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

  // Add this new function to handle submitting a reply
  const handleSubmitReply = (commentId: string) => {
    if (replyText.trim() && commentId) {
      // Create a new reply object
      const newReply = {
        id: `reply-${Date.now()}`,
        text: replyText,
        author: auth?.name || "You" // Use authenticated user name if available
      };

      // Add the reply to the comment's replies array
      setComments(
        comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...comment.replies, newReply]
            };
          }
          return comment;
        })
      );

      // Reset the reply state
      setReplyText("");

      toast.success("Reply added");
    }
  };

  // Add this new function to handle canceling a reply
  const handleCancelReply = () => {
    setReplyText("");
    setActiveComment(null);
  };

  const handleSectionSelect = (index: number) => {
    setCurrentSectionIndex(index);
  };

  // Add this function to handle document download
  const handleDownloadDocument = () => {
    if (!outline || outline.length === 0) {
      toast.error("No content to download");
      return;
    }

    try {
      // Create a temporary div to hold the formatted document
      const tempDiv = document.createElement("div");
      tempDiv.className = "proposal-document";

      // Add some basic styling to the container
      tempDiv.style.fontFamily = "Arial, sans-serif";

      // Add a title to the document
      const title = document.createElement("h1");
      title.textContent = sharedState.bidInfo || "Proposal Document";
      title.style.textAlign = "center";
      title.style.marginBottom = "30px";
      tempDiv.appendChild(title);

      // Add each section to the document
      outline.forEach((section) => {
        // Add section heading
        const heading = document.createElement("h2");
        heading.textContent = section.heading;
        heading.style.marginTop = "30px";
        heading.style.marginBottom = "15px";
        heading.style.borderBottom = "1px solid #ddd";
        heading.style.paddingBottom = "10px";
        tempDiv.appendChild(heading);

        // Add section content
        const content = document.createElement("div");
        content.innerHTML = section.answer || "";
        tempDiv.appendChild(content);
      });

      // Get the HTML content
      const htmlContent = tempDiv.outerHTML;

      // Create a Blob with the HTML content
      const blob = new Blob(
        [
          "<html><head><title>" +
            (sharedState.bidInfo || "Proposal Document") +
            "</title></head><body>" +
            htmlContent +
            "</body></html>"
        ],
        { type: "text/html" }
      );

      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sharedState.bidInfo || "proposal"}.docx`;

      // Trigger the download
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success("Downloading document...");

      // Track download with posthog
      posthog.capture("proposal_document_downloaded", {
        bidId: sharedState.object_id,
        format: "html"
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

  // Update this function to insert text at current cursor position
  const handleInsertFromSidepane = (text: string) => {
    if (!text) {
      toast.error("No content to insert");
      return;
    }

    try {
      // Check if we have a currently selected section
      if (currentSectionIndex !== null && editorRef.current) {
        const selection = window.getSelection();

        // Insert at cursor position if there's a valid selection within the editor
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);

          // Check if the selection is within our editor
          const isSelectionInEditor = editorRef.current.contains(
            range.commonAncestorContainer
          );

          if (isSelectionInEditor) {
            // Create a wrapper div for the text to maintain formatting
            const wrapper = document.createElement("div");
            wrapper.innerHTML = text;

            // Insert the formatted content at cursor position
            range.deleteContents();

            // Insert each child node individually to preserve formatting
            while (wrapper.firstChild) {
              range.insertNode(wrapper.firstChild);
              range.collapse(false); // Move cursor to end of inserted content
            }

            // Create a copy of the outline
            const updatedOutline = [...outline];

            // Update the answer field with the new content
            updatedOutline[currentSectionIndex] = {
              ...updatedOutline[currentSectionIndex],
              answer: editorRef.current.innerHTML
            };

            // Update the shared state with the modified outline
            setSharedState((prevState) => ({
              ...prevState,
              outline: updatedOutline
            }));

            toast.success("Content inserted successfully");
            return;
          }
        }

        // Fallback: If no valid selection in editor, append to the end
        const currentContent = editorRef.current.innerHTML;
        editorRef.current.innerHTML = currentContent + `<div>${text}</div>`;

        // Create a copy of the outline
        const updatedOutline = [...outline];

        // Update the answer field with the new content
        updatedOutline[currentSectionIndex] = {
          ...updatedOutline[currentSectionIndex],
          answer: editorRef.current.innerHTML
        };

        // Update the shared state with the modified outline
        setSharedState((prevState) => ({
          ...prevState,
          outline: updatedOutline
        }));

        toast.success("Content inserted successfully");
      } else {
        toast.error("Please select a section to insert into");
      }
    } catch (error) {
      console.error("Error inserting text:", error);
      toast.error("Failed to insert text");
    }
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
                <div className="rounded-md bg-white w-full max-w-4xl">
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

                            <div
                              ref={
                                currentSectionIndex === index ? editorRef : null
                              }
                              dangerouslySetInnerHTML={{
                                __html: section.answer
                                  ? formatSectionText(section.answer)
                                  : ""
                              }}
                              className="font-sans text-base leading-relaxed w-full m-0 outline-none focus:outline-none"
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onFocus={() => {
                                setCurrentSectionIndex(index);
                              }}
                              onClick={() => {
                                if (currentSectionIndex !== index) {
                                  setCurrentSectionIndex(index);
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

                              {/* Toggle between Edit and Save buttons */}
                              {currentSectionIndex === index ? (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={handleSaveEdit}
                                  className="text-xs ml-auto"
                                >
                                  <Save size={16} /> Save
                                </Button>
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleSectionSelect(index)}
                                  className="text-xs ml-auto"
                                >
                                  Edit
                                </Button>
                              )}
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
                getCommentsForCurrentSection().length > 0 ? (
                  <div className="h-auto w-72 relative">
                    {/* Comment Input */}
                    {showCommentInput && (
                      <div
                        className="absolute left-0 bg-white shadow-lg rounded-md border border-gray-200 z-[51] p-3 w-72"
                        style={{
                          top: `${selectionMenuPosition.top}px`
                        }}
                      >
                        <textarea
                          className="w-full border border-gray-300 rounded p-2 mb-2 text-sm"
                          rows={3}
                          placeholder="Add your comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelComment}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleSaveComment}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Comments Display */}
                    {getCommentsForCurrentSection().map((comment) => (
                      <div
                        key={comment.id}
                        className={cn(
                          "transition-all duration-300 w-fit absolute left-0",
                          activeComment === comment.id &&
                            "p-2 rounded-md border bg-white border-gray-line shadow-md"
                        )}
                        data-comment-id={comment.id}
                        style={{
                          top: `${comment.position}px`
                        }}
                      >
                        <div className="flex justify-between items-start w-72">
                          <div
                            className="space-y-1 w-full"
                            onClick={() => highlightCommentAndText(comment.id)}
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
                                        handleToggleResolution(comment.id);
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
                                      <ProfilePhoto size="sm" showName={true} />
                                      <div>
                                        <p className="text-xs">{reply.text}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {activeComment === comment.id ? (
                          <div className="mt-2 w-full">
                            <textarea
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
                                onClick={handleCancelReply}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleSubmitReply(comment.id)}
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
                    onInsert={handleInsertFromSidepane}
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
