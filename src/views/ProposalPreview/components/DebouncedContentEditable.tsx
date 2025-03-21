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
  editorRef
}) => {
  const localRef = useRef<HTMLDivElement>(null);
  const debouncedCallback = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Only set the initial HTML content on the first render
  useEffect(() => {
    if (isInitialMount.current && localRef.current) {
      localRef.current.innerHTML = formatSectionText(content || "");
      isInitialMount.current = false;
    }
  }, [content]);

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

  // Use both the callback ref and local ref
  const setRefs = (el: HTMLDivElement | null) => {
    localRef.current = el;
    if (editorRef) {
      editorRef(el);
    }
  };

  return (
    <div
      ref={setRefs}
      className={cn(
        "font-sans text-base leading-relaxed w-full m-0 outline-none focus:outline-none",
        className
      )}
      contentEditable={!disabled}
      suppressContentEditableWarning={true}
      onFocus={onFocus}
      onClick={onClick}
      style={style}
    />
  );
};

export default DebouncedContentEditable;
