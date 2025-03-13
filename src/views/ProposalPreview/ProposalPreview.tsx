import { useContext, useRef, useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import withAuth from "../../routes/withAuth";
import { BidContext } from "../BidWritingStateManagerView";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants";
import axios from "axios";
import mammoth from "mammoth";
import { Button } from "@/components/ui/button";
import DocIcon from "@/components/icons/DocIcon";
import { Spinner } from "@/components/ui/spinner";
import {
  Bold,
  Italic,
  Underline,
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
  Undo2,
  Redo2,
  StrikethroughIcon,
  Quote,
  Link,
  MessageSquare,
  FileText,
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
import { cn } from "@/utils";

const ProposalPreview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [sections, setSections] = useState<
    { title: string; id: string; content: string }[]
  >([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
  const { sharedState } = useContext(BidContext);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [showSelectionMenu, setShowSelectionMenu] = useState(false);
  const [selectionMenuPosition, setSelectionMenuPosition] = useState({
    top: 0
  });
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<
    { id: string; text: string; resolved: boolean; position: number }[]
  >([]);
  const [showEvidencePrompt, setShowEvidencePrompt] = useState(false);
  const [promptResult, setPromptResult] = useState("");
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const loadPreview = async () => {
    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/get_proposal`,
        {
          bid_id: sharedState.object_id,
          extra_instructions: "",
          datasets: []
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          },
          responseType: "blob"
        }
      );

      const arrayBuffer = await response.data.arrayBuffer();

      // Add style mapping options for mammoth
      const options = {
        styleMap: [
          "p[style-name='Title'] => h1.document-title",
          "p[style-name='Subtitle'] => p.document-subtitle"
        ]
      };

      const result = await mammoth.convertToHtml({ arrayBuffer }, options);

      // Parse the HTML to extract sections based on h1 tags
      const parser = new DOMParser();
      const doc = parser.parseFromString(result.value, "text/html");
      const h1Elements = doc.querySelectorAll("h1");

      // Create sections array for internal tracking
      const extractedSections: {
        title: string;
        id: string;
        content: string;
      }[] = [];

      if (h1Elements.length > 0) {
        // Process each h1 element as a section
        h1Elements.forEach((h1, index) => {
          const sectionId = `section-${index}`;
          h1.id = sectionId;

          let sectionContent = h1.outerHTML;
          let currentNode = h1.nextSibling;

          // Collect all content until the next h1 or end of document
          while (
            currentNode &&
            !(
              currentNode instanceof HTMLHeadingElement &&
              currentNode.tagName === "H1"
            )
          ) {
            const tempDiv = document.createElement("div");
            tempDiv.appendChild(currentNode.cloneNode(true));
            sectionContent += tempDiv.innerHTML;
            currentNode = currentNode.nextSibling;
          }

          extractedSections.push({
            title: h1.textContent || `Section ${index + 1}`,
            id: sectionId,
            content: sectionContent
          });
        });
      } else {
        // If no h1 elements, treat the whole document as one section
        extractedSections.push({
          title: "Document",
          id: "section-0",
          content: result.value
        });
      }

      setSections(extractedSections);

      const url = URL.createObjectURL(response.data);
      setDocUrl(url);
      setIsLoading(false);
    } catch (err) {
      console.error("Preview loading error:", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPreview();
    return () => {
      if (docUrl) {
        URL.revokeObjectURL(docUrl);
      }
    };
  }, [sharedState.object_id]);

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
    if (editorRef.current) {
      if (editingSectionId) {
        // Save only the edited section
        const updatedSections = sections.map((section) => {
          if (section.id === editingSectionId) {
            return {
              ...section,
              content: editorRef.current!.innerHTML
            };
          }
          return section;
        });
        setSections(updatedSections);
      }
      // Keep editing mode active after saving
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
    setShowSelectionMenu(false);
    setShowCommentInput(true);

    // Highlight the selected text in orange
    if (selectedRange) {
      // Create a span to wrap the selected content
      const span = document.createElement("span");
      span.style.color = "rgba(255, 165, 0, 0.5)"; // Light orange background
      span.className = "commented-text";
      span.dataset.commentId = `pending-${Date.now()}`;

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
    }
  };

  // Save comment handler
  const handleSaveComment = () => {
    if (commentText.trim()) {
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
        // Make the highlight a little brighter for saved comments
        span.style.color = "rgba(255, 165, 0, 0.5)";

        // Add click event to highlight when clicked
        span.addEventListener("click", () => {
          highlightCommentAndText(commentId);
        });
      }

      const newComment = {
        id: commentId,
        text: commentText,
        resolved: false,
        position: position
      };
      setComments([...comments, newComment]);
      setCommentText("");
    }
    setShowCommentInput(false);
  };

  // Add this new function to highlight comment and text
  const highlightCommentAndText = (commentId: string) => {
    setActiveComment(commentId);

    // First reset all comments and spans to default state
    document.querySelectorAll("span.commented-text").forEach((span) => {
      (span as HTMLElement).style.color = "rgba(255, 165, 0, 0.5)";
    });

    // Then highlight the selected comment and text
    const commentSpan = document.querySelector(
      `span.commented-text[data-comment-id="${commentId}"]`
    );

    if (commentSpan) {
      (commentSpan as HTMLElement).style.color = "rgb(255, 165, 0)";
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
    setShowCommentInput(false);
  };

  // Toggle comment resolution
  const handleToggleResolution = (id: string) => {
    console.log("123");
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

  // Evidence prompt handler
  const handleEvidencePrompt = () => {
    setShowSelectionMenu(false);
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
      } else {
        setShowSelectionMenu(false);
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
        document.querySelectorAll("span.commented-text").forEach((span) => {
          (span as HTMLElement).style.color = "rgba(255, 165, 0, 0.5)";
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="proposal-preview-container overflow-y-auto">
      <div className="flex flex-col flex-1 overflow-hidden pb-8">
        {/* <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleWordDownload}
              className="flex items-center gap-2 text-orange border-orange hover:text-orange-light hover:bg-orange-light/10"
            >
              <DocIcon />
              Download Word
            </Button>
          </div>
        </div> */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-full max-w-5xl mx-auto border border-gray-line rounded-lg bg-white overflow-hidden">
              <div className="bg-gray-50 p-2 border-b border-gray-200 rounded flex flex-wrap gap-2 sticky top-0 z-10 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand("undo")}
                  className="p-1 h-8"
                >
                  <Undo2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand("redo")}
                  className="p-1 h-8"
                >
                  <Redo2 size={16} />
                </Button>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 flex items-center gap-1"
                    >
                      <Type size={16} />
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
                        <ListOrdered size={16} className="mr-2" /> Numbered List
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
                  <Bold size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand("italic")}
                  className="p-1 h-8"
                >
                  <Italic size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand("underline")}
                  className="p-1 h-8"
                >
                  <Underline size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand("strikeThrough")}
                  className="p-1 h-8"
                >
                  <StrikethroughIcon size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBlockquote}
                  className="p-1 h-8"
                >
                  <Quote size={16} />
                </Button>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLink}
                  className="p-1 h-8"
                >
                  <Link size={16} />
                </Button>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand("justifyLeft")}
                  className="p-1 h-8"
                >
                  <AlignLeft size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand("justifyCenter")}
                  className="p-1 h-8"
                >
                  <AlignCenter size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand("justifyRight")}
                  className="p-1 h-8"
                >
                  <AlignRight size={16} />
                </Button>
                <div className="ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveEdit}
                    className="p-1 h-8"
                  >
                    <Save size={16} />
                  </Button>
                </div>
              </div>
              <div className="h-auto relative" ref={editorContainerRef}>
                {sections.length > 0 ? (
                  // Display sections as separate editable cards, skip the first (title) section
                  sections.slice(1).map((section, index) => (
                    <div
                      key={section.id}
                      className="border-b border-gray-line last:border-none relative"
                    >
                      <div className="bg-white p-8 relative">
                        <div
                          ref={
                            editingSectionId === section.id ? editorRef : null
                          }
                          dangerouslySetInnerHTML={{ __html: section.content }}
                          className="font-sans text-base leading-relaxed w-full m-0 outline-none focus:outline-none"
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          onFocus={() => setEditingSectionId(section.id)}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-full bg-muted p-5 text-center">
                    <p>
                      Generate a Proposal to preview it here. Click on the bid
                      outline tab, then on the generate proposal button.
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleAddComment}
                              className="p-2 flex flex-col items-center text-xs"
                            >
                              <MessageSquare size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Add Comment</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleEvidencePrompt}
                              className="p-2 flex flex-col items-center text-xs"
                            >
                              <FileText size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Evidence</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                )}

                {/* Comment Input */}
                {showCommentInput && (
                  <div
                    className="absolute right-0 bg-white shadow-lg rounded-md border border-gray-200 z-50 p-3 w-64"
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
                    className="absolute right-0 bg-white shadow-lg rounded-md border border-gray-200 z-50 p-3 w-80"
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
              </div>

              {/* Comments Display */}
              <div>
                {filterResolvedComments().map((comment) => (
                  <div
                    key={comment.id}
                    className={cn(
                      "transition-all duration-300 w-fit absolute right-0",
                      activeComment === comment.id &&
                        "p-2 rounded-md border bg-white border-gray-line"
                    )}
                    data-comment-id={comment.id}
                    style={{
                      top: `${comment.position}px`
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <p
                        className="text-sm cursor-pointer"
                        onClick={() => highlightCommentAndText(comment.id)}
                      >
                        {comment.text}
                      </p>
                      {activeComment === comment.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleResolution(comment.id);
                          }}
                        >
                          <Check size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(ProposalPreview);
