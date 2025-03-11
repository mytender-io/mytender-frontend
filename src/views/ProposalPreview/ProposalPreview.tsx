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
  Heading3,
  Heading4,
  CheckSquare
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

const ProposalPreview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
  const { sharedState } = useContext(BidContext);

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
          "p[style-name='Subtitle'] => p.document-subtitle",
          "p[style-name='Heading 1'] => h1",
          "p[style-name='Heading 2'] => h2"
        ]
      };

      const result = await mammoth.convertToHtml({ arrayBuffer }, options);
      setHtmlContent(`
        <style>
          h1.document-title {
            font-size: 36px;
            margin-top: 0;
          }
          p.document-subtitle {
            font-size: 24px;
            line-height: 1.2;
            opacity: 0.5;
          }
          h1 { margin-top: 24px; margin-bottom: 16px; }
          h2 { margin-top: 20px; margin-bottom: 12px; }
        </style>
        ${result.value}
      `);

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

  const handleWordDownload = async () => {
    if (docUrl) {
      const link = document.createElement("a");
      link.href = docUrl;
      link.download = `proposal_${sharedState.bidInfo || "document"}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Rich text editor functions
  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleSaveEdit = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setHtmlContent(newContent);
      setIsEditing(false);
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

  // Enhanced CSS for editor styles with explicit list markers
  useEffect(() => {
    if (isEditing && editorRef.current) {
      const style = document.createElement("style");
      style.id = "editor-styles";
      style.innerHTML = `
        blockquote {
          margin: 1em 0;
          padding-left: 1em;
          border-left: 4px solid #e5e7eb;
          color: #4b5563;
          font-style: italic;
        }
        
        ul {
          margin: 1em 0;
          padding-left: 2em;
          list-style-type: disc !important;
        }
        
        ol {
          margin: 1em 0;
          padding-left: 2em;
          list-style-type: decimal !important;
        }
        
        ul li {
          display: list-item !important;
          list-style-type: disc !important;
          margin: 0.5em 0;
          position: relative;
        }
        
        ol li {
          display: list-item !important;
          list-style-type: decimal !important;
          margin: 0.5em 0;
          position: relative;
        }
        
        ol {
          counter-reset: item;
        }
      `;
      document.head.appendChild(style);

      return () => {
        const existingStyle = document.getElementById("editor-styles");
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [isEditing]);

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

  // Fix the formatBlock command for subtitle
  const handleSubtitle = () => {
    try {
      // First try the standard approach
      document.execCommand("formatBlock", false, "<p>");

      // Then apply the class manually
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;

        // Find the paragraph element
        let paragraph = container;
        if (container.nodeType === Node.TEXT_NODE) {
          paragraph = container.parentElement;
        }

        // Apply the class
        if (paragraph && paragraph.tagName === "P") {
          paragraph.className = "document-subtitle";
        }
      }
    } catch (e) {
      console.error("Error applying subtitle format:", e);
    }

    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Add a function to handle paragraph formatting that removes classes
  const handleParagraph = () => {
    try {
      // First try the standard approach
      document.execCommand("formatBlock", false, "<p>");

      // Then remove any classes
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;

        // Find the paragraph element
        let paragraph = container;
        if (container.nodeType === Node.TEXT_NODE) {
          paragraph = container.parentElement;
        }

        // Remove any classes
        if (paragraph && paragraph.tagName === "P") {
          paragraph.className = "";
        }
      }
    } catch (e) {
      console.error("Error applying paragraph format:", e);
    }

    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold">Here is your first draft:</h3>
          <div className="flex gap-2">
            {isEditing ? (
              <Button
                variant="outline"
                onClick={handleSaveEdit}
                className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
              >
                Save Changes
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Edit Document
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleWordDownload}
              className="flex items-center gap-2 text-orange border-orange hover:text-orange-light hover:bg-orange-light/10"
            >
              <DocIcon />
              Download Word
            </Button>
          </div>
        </div>

        {isEditing && (
          <div className="bg-gray-50 p-2 mb-2 border border-gray-200 rounded flex flex-wrap gap-2">
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
            <div className="h-6 w-px bg-gray-300 mx-1"></div>

            {/* Replace individual heading buttons with a popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-8 flex items-center gap-1"
                >
                  <Type size={16} />
                  <span className="text-xs">Format</span>
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
                    onClick={handleSubtitle}
                    className="justify-start"
                  >
                    <Type size={16} className="mr-2" /> Subtitle
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleParagraph}
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
                  <Button variant="ghost" size="sm" className="justify-start">
                    <CheckSquare size={16} className="mr-2" /> Todo List
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

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
          </div>
        )}

        <div className="flex-1 border-[0.5px] border-b-0 border-gray-line rounded-t-lg overflow-auto bg-white p-8 h-full w-full max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner className="w-8 h-8" />
            </div>
          ) : htmlContent ? (
            <div
              ref={editorRef}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
              className={`font-sans text-base leading-relaxed w-full m-0 ${isEditing ? "outline-none focus:outline-none" : ""}`}
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
            />
          ) : (
            <div className="flex justify-center items-center h-full bg-muted p-5 text-center">
              <p>
                Generate a Proposal to preview it here. Click on the bid outline
                tab, then on the generate proposal button.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(ProposalPreview);
