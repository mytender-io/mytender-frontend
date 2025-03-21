import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Search,
  ClipboardList,
  FileWarning,
  FileCheck,
  FileSignature,
  Edit,
  Save
} from "lucide-react";
import { cn } from "@/utils";
import {
  useState,
  useContext,
  createContext,
  ReactNode,
  useEffect
} from "react";
import ElipsisMenuIcon from "@/components/icons/ElipsisMenuIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import RecyclebinIcon from "@/components/icons/RecyclebinIcon";

type BidStatus =
  | "Planning"
  | "Research"
  | "First Draft"
  | "Reviewing"
  | "Complete";

// Define a status item with key and label
interface StatusItem {
  key: BidStatus;
  label: string;
}

// Create a context to share status labels across components
interface StatusLabelsContextType {
  statusItems: StatusItem[];
  updateStatusItems: (items: StatusItem[]) => void;
  getStatusLabel: (key: string) => string;
}

const defaultStatusItems: StatusItem[] = [
  { key: "Planning", label: "Planning" },
  { key: "Research", label: "Research" },
  { key: "First Draft", label: "First Draft" },
  { key: "Reviewing", label: "Reviewing" },
  { key: "Complete", label: "Complete" }
];

const StatusLabelsContext = createContext<StatusLabelsContextType>({
  statusItems: defaultStatusItems,
  updateStatusItems: () => {},
  getStatusLabel: (key) => key
});

export const StatusLabelsProvider = ({ children }: { children: ReactNode }) => {
  const [statusItems, setStatusItems] = useState<StatusItem[]>(() => {
    // Try to load from localStorage
    const savedItems = localStorage.getItem("bidStatusItems");
    return savedItems ? JSON.parse(savedItems) : defaultStatusItems;
  });

  const updateStatusItems = (items: StatusItem[]) => {
    setStatusItems(items);
    // Save to localStorage for persistence
    localStorage.setItem("bidStatusItems", JSON.stringify(items));
  };

  const getStatusLabel = (key: string): string => {
    const item = statusItems.find((item) => item.key === key);
    return item ? item.label : key;
  };

  return (
    <StatusLabelsContext.Provider
      value={{ statusItems, updateStatusItems, getStatusLabel }}
    >
      {children}
    </StatusLabelsContext.Provider>
  );
};

export const useStatusLabels = () => useContext(StatusLabelsContext);

const BidStatusMenu = ({
  value,
  onChange,
  disabled = false
}: {
  value: string;
  onChange: (value: BidStatus) => void;
  disabled?: boolean;
}) => {
  const { statusItems, updateStatusItems } = useStatusLabels();
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<StatusItem[]>(statusItems);

  // Update local state when context changes
  useEffect(() => {
    setEditedItems(statusItems);
  }, [statusItems]);

  const statusMapping: { [key: string]: BidStatus } = {
    Identification: "Planning",
    "Capture Planning": "Research",
    "First Review": "First Draft",
    Reviewing: "Reviewing",
    Submitted: "Complete"
  };

  const normalizeStatus = (status: string): BidStatus => {
    // First check if it's a key in our status items
    const matchingItem = statusItems.find((item) => item.key === status);
    if (matchingItem) return matchingItem.key;

    // Then check if it's a label in our status items
    const matchingLabel = statusItems.find((item) => item.label === status);
    if (matchingLabel) return matchingLabel.key;

    // Then check the legacy mapping
    if (status in statusMapping) return statusMapping[status];

    // Default to first status if nothing matches
    return statusItems.length > 0 ? statusItems[0].key : "Planning";
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
    return styles[status] || styles.Planning;
  };

  const getStatusColor = (status: BidStatus): string => {
    const colors = {
      Planning: "bg-status-planning border-status-planning",
      Research: "bg-status-research border-status-research",
      "First Draft": "bg-status-draft border-status-draft",
      Reviewing: "bg-status-review border-status-review",
      Complete: "bg-status-success border-status-success"
    };
    return colors[status] || colors.Planning;
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

  const handleEditLabels = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditedItems([...statusItems]);
    setIsEditing(true);
  };

  const handleSaveLabels = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateStatusItems([...editedItems]);
    setIsEditing(false);

    // If the current status is no longer valid, reset to the first status
    const currentStatusKey = normalizeStatus(value);
    if (!editedItems.some((item) => item.key === currentStatusKey)) {
      onChange(editedItems[0].key);
    }
  };

  const handleLabelChange = (index: number, newLabel: string) => {
    const newItems = [...editedItems];
    newItems[index] = { ...newItems[index], label: newLabel };
    setEditedItems(newItems);
  };

  const currentStatusKey = normalizeStatus(value);
  const currentItem = statusItems.find(
    (item) => item.key === currentStatusKey
  ) || { key: currentStatusKey, label: currentStatusKey };
  const StatusIcon = getStatusIcon(currentStatusKey);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="ghost"
          className={cn(
            "font-semibold whitespace-nowrap justify-between focus-visible:ring-0",
            getStatusStyles(currentStatusKey),
            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          {currentItem.label}
          <StatusIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-fit shadow-lg space-y-2 p-2"
        onCloseAutoFocus={(e) => {
          if (isEditing) {
            e.preventDefault();
          }
        }}
      >
        {isEditing ? (
          <>
            {editedItems.map((item, index) => {
              const ItemIcon = getStatusIcon(item.key);
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 w-full max-w-40"
                >
                  <div className="flex items-center w-full relative">
                    <div
                      className={cn(
                        "absolute left-2 flex items-center justify-center h-6 w-6 rounded-md",
                        getStatusColor(item.key)
                      )}
                    >
                      <ItemIcon className="h-4 w-4 text-white" />
                    </div>
                    <Input
                      value={item.label}
                      onChange={(e) => handleLabelChange(index, e.target.value)}
                      className="h-9 text-sm pl-9"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 text-gray-hint_text [&_svg]:size-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ElipsisMenuIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          if (editedItems.length > 1) {
                            const newItems = [...editedItems];
                            newItems.splice(index, 1);
                            setEditedItems(newItems);
                          }
                        }}
                        disabled={editedItems.length <= 1}
                        className="text-destructive"
                      >
                        <RecyclebinIcon />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
            <Button
              variant="ghost"
              className="w-full [&_svg]:size-3 font-semibold text-gray-hint_text"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const newKey = `Status${editedItems.length + 1}` as BidStatus;
                setEditedItems([
                  ...editedItems,
                  { key: newKey, label: `New Status` }
                ]);
              }}
            >
              <PlusIcon />
              New Label
            </Button>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSaveLabels}
              className="px-0 py-0"
              onSelect={(e) => e.preventDefault()}
            >
              <Button
                variant="ghost"
                className="font-semibold w-full text-green-600 hover:text-green-800 hover:bg-green-50"
                onClick={handleSaveLabels}
              >
                <Save />
                Save Changes
              </Button>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {statusItems.map((item) => {
              const StatusIcon = getStatusIcon(item.key);
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
                      "font-semibold whitespace-nowrap w-full justify-between focus-visible:ring-0",
                      getStatusStyles(item.key),
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={disabled}
                  >
                    {item.label}
                    <StatusIcon className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleEditLabels}
              className="px-0 py-0"
              onSelect={(e) => e.preventDefault()}
            >
              <Button
                variant="ghost"
                className="whitespace-nowrap w-full font-semibold text-gray-hint_text"
                onClick={handleEditLabels}
              >
                <Edit />
                Edit Labels
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BidStatusMenu;
