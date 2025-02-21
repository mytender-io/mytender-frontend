import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const draggedBidRef = useRef(null);
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
            <span className="text-xs block">Last edited 5m ago</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-245px)] overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-border-white">
      {statusColumns.map((status, index) => (
        <div
          key={status}
          className={cn(
            "flex-1 min-w-[260px] rounded-lg flex flex-col max-h-full"
          )}
        >
          <div
            className={cn(
              "flex py-3 px-4 mb-4 rounded-t-lg",
              "border-b-[0.5px] border-gray-line"
            )}
          >
            <h2 className={cn("text-lg font-semibold m-0")}>
              {status}{" "}
              <span className={cn("text-sm font-semibold text-gray")}>
                ({getBidsForStatus(status).length})
              </span>
            </h2>
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
