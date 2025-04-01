import { useContext, useRef, useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import withAuth from "../../routes/withAuth";
import { BidContext } from "../BidWritingStateManagerView";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Check, Download } from "lucide-react";
import "./ProposalPreview.css";
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
import { calculateWordCount, cn } from "@/utils";
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
import TextSelectionMenu from "./components/TextSelectionMenu";
import ProposalToolbar from "./components/ProposalToolbar";
import MarkReviewReadyButton from "./components/MarkReviewReadyButton";
import RewriteInputBar from "./components/RewriteInputBar";
// import { formatSectionText } from "@/utils/formatSectionText";

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
  const [rewritingSectionIndex, setRewritingSectionIndex] = useState<
    number | null
  >(null);
  const [rewritingSection, setRewritingSection] = useState<string | null>(null);

  // Get sections from shared state
  const { outline } = sharedState;
  const [localLoading, setLocalLoading] = useState(false);

  const [organizationUsers, setOrganizationUsers] = useState([]);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);

  const [actionType, setActionType] = useState("default");

  // Add a ref for the toolbar div
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarYPosition, setToolbarYPosition] = useState(0);

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

    if (sharedState.outline) {
      setLocalLoading(false);

      // Force a refresh of editor content when outline changes
      // if (sharedState.outline.length > 0 && editorRefs.current.length > 0) {
      //   console.log("Outline updated, refreshing editors");

      //   // Update editor refs with latest content
      //   sharedState.outline.forEach((section, index) => {
      //     if (editorRefs.current[index]) {
      //       // This will force the editor to refresh with new content
      //       const editorElement = editorRefs.current[index];
      //       if (editorElement && section.answer !== editorElement.innerHTML) {
      //         // Only update if content has actually changed
      //         // editorElement.innerHTML = formatSectionText(section.answer || "");
      //         editorElement.innerHTML = section.answer;
      //       }
      //     }
      //   });
      // }
    }
  }, [sharedState.outline]);

  // Function to toggle the sidepane
  const toggleSidepane = () => {
    setToolbarYPosition(getToolbarYPosition());
    setSidepaneOpen((prevState) => !prevState);
  };

  // Handle rewrite success from child component
  const handleRewriteSuccess = (sectionIndex: number, updatedSection: any) => {
    setSharedState((prevState) => {
      const newOutline = [...prevState.outline];
      newOutline[sectionIndex] = updatedSection;
      return {
        ...prevState,
        outline: newOutline
      };
    });

    // Clear rewriting state
    setRewritingSection(null);
    setRewritingSectionIndex(null);
  };

  const handleRewriteCancel = () => {
    setRewritingSectionIndex(null);
  };

  const handleRewriteClick = (index: number) => {
    // Toggle the rewrite section if clicking on the same section
    if (rewritingSectionIndex === index) {
      setRewritingSectionIndex(null);
    } else {
      setRewritingSectionIndex(index);
    }
  };

  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (activeEditorRef.current) {
      activeEditorRef.current.focus();
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
      const menuHeight = 215;
      const topPosition =
        rect.top -
        (editorContainerRect?.top || 0) -
        (menuHeight - rect.height) / 2;
      setSelectionMenuPosition({
        top: topPosition // Position above the selection, relative to editor
      });

      setShowSelectionMenu(true);
    } else {
      setShowSelectionMenu(false);
      setSelectedRange(null);
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
        document.querySelector("span.expand-text") ||
        document.querySelector("span.custom-text");

      if (span) {
        // Create a new range targeting the span
        const range = document.createRange();
        range.selectNode(span);

        // Delete the span and its contents
        range.deleteContents();

        // Create a temporary container element
        const tempDiv = document.createElement("div");
        // Set the HTML content
        tempDiv.innerHTML = text;

        // Insert the HTML content
        while (tempDiv.firstChild) {
          range.insertNode(tempDiv.firstChild);
        }

        // Clear the prompt result
        setPromptResult("");
        setActionType("default");

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

        // Create a temporary container element
        const tempDiv = document.createElement("div");
        // Set the HTML content
        tempDiv.innerHTML = text;

        // Insert the HTML content
        while (tempDiv.firstChild) {
          selectedRange.insertNode(tempDiv.firstChild);
        }

        setPromptResult("");
        setActionType("default");

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
              // Insert HTML at current cursor position
              document.execCommand("insertHTML", false, text);
            } else {
              // If cursor is not in the editor, place it at the end of editor content
              const endRange = document.createRange();
              endRange.selectNodeContents(activeEditorRef.current);
              endRange.collapse(false); // Collapse to end

              selection.removeAllRanges();
              selection.addRange(endRange);

              // Now insert at the end
              document.execCommand("insertHTML", false, text);
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
              document.execCommand("insertHTML", false, text);
            }
          }

          // Clear the prompt result
          setPromptResult("");
          setActionType("default");

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
      document.querySelector("span.expand-text") ||
      document.querySelector("span.custom-text");

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
    setActionType("default");
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
      const customSpans = document.querySelectorAll("span.custom-text");
      // Only proceed if we have at least one highlighted span
      if (
        evidenceSpans.length === 0 &&
        expandSpans.length === 0 &&
        summariseSpans.length === 0 &&
        customSpans.length === 0
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

      // Check evidence spans
      customSpans.forEach((span) => {
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

  // Then somewhere in your component, you can get the Y position:
  const getToolbarYPosition = () => {
    if (toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect();
      // rect.top gives you the distance from the top of the viewport
      // Add window.scrollY to get the distance from the top of the document
      const yPosition = rect.top + window.scrollY;
      return yPosition;
    }
    return 0;
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
                  <div
                    ref={toolbarRef}
                    className="border border-gray-line bg-gray-50 px-4 py-2 rounded-t-md flex items-center justify-center gap-2 sticky -top-4 z-[51]"
                  >
                    <ProposalToolbar
                      activeEditorRef={activeEditorRef}
                      execCommand={execCommand}
                    />
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
                          {section.answerer && (
                            <div className="absolute right-1 top-2">
                              <ProfilePhoto
                                answererId={section.answerer}
                                size="sm"
                              />
                            </div>
                          )}

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
                              <RewriteInputBar
                                section={section}
                                sectionIndex={index}
                                isActive={rewritingSectionIndex === index}
                                objectId={sharedState.object_id}
                                tokenRef={tokenRef}
                                onCancel={handleRewriteCancel}
                                onRewriteSuccess={handleRewriteSuccess}
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
                              <MarkReviewReadyButton
                                section={section}
                                index={index}
                                objectId={sharedState.object_id}
                                organizationUsers={organizationUsers}
                                tokenRef={tokenRef}
                                setSharedState={setSharedState}
                              />
                            </div>
                          </div>

                          {/* Show a meta info box with section details */}
                          <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 flex justify-between border-t border-gray-200">
                            <div>
                              <span className="font-medium">Words:</span>{" "}
                              {calculateWordCount(section.answer || "")}
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
                            <div>
                              <span className="font-medium">Status:</span>{" "}
                              {section.status}
                            </div>
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
                      <TextSelectionMenu
                        selectionMenuPosition={selectionMenuPosition}
                        selectedRange={selectedRange}
                        setSelectedRange={setSelectedRange}
                        setShowCommentInput={setShowCommentInput}
                        setPromptTarget={setPromptTarget}
                        setPromptResult={setPromptResult}
                        setSidepaneOpen={setSidepaneOpen}
                        setIsLoadingEvidence={setIsLoadingEvidence}
                        setActionType={setActionType}
                        tokenRef={tokenRef}
                        objectId={sharedState.object_id}
                      />
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
              {sidepaneOpen && (
                <div
                  className={cn(
                    "w-[450px] overflow-y-auto z-50 sticky -top-4 right-0"
                  )}
                  style={{
                    maxHeight: `calc(100vh - ${241 - (234 - toolbarYPosition)}px)`
                  }}
                >
                  <ProposalPreviewSidepane
                    bid_id={sharedState.object_id}
                    open={sidepaneOpen}
                    onOpenChange={setSidepaneOpen}
                    promptTarget={promptTarget}
                    promptResult={promptResult}
                    isLoadingEvidence={isLoadingEvidence}
                    onReplace={handleReplaceWithPrompt}
                    onCancelPrompt={handleCancelPrompt}
                    actionType={actionType}
                    setActionType={setActionType}
                  />
                </div>
              )}
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
        </div>
      </div>
    </div>
  );
};

export default withAuth(ProposalPreview);
