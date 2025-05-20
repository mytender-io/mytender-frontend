import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";

interface CollapsibleHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CollapsibleHeader: React.FC<CollapsibleHeaderProps> = ({
  children,
  className
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={cn("relative border-b border-gray-line", className)}>
      <div
        className={cn(
          "flex flex-col gap-2 items-center p-4 transition-all duration-500 overflow-hidden",
          isCollapsed && "max-h-0 py-1.5 px-4"
        )}
      >
        {children}
      </div>
      <Button
        onClick={toggleCollapse}
        variant="outline"
        size="icon"
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rounded-full shadow-sm h-6 w-6"
        aria-label={isCollapsed ? "Expand header" : "Collapse header"}
      >
        {isCollapsed ? <ChevronDown /> : <ChevronUp />}
      </Button>
    </div>
  );
};

export default CollapsibleHeader;
