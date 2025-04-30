import React, { useEffect, useRef } from "react";
import { cn } from "@/utils";
import { formatSectionText } from "@/utils/formatSectionText";

interface DebouncedContentEditableProps {
  content: string;
  onChange: (newContent: string) => void;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  onFocus?: () => void;
  onClick?: () => void;
  onSelectionChange?: (selection: Selection | null) => void;
  editorRef?: (el: HTMLDivElement | null) => void;
  onFeedbackClick?: (feedbackId: string) => void; // Add this prop
}

const DebouncedContentEditable: React.FC<DebouncedContentEditableProps> = ({
  content,
  onChange,
  className = "",
  disabled = false,
  style,
  onFocus,
  onClick,
  onSelectionChange,
  editorRef,
  onFeedbackClick
}) => {
  const localRef = useRef<HTMLDivElement>(null);
  const debouncedCallback = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  const formattedContentRef = useRef<string | null>(null);

  // Only set the initial HTML content on the first render
  // Replace your existing initial mount effect with this
  useEffect(() => {
    if (isInitialMount.current && localRef.current) {
      const formattedContent = formatSectionText(content || "");
      formattedContentRef.current = formattedContent;
      localRef.current.innerHTML = formattedContent;

      // If the formatted content is different from the original, update the parent state
      if (formattedContent !== content) {
        onChange(formattedContent);
      }

      isInitialMount.current = false;
    }
  }, [content, onChange]);

  // Handle external content updates without losing cursor position
  useEffect(() => {
    const editor = localRef.current;
    // Only update if the editor doesn't have focus and the content has changed
    if (
      !isInitialMount.current &&
      editor &&
      document.activeElement !== editor &&
      editor.innerHTML !== formatSectionText(content || "")
    ) {
      editor.innerHTML = formatSectionText(content || "");
    }
  }, [content]);

  // Add input event listener to detect content changes
  useEffect(() => {
    const editor = localRef.current;
    if (editor) {
      const handleInput = () => {
        const newContent = editor.innerHTML;
        // Debounce updates to parent component
        if (debouncedCallback.current) {
          clearTimeout(debouncedCallback.current);
        }
        debouncedCallback.current = setTimeout(() => {
          onChange(newContent);
        }, 300);
      };
      // Add input event listener
      editor.addEventListener("input", handleInput);
      // Clean up
      return () => {
        editor.removeEventListener("input", handleInput);
        if (debouncedCallback.current) {
          clearTimeout(debouncedCallback.current);
        }
      };
    }
  }, [onChange]);

  // Add selection change event listener
  useEffect(() => {
    if (!onSelectionChange) return;
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const editorContainsSelection = localRef.current?.contains(
        range.commonAncestorContainer
      );
      if (editorContainsSelection) {
        onSelectionChange(selection);
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [onSelectionChange]);

  // Add new effect for handling feedback clicks
  useEffect(() => {
    if (!onFeedbackClick) return;

    const editor = localRef.current;
    if (!editor) return;

    const handleEditorClick = (event: MouseEvent) => {
      // Check if the click was on a feedback-text span or its children
      const feedbackSpan = (event.target as Element).closest?.(
        "span.feedback-text"
      );

      if (feedbackSpan) {
        // Extract the feedback ID
        const feedbackId = feedbackSpan.getAttribute("data-feedback-id");

        if (feedbackId) {
          // Call the feedback click handler passed from the parent
          onFeedbackClick(feedbackId);

          // Prevent default behavior to avoid potential text selection issues
          event.preventDefault();
        }
      }
    };

    // Add click event listener to the editor
    editor.addEventListener("click", handleEditorClick);

    // Clean up
    return () => {
      editor.removeEventListener("click", handleEditorClick);
    };
  }, [onFeedbackClick]);

  // Use both the callback ref and local ref
  const setRefs = (el: HTMLDivElement | null) => {
    localRef.current = el;
    if (editorRef) {
      editorRef(el);
    }
  };

  // Handle regular click (separate from feedback click)
  const handleClick = (e: React.MouseEvent) => {
    // Call the original onClick handler if provided
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      ref={setRefs}
      className={cn(
        "text-base leading-relaxed w-full m-0 outline-none focus:outline-none",
        className
      )}
      contentEditable={!disabled}
      suppressContentEditableWarning={true}
      onFocus={onFocus}
      onClick={handleClick}
      style={style}
    />
  );
};

export default DebouncedContentEditable;
