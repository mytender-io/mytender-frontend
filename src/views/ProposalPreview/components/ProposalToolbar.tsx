import React, { RefObject } from "react";
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
  Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import BoldIcon from "@/components/icons/BoldIcon";
import ItalicIcon from "@/components/icons/ItalicIcon";
import UnderlineIcon from "@/components/icons/UnderlineIcon";
import HyperlinkIcon from "@/components/icons/HyperlinkIcon";
import StrikeThroughIcon from "@/components/icons/StrikeThroughIcon";
import QuoteIcon from "@/components/icons/QuoteIcon";
import UndoIcon from "@/components/icons/UndoIcon";
import RedoIcon from "@/components/icons/RedoIcon";
import ParagraphIcon from "@/components/icons/ParagraphIcon";

interface ProposalToolbarProps {
  activeEditorRef: RefObject<HTMLDivElement>;
  execCommand: (command: string, value?: string) => void;
}

const ProposalToolbar = ({
  activeEditorRef,
  execCommand
}: ProposalToolbarProps) => {
  // Add this function to handle hyperlinks
  const handleLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) {
      execCommand("createLink", url);
    }
  };

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

  return (
    <div className="flex gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
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
              <Heading1 size={16} /> Heading 1
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand("formatBlock", "<h2>")}
              className="justify-start"
            >
              <Heading2 size={16} /> Heading 2
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand("formatBlock", "<h3>")}
              className="justify-start"
            >
              <Heading3 size={16} /> Heading 3
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand("formatBlock", "<h4>")}
              className="justify-start"
            >
              <Heading4 size={16} /> Heading 4
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand("formatBlock", "<p>")}
              className="justify-start"
            >
              <Type size={16} /> Paragraph
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulletedList}
              className="justify-start"
            >
              <List size={16} /> Bulleted List
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNumberedList}
              className="justify-start"
            >
              <ListOrdered size={16} /> Numbered List
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Button variant="ghost" size="sm" onClick={() => execCommand("bold")}>
        <BoldIcon />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => execCommand("italic")}>
        <ItalicIcon />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => execCommand("underline")}
      >
        <UnderlineIcon />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleLink}>
        <HyperlinkIcon />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => execCommand("strikeThrough")}
      >
        <StrikeThroughIcon />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleBlockquote}>
        <QuoteIcon />
      </Button>
      <div className="h-8 w-px bg-gray-300 mx-1"></div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => execCommand("justifyLeft")}
      >
        <AlignLeft size={16} className="text-gray-hint_text" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => execCommand("justifyCenter")}
      >
        <AlignCenter size={16} className="text-gray-hint_text" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => execCommand("justifyRight")}
      >
        <AlignRight size={16} className="text-gray-hint_text" />
      </Button>
      <div className="h-8 w-px bg-gray-300 mx-1"></div>
      <Button variant="ghost" size="sm" onClick={() => execCommand("undo")}>
        <UndoIcon />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => execCommand("redo")}>
        <RedoIcon />
      </Button>
    </div>
  );
};

export default ProposalToolbar;
