import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils";
import { Trophy, XCircle, HelpCircle } from "lucide-react";

type BidResultDropdownProps = {
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const BidResultDropdown = ({
  value,
  onChange,
  disabled = false
}: BidResultDropdownProps) => {
  // Normalize the value to handle case variations
  const normalizedValue = value ? value.toLowerCase() : "pending";

  // Get the appropriate styling based on the value
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "won":
        return "bg-status-success_light text-status-success hover:text-status-success hover:bg-status-success_light/90 border-status-success";
      case "lost":
        return "bg-status-planning_light text-status-planning hover:text-status-planning hover:bg-status-planning_light/90 border-status-planning";
      default:
        return "bg-status-pending_light text-status-pending hover:text-status-pending hover:bg-status-pending_light/90 border-status-pending";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "won":
        return Trophy;
      case "lost":
        return XCircle;
      default:
        return HelpCircle;
    }
  };

  const statusItems = [
    { key: "pending", label: "Pending" },
    { key: "won", label: "Won" },
    { key: "lost", label: "Lost" }
  ];

  const currentItem =
    statusItems.find((item) => item.key === normalizedValue) || statusItems[0];
  const StatusIcon = getStatusIcon(normalizedValue);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="ghost"
          className={cn(
            "font-semibold whitespace-nowrap rounded-md focus-visible:ring-0",
            getStatusStyles(normalizedValue),
            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          {currentItem.label}
          <StatusIcon className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit shadow-lg space-y-2 p-2">
        {statusItems.map((item) => {
          const ItemIcon = getStatusIcon(item.key);
          return (
            <DropdownMenuItem
              key={item.key}
              onClick={() => onChange(item.key)}
              className="px-0 py-0"
              disabled={disabled}
            >
              <Button
                variant="ghost"
                className={cn(
                  "font-semibold whitespace-nowrap rounded-md focus-visible:ring-0 w-full",
                  getStatusStyles(item.key),
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                disabled={disabled}
              >
                {item.label}
                <ItemIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BidResultDropdown;
