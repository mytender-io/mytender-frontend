import React, { useState, useEffect, useCallback, useRef } from "react";
import DollarIcon from "@/components/icons/DollarIcon";
import CalendarIcon from "@/components/icons/CalendarIcon";
import { cn } from "@/utils";

interface KanbanViewProps {
  bids: any[];
  updateBidStatus: (bidId: string, newStatus: string) => Promise<void>;
  navigateToChatbot: (bid: any) => void;
}

const statusColumns = [
  "Planning",
  "Research",
  "First Draft",
  "Reviewing",
  "Complete"
];

const KanbanView: React.FC<KanbanViewProps> = ({
  bids,
  updateBidStatus,
  navigateToChatbot
}) => {
  const [localBids, setLocalBids] = useState(bids);
  const draggedBidRef = useRef<any>(null);
  const bidsRef = useRef(localBids);

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const DraggableCard = ({ bid }: { bid: any }) => {
    const [isDragging, setIsDragging] = useState(false);

    return (
      <div
        draggable
        className={cn(
          "bg-white rounded-lg p-3 shadow-sm cursor-grab select-none border border-typo-200",
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
        <h3 className="text-base font-medium mb-2 text-typo-900">
          {bid.bid_title}
        </h3>
        <div className="flex justify-between items-center gap-4 text-sm text-typo-900">
          {bid.value && (
            <div className="flex items-center gap-1.5">
              <DollarIcon className="h-4 w-4" />
              <span>{bid.value}</span>
            </div>
          )}

          {bid.submission_deadline && (
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              <span>{formatDate(bid.submission_deadline)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-214px)] overflow-x-auto mt-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-border-white">
      {statusColumns.map((status, index) => (
        <div
          key={status}
          className={cn(
            "flex-1 min-w-[260px] rounded-lg flex flex-col max-h-full",
            "bg-typo-50",
            // Apply different border colors based on status
            {
              "border-t-[3px] border-status-planning": index === 0,
              "border-t-[3px] border-status-research": index === 1,
              "border-t-[3px] border-status-draft": index === 2,
              "border-t-[3px] border-status-review": index === 3,
              "border-t-[3px] border-status-success": index === 4
            }
          )}
        >
          <div
            className={cn(
              "flex justify-between items-center py-3 px-4 mb-4 rounded-t-lg",
              {
                "bg-status-planning_light": index === 0,
                "bg-status-research_light": index === 1,
                "bg-status-draft_light": index === 2,
                "bg-status-review_light": index === 3,
                "bg-status-success_light": index === 4
              }
            )}
          >
            <h2
              className={cn("text-base font-semibold m-0", {
                "text-status-planning": index === 0,
                "text-status-research": index === 1,
                "text-status-draft": index === 2,
                "text-status-review": index === 3,
                "text-status-success": index === 4
              })}
            >
              {status}
            </h2>
            <span
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-md bg-white text-sm font-semibold",
                {
                  "text-status-planning": index === 0,
                  "text-status-research": index === 1,
                  "text-status-draft": index === 2,
                  "text-status-review": index === 3,
                  "text-status-success": index === 4
                }
              )}
            >
              {getBidsForStatus(status).length}
            </span>
          </div>
          <div
            className={cn(
              "min-h-[100px] overflow-y-auto flex-grow px-3 space-y-4",
              "transition-colors duration-200"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            {getBidsForStatus(status).map((bid) => (
              <DraggableCard key={bid._id} bid={bid} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanView;
