import { useContext, useRef, useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import withAuth from "../../routes/withAuth";
import { BidContext } from "../BidWritingStateManagerView";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants";
import axios from "axios";
import mammoth from "mammoth";
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
  Check
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import "./ProposalPreview.css";
import { TooltipContent } from "@/components/ui/tooltip";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@/components/ui/tooltip";
import ProfilePhoto from "@/layout/ProfilePhoto";
import ProposalPreviewSidepane from "./components/ProposalPreviewSidepane";
import CheckDocumentIcon from "@/components/icons/CheckDocumentIcon";
import ConsultIcon from "@/components/icons/ConsultIcon";
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
import { cn } from "@/utils";
import { toast } from "react-toastify";

const ProposalPreview = () => {
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
  const { sharedState, setSharedState } = useContext(BidContext);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
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
  const [showEvidencePrompt, setShowEvidencePrompt] = useState(false);
  const [promptResult, setPromptResult] = useState("");
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [sidepaneOpen, setSidepaneOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(
    null
  );
 
  // Get sections from shared state
  const { outline } = sharedState;

  // Function to toggle the sidepane
  const toggleSidepane = () => {
    setSidepaneOpen((prevState) => !prevState);
  };

  // const handleWordDownload = async () => {
  //   if (docUrl) {
  //     const link = document.createElement("a");
  //     link.href = docUrl;
  //     link.download = `proposal_${sharedState.bidInfo || "document"}.docx`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   }
  // };

  // Rich text editor functions
  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleSaveEdit = () => {
    if (editorRef.current && editingSectionId && currentSectionIndex !== null) {
      // Create a copy of the outline
      const updatedOutline = [...outline];

      // Update the answer field of the current section
      updatedOutline[currentSectionIndex] = {
        ...updatedOutline[currentSectionIndex],
        answer: editorRef.current.innerHTML
      };

      // Update the shared state with the modified outline
      setSharedState((prevState) => ({
        ...prevState,
        outline: updatedOutline
      }));

      toast.success("Changes saved successfully");
      setEditingSectionId(null);
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
      span.style.backgroundColor = "#FF8019";

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
        (element as HTMLElement).style.backgroundColor = "#FF8019";
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
        span.style.backgroundColor = "#FF8019";

        // Apply the style to all child elements
        const childElements = span.querySelectorAll("*");
        childElements.forEach((element) => {
          (element as HTMLElement).style.backgroundColor = "#FF8019";
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
        (span as HTMLElement).style.backgroundColor = "#FF8019";

        // Reset all child elements
        const childElements = span.querySelectorAll("*");
        childElements.forEach((element) => {
          (element as HTMLElement).style.backgroundColor = "#FF8019";
        });
      });

    // Then highlight the selected comment and text
    const commentSpan = document.querySelector(
      `span.commented-text[data-comment-id="${commentId}"]`
    );

    if (commentSpan) {
      (commentSpan as HTMLElement).style.backgroundColor = "#FFE5CC";

      // Apply highlight to all child elements
      const childElements = commentSpan.querySelectorAll("*");
      childElements.forEach((element) => {
        (element as HTMLElement).style.backgroundColor = "#FFE5CC";
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

  // Evidence prompt handler
  const handleEvidencePrompt = () => {
    setShowEvidencePrompt(true);
    // Simulate API call with dummy data
    setTimeout(() => {
      setPromptResult(
        "This is evidence data that would normally come from an API. It provides supporting information for the selected text."
      );
    }, 1000);
  };

  // Replace text with prompt result
  const handleReplaceWithPrompt = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(promptResult);
      range.insertNode(textNode);
    }
    setShowEvidencePrompt(false);
    setPromptResult("");
  };

  // Cancel prompt
  const handleCancelPrompt = () => {
    setShowEvidencePrompt(false);
    setPromptResult("");
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
            (span as HTMLElement).style.backgroundColor = "#FF8019";
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
    setEditingSectionId(outline[index].section_id);
  };

  return (
    <div className="proposal-preview-container pb-8">
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner className="w-8 h-8" />
          </div>
        ) : (
          <div
            className={cn(
              "w-full h-full relative flex justify-center gap-4",
              sidepaneOpen ? "pr-60" : ""
            )}
          >
            <div className="rounded-md bg-white w-full max-w-4xl">
              <div className="border border-gray-line bg-gray-50 px-4 py-2 rounded-t-md flex items-center justify-between gap-2 sticky -top-4 z-10">
                <span>Proposal Preview</span>
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
                          <ListOrdered size={16} className="mr-2" /> Numbered
                          List
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
                    <AlignCenter size={16} className="text-gray-hint_text" />
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
                        "border-b border-gray-line relative last:rounded-b-md",
                        editingSectionId === section.section_id && "bg-gray-50"
                      )}
                    >
                      <div className="bg-white p-8 relative">
                        <h2 className="text-xl font-semibold mb-4">
                          {section.heading}
                        </h2>
                        {section.status === "Not Started" ? (
                          <div className="p-4 bg-gray-50 rounded border border-gray-200 text-gray-500">
                            This section has not been started yet.
                          </div>
                        ) : (
                          <div
                            ref={
                              editingSectionId === section.section_id &&
                              currentSectionIndex === index
                                ? editorRef
                                : null
                            }
                            dangerouslySetInnerHTML={{
                              __html: section.answer || ""
                            }}
                            className="font-sans text-base leading-relaxed w-full m-0 outline-none focus:outline-none"
                            contentEditable={
                              editingSectionId === section.section_id &&
                              currentSectionIndex === index
                            }
                            suppressContentEditableWarning={true}
                            onFocus={() => {
                              setEditingSectionId(section.section_id);
                              setCurrentSectionIndex(index);
                            }}
                            onClick={() => {
                              if (editingSectionId !== section.section_id) {
                                handleSectionSelect(index);
                              }
                            }}
                          />
                        )}

                        {/* Section action buttons */}
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopySection(index)}
                            className="text-xs text-gray-hint_text"
                          >
                            <CopyIcon className="mr-1" /> Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-gray-hint_text"
                          >
                            <RedoSparkIcon className="mr-1" />
                            Rewrite
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-gray-hint_text"
                          >
                            <PencilEditCheckIcon className="mr-1" />
                            Mark as Review Ready
                          </Button>

                          {/* Toggle between Edit and Save buttons */}
                          {editingSectionId === section.section_id &&
                          currentSectionIndex === index ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={handleSaveEdit}
                              className="text-xs ml-auto"
                            >
                              <Save size={16} className="mr-1" /> Save
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
                      No sections found in the outline. Add sections in the bid
                      outline tab to start building your proposal.
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
                              className="p-2 flex flex-col items-center text-xs"
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
                              className="p-2 flex flex-col items-center text-xs"
                            >
                              <UpscaleSparkIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">Evidence</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {showCommentInput ||
            showEvidencePrompt ||
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

                {/* Evidence Prompt Result */}
                {showEvidencePrompt && (
                  <div
                    className="absolute left-0 bg-white shadow-lg rounded-md border border-gray-200 z-50 p-3 w-72"
                    style={{
                      top: `${selectionMenuPosition.top}px`
                    }}
                  >
                    <h3 className="font-medium mb-2">Evidence</h3>
                    {promptResult ? (
                      <div className="border border-gray-200 rounded p-2 mb-3 text-sm bg-gray-50 max-h-40 overflow-y-auto">
                        {promptResult}
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-20">
                        <Spinner className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelPrompt}
                      >
                        Cancel
                      </Button>
                      {promptResult && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleReplaceWithPrompt}
                        >
                          Replace
                        </Button>
                      )}
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
                        className="space-y-1"
                        onClick={() => highlightCommentAndText(comment.id)}
                      >
                        <ProfilePhoto size="sm" showName={true} />
                        <p className="text-sm cursor-pointer">{comment.text}</p>

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
                              <TooltipContent>Resolve and hide</TooltipContent>
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
        )}
      </div>

      {/* Tools sidebar */}
      <div className="fixed top-0 right-0 z-50 border-l border-gray-line h-screen">
        <div className="flex flex-col gap-2 p-2 bg-white h-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidepane}
                  className="[&_svg]:w-5 [&_svg]:h-5"
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

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="[&_svg]:w-5 [&_svg]:h-5"
                >
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="[&_svg]:w-5 [&_svg]:h-5"
                >
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
          </TooltipProvider>
        </div>
      </div>

      <div
        className={cn(
          "fixed top-0 right-14 h-screen z-50",
          sidepaneOpen ? "block" : "none"
        )}
      >
        <ProposalPreviewSidepane
          bid_id={sharedState.object_id}
          open={sidepaneOpen}
          onOpenChange={setSidepaneOpen}
        />
      </div>
    </div>
  );
};

export default withAuth(ProposalPreview);
