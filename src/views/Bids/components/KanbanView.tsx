import React, { useState, useEffect, useCallback, useRef } from "react";
import { cn, customLocale } from "@/utils";
import { formatDistanceToNow } from "date-fns";
import { useStatusLabels, StatusItem } from "./BidStatusMenu";
import { Input } from "@/components/ui/input";
import { Save, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanViewProps {
  bids: any[];
  updateBidStatus: (bidId: string, newStatus: string) => Promise<void>;
  navigateToChatbot: (bid: any) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({
  bids,
  updateBidStatus,
  navigateToChatbot
}) => {
  const { statusItems, getStatusLabel, updateStatusItems } = useStatusLabels();
  const statusColumns = statusItems.map((item) => item.key);
  const [localBids, setLocalBids] = useState(bids);
  const draggedBidRef = useRef(null);
  const bidsRef = useRef(localBids);

  // State for editing column labels
  const [editingColumnIndex, setEditingColumnIndex] = useState<number | null>(
    null
  );
  const [editedLabel, setEditedLabel] = useState("");

  useEffect(() => {
    // Only update if we're not in the middle of a drag
    if (!draggedBidRef.current) {
      setLocalBids(bids);
      bidsRef.current = bids;
    }
  }, [bids]);

  const getBidsForStatus = useCallback(
    (status: string) => {
      if (status === "Planning") {
        return bidsRef.current.filter(
          (bid) => bid.status === status || !statusColumns.includes(bid.status)
        );
      }
      return bidsRef.current.filter((bid) => bid.status === status);
    },
    [bidsRef.current]
  );

  const handleDragStart = (e: React.DragEvent, bid: any) => {
    draggedBidRef.current = bid;
    const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
    ghost.style.position = "absolute";
    ghost.style.top = "-1000px";
    document.body.appendChild(ghost);

    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");

    const draggedBid = draggedBidRef.current;
    if (!draggedBid || draggedBid.status === newStatus) {
      draggedBidRef.current = null;
      return;
    }

    // Update the ref immediately
    bidsRef.current = bidsRef.current.map((bid) =>
      bid._id === draggedBid._id
        ? {
            ...bid,
            status: newStatus
          }
        : bid
    );

    // Update state after ref
    setLocalBids(bidsRef.current);

    try {
      await updateBidStatus(draggedBid._id, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      // Revert both ref and state on failure
      bidsRef.current = bidsRef.current.map((bid) =>
        bid._id === draggedBid._id
          ? {
              ...bid,
              status: draggedBid.status
            }
          : bid
      );
      setLocalBids(bidsRef.current);
    } finally {
      draggedBidRef.current = null;
    }
  };

  const handleEditColumnLabel = (index: number, currentLabel: string) => {
    setEditingColumnIndex(index);
    setEditedLabel(currentLabel);
  };

  const handleSaveColumnLabel = (index: number, key: string) => {
    if (editedLabel.trim() === "") return;

    const newStatusItems = [...statusItems];
    newStatusItems[index] = {
      ...newStatusItems[index],
      label: editedLabel.trim()
    };
    updateStatusItems(newStatusItems);
    setEditingColumnIndex(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const DraggableCard = ({ bid, index }: { bid: any; index: number }) => {
    const [isDragging, setIsDragging] = useState(false);

    return (
      <div
        draggable
        className={cn(
          "bg-white rounded-md p-3 shadow-sm cursor-grab select-none border-[0.5px] border-gray-line",
          "hover:translate-y-[-2px] hover:shadow-md transition-all duration-200",
          isDragging && "opacity-50 shadow-lg"
        )}
        onDragStart={(e) => {
          handleDragStart(e, bid);
          setIsDragging(true);
        }}
        onDragEnd={() => {
          setIsDragging(false);
          if (!draggedBidRef.current) {
            bidsRef.current = bids;
            setLocalBids(bids);
          }
        }}
        onClick={() => !isDragging && navigateToChatbot(bid)}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-medium mb-2 text-typo-900">
            {bid.bid_title}
          </h3>
          {bid.value && (
            <span
              className={cn(
                "flex items-center rounded-md border h-6 px-2.5 font-semibold text-sm",
                index === 0 &&
                  "border-status-planning bg-status-planning_light text-status-planning",
                index === 1 &&
                  "border-status-research bg-status-research_light text-status-research",
                index === 2 &&
                  "border-status-draft bg-status-draft_light text-status-draft",
                index === 3 &&
                  "border-status-review bg-status-review_light text-status-review",
                index === 4 &&
                  "border-status-success bg-status-success_light text-status-success"
              )}
            >
              ${bid.value}
            </span>
          )}
        </div>

        {bid.submission_deadline && (
          <div className="space-y-1.5 text-gray-hint_text">
            <span className="text-base font-semibold">
              Due date: {formatDate(bid.submission_deadline)}
            </span>
            <span className="text-xs block">
              Last edited{" "}
              {formatDistanceToNow(new Date(bid.timestamp), {
                addSuffix: true,
                locale: customLocale
              })}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-1 overflow-x-auto scrollbar-thin">
      {statusColumns.map((status, index) => (
        <div
          key={status}
          className={cn(
            "flex-1 min-w-72 rounded-lg flex flex-col max-h-full group"
          )}
        >
          <div
            className={cn(
              "flex py-3 px-4 mb-4 rounded-t-lg",
              "border-b-[0.5px] border-gray-line",
              "justify-between items-center cursor-pointer"
            )}
            onClick={() => {
              if (editingColumnIndex !== index) {
                handleEditColumnLabel(index, getStatusLabel(status));
              }
            }}
          >
            {editingColumnIndex === index ? (
              <div className="flex items-center gap-2 w-full">
                <Input
                  value={editedLabel}
                  onChange={(e) => setEditedLabel(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveColumnLabel(index, status);
                    } else if (e.key === "Escape") {
                      setEditingColumnIndex(null);
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveColumnLabel(index, status);
                  }}
                  className="p-1 h-8 w-8"
                >
                  <Save className="h-4 w-4 text-green-600" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <h2
                  className={cn("text-lg font-semibold m-0 flex items-center")}
                >
                  {getStatusLabel(status)}{" "}
                  <span className={cn("text-sm font-semibold text-gray ml-1")}>
                    ({getBidsForStatus(status).length})
                  </span>
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditColumnLabel(index, getStatusLabel(status));
                  }}
                  className="p-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Edit className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            )}
          </div>
          <div
            className={cn(
              "min-h-[100px] overflow-y-auto flex-grow px-3 space-y-2",
              "transition-colors duration-200"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            {getBidsForStatus(status).map((bid) => (
              <DraggableCard key={bid._id} bid={bid} index={index} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanView;
