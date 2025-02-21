import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ClipboardList,
  FileWarning,
  FileCheck,
  FileSignature
} from "lucide-react";
import { cn } from "@/utils";

type BidStatus =
  | "Planning"
  | "Research"
  | "First Draft"
  | "Reviewing"
  | "Complete";

const BidStatusMenu = ({
  value,
  onChange
}: {
  value: string;
  onChange: (value: BidStatus) => void;
}) => {
  const statusMapping: { [key: string]: BidStatus } = {
    Identification: "Planning",
    "Capture Planning": "Research",
    "First Review": "First Draft",
    Reviewing: "Reviewing",
    Submitted: "Complete"
  };

  const normalizeStatus = (status: string): BidStatus => {
    const validStatuses: BidStatus[] = [
      "Planning",
      "Research",
      "First Draft",
      "Reviewing",
      "Complete"
    ];
    return status in statusMapping
      ? statusMapping[status]
      : validStatuses.includes(status as BidStatus)
        ? (status as BidStatus)
        : "Planning";
  };

  const getStatusStyles = (status: BidStatus): string => {
    const styles = {
      Planning:
        "bg-status-planning_light text-status-planning hover:text-status-planning hover:bg-status-planning_light/90 border-status-planning",
      Research:
        "bg-status-research_light text-status-research hover:text-status-research hover:bg-status-research_light/90 border-status-research",
      "First Draft":
        "bg-status-draft_light text-status-draft hover:text-status-draft hover:bg-status-draft_light/90 border-status-draft",
      Reviewing:
        "bg-status-review_light text-status-review hover:text-status-review hover:bg-status-review_light/90 border-status-review",
      Complete:
        "bg-status-success_light text-status-success hover:text-status-success hover:bg-status-success_light/90 border-status-success"
    };

    return styles[status];
  };

  const getStatusIcon = (status: BidStatus) => {
    const icons = {
      Planning: Search,
      Research: ClipboardList,
      "First Draft": FileWarning,
      Reviewing: FileCheck,
      Complete: FileSignature
    };
    return icons[status] || Search;
  };

  const currentStatus = normalizeStatus(value);
  const StatusIcon = getStatusIcon(currentStatus);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "font-semibold text-sm whitespace-nowrap rounded-md py-1 px-3 border-[0.5px]",
            getStatusStyles(currentStatus)
          )}
        >
          {currentStatus}
          <StatusIcon className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit shadow-lg space-y-2 p-2">
        {["Planning", "Research", "First Draft", "Reviewing", "Complete"].map(
          (status) => {
            const statusItem = normalizeStatus(status);
            const StatusIcon = getStatusIcon(statusItem);

            return (
              <DropdownMenuItem
                key={status}
                onClick={() => onChange(status as BidStatus)}
                className="px-0 py-0"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "font-semibold text-sm whitespace-nowrap rounded-md py-1 px-3 border-[0.5px] w-full",
                    getStatusStyles(statusItem)
                  )}
                >
                  {status}
                  <StatusIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuItem>
            );
          }
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BidStatusMenu;
