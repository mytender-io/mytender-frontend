import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils";

interface DebouncedTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  rows?: number; // Added rows parameter
}

const DebouncedTextArea: React.FC<DebouncedTextAreaProps> = ({
  value,
  onChange,
  placeholder,
  className = "",
  disabled = false,
  style,
  rows
}) => {
  const [localValue, setLocalValue] = useState(value || "");
  const debouncedCallback = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (debouncedCallback.current) {
      clearTimeout(debouncedCallback.current);
    }
    debouncedCallback.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  };

  return (
    <Textarea
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={cn("min-h-[120px] resize-none", className)}
      style={style}
      rows={rows}
    />
  );
};

export default DebouncedTextArea;
