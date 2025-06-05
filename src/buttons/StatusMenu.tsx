import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Clock, TriangleAlert } from "lucide-react";
import { Section } from "../views/BidWritingStateManagerView";
import { cn } from "@/utils";

type ValidStatus = "Not Started" | "In Progress" | "Completed";

const StatusMenu = ({
  value,
  onChange,
  minimize = false
}: {
  value: Section["status"];
  onChange: (value: Section["status"]) => void;
  minimize?: boolean;
}) => {
  const normalizeStatus = (status: string): ValidStatus => {
    const validStatuses: ValidStatus[] = [
      "Not Started",
      "In Progress",
      "Completed"
    ];
    return validStatuses.includes(status as ValidStatus)
      ? (status as ValidStatus)
      : "Not Started";
  };

  const currentStatus = normalizeStatus(value);

  const getStatusStyles = (status: ValidStatus): string => {
    switch (status) {
      case "Completed":
        return "bg-status-success_light text-status-success hover:text-status-success hover:bg-status-success_light/90 border-status-success";
      case "In Progress":
        return "bg-status-research_light text-status-research hover:text-status-research hover:bg-status-research_light/90 border-status-research";
      case "Not Started":
        return "bg-status-planning_light text-status-planning hover:text-status-planning hover:bg-status-planning_light/90 border-status-planning";
      default:
        return "bg-status-planning_light text-status-planning hover:text-status-planning hover:bg-status-planning_light/90 border-status-planning";
    }
  };

  const getCircleColor = (status: ValidStatus): string => {
    switch (status) {
      case "Completed":
        return "bg-status-success border-status-success";
      case "In Progress":
        return "bg-status-research border-status-research";
      case "Not Started":
        return "bg-status-planning border-status-planning";
      default:
        return "bg-status-planning border-status-planning";
    }
  };

  const getStatusIcon = (status: ValidStatus) => {
    const iconProps = {
      className: "ml-2 h-4 w-4 inline-block align-middle"
    };

    switch (status) {
      case "Completed":
        return <CheckCircle {...iconProps} />;
      case "In Progress":
        return <Clock {...iconProps} />;
      case "Not Started":
        return <TriangleAlert {...iconProps} />;
      default:
        return <TriangleAlert {...iconProps} />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {minimize ? (
          <Button variant="ghost" size="icon" className="relative group">
            <div
              className={cn(
                "min-w-4 min-h-4 h-4 w-4 rounded-full border-[0.5px]",
                getCircleColor(currentStatus)
              )}
            />
            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow-md border text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {currentStatus}
            </div>
          </Button>
        ) : (
          <Button
            variant="ghost"
            className={cn(
              "font-semibold text-sm rounded-md py-1 px-3 whitespace-nowrap border-[0.5px]",
              getStatusStyles(currentStatus)
            )}
          >
            {currentStatus}
            {getStatusIcon(currentStatus)}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-36">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onChange("Not Started");
          }}
          className={cn("hover:bg-gray-100 my-2")}
        >
          <div className="flex items-center space-x-3">
            <div className="h-4 w-4 rounded-full bg-status-planning" />
            <span>Not Started</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onChange("In Progress");
          }}
          className={cn("hover:bg-gray-100 my-2")}
        >
          <div className="flex items-center space-x-3">
            <div className="h-4 w-4 rounded-full bg-status-research" />
            <span>In Progress</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onChange("Completed");
          }}
          className={cn("hover:bg-gray-100 my-2")}
        >
          <div className="flex items-center space-x-3">
            <div className="h-4 w-4 rounded-full bg-status-success" />
            <span>Completed</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusMenu;
