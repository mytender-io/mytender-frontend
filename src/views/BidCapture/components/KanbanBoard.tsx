import React from "react";
import { useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { customLocale } from "@/utils";

interface BidOpportunity {
  _id: string;
  title: string;
  description: string;
  value: string;
  deadline: string;
  source: string;
  category: string;
  status: "Interested" | "Preparing" | "Awaiting Decision" | "Won" | "Lost";
  timestamp: string;
}

interface KanbanBoardProps {
  opportunities: BidOpportunity[];
  onStatusChange: (id: string, status: BidOpportunity["status"]) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  opportunities,
  onStatusChange
}) => {
  const navigate = useNavigate();
  // Define the columns
  const columns = [
    {
      id: "Interested",
      title: "Interested",
      color: "bg-status-research_light"
    },
    { id: "Preparing", title: "Preparing", color: "bg-status-review_light" },
    {
      id: "Awaiting Decision",
      title: "Awaiting Decision",
      color: "bg-status-pending_light"
    },
    { id: "Won", title: "Won", color: "bg-status-success_light" },
    { id: "Lost", title: "Lost", color: "bg-status-planning_light" }
  ];

  // Group opportunities by status
  const getOpportunitiesByStatus = (status: string) => {
    return opportunities.filter((opp) => opp.status === status);
  };

  // Handle drag end event
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Update the opportunity status
    if (destination.droppableId !== source.droppableId) {
      onStatusChange(
        draggableId,
        destination.droppableId as BidOpportunity["status"]
      );
    }
  };

  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: customLocale
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Render the component
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex overflow-x-auto scrollbar-thin h-full gap-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`flex-1 min-w-80 rounded-lg flex flex-col max-h-full group p-4 ${column.color}`}
          >
            <h2 className="font-bold text-lg mb-4">{column.title}</h2>
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-[500px]"
                >
                  {getOpportunitiesByStatus(column.id).map(
                    (opportunity, index) => (
                      <Draggable
                        key={opportunity._id}
                        draggableId={opportunity._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-3"
                          >
                            <Card
                              className="bg-white shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                              onClick={() =>
                                navigate(`/bid-capture/${opportunity._id}`)
                              }
                            >
                              <CardHeader className="p-3 pb-0">
                                <CardTitle className="text-base font-semibold line-clamp-2">
                                  {opportunity.title}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-3 pt-2">
                                <div className="text-sm text-gray-500 line-clamp-2 mb-2">
                                  {opportunity.description}
                                </div>
                                <div className="flex justify-between items-center">
                                  <Badge
                                    variant="outline"
                                    className="bg-orange/10 text-orange border-orange"
                                  >
                                    {opportunity.value}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {getTimeAgo(opportunity.timestamp)}
                                  </span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {opportunity.source}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Due:{" "}
                                    {new Date(
                                      opportunity.deadline
                                    ).toLocaleDateString()}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    )
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
