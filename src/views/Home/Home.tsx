import React, { useState, useEffect, useRef } from "react";
import { useAuthUser } from "react-auth-kit";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants.tsx";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation.tsx";
import withAuth from "@/routes/withAuth.tsx";
import BidStatusMenu from "../Bids/components/BidStatusMenu.tsx";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, CheckCircle, Clock, FileText, X } from "lucide-react";
import { toast } from "react-toastify";

interface Bid {
  _id: string;
  bid_title: string;
  status:
    | "Identification"
    | "Capture Planning"
    | "First Review"
    | "Final Review"
    | "Submitted";
  timestamp?: string;
  submission_deadline?: string;
  client_name?: string;
  bid_manager?: string;
  opportunity_owner?: string;
  bid_qualification_result?: string;
  win_themes?: string[];
  [key: string]: string | string[] | undefined; // Index signature for dynamic access
}

interface Task {
  _id: string;
  name: string;
  bid_id: string;
  index: number;
  created_at: string;
}

const Home = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [bidMap, setBidMap] = useState<Record<string, Bid>>({});
  const navigate = useNavigate();
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const fetchBids = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/get_bids_list/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      if (response.data && response.data.bids) {
        const bidsList = response.data.bids;
        setBids(bidsList);

        // Create a map of bid_id to bid for easier lookup
        const bidMapping = {};
        bidsList.forEach((bid) => {
          bidMapping[bid._id] = bid;
        });
        setBidMap(bidMapping);
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const response = await axios.get(
        `http${HTTP_PREFIX}://${API_URL}/get_user_tasks`,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      console.log("fetched tasks", response.data);
      if (response.data && response.data.tasks) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    // Navigate to the specific bid and store the index to open the correct section
    // We'll use localStorage to pass the index to the ProposalPlan component
    localStorage.setItem("openSectionIndex", task.index.toString());
    navigate(`/bid/${task.bid_id}/proposal-plan`);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(
        `http${HTTP_PREFIX}://${API_URL}/delete_user_task/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      // Remove the task from local state
      setTasks(tasks.filter((t) => t._id !== taskId));
      toast.success("Task removed successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const parentPages = [] as Array<{ name: string; path: string }>;

  // Calculate estimated value of all bids
  const calculateTotalBidValue = () => {
    if (!bids.length) return 0;

    return bids.reduce((total, bid) => {
      const value = bid.estimated_value
        ? parseFloat(bid.estimated_value.toString())
        : 0;
      return total + value;
    }, 0);
  };

  // Get relative time (e.g., "2 days ago") for task creation time
  const getRelativeTime = (dateStr) => {
    try {
      const date = parseISO(dateStr);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "Unknown date";
    }
  };

  // Get bid title from bid_id
  const getBidTitle = (bidId) => {
    const bid = bidMap[bidId];
    return bid
      ? bid.bid_title || bid.client_name || "Unnamed Bid"
      : "Unknown Bid";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between w-full border-b border-typo-200 px-6 py-2 min-h-[3.43785rem]">
        <BreadcrumbNavigation currentPage="Home" parentPages={parentPages} />
      </div>
      <div className="flex flex-col py-4 px-6 space-y-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <span className="block text-2xl font-semibold">Bid Center</span>
            <span className="block text-base text-gray-hint_text">
              Access all the key analytics of your bidding
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Bids Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-3">Recent Bids</h2>
            <p className="text-sm text-gray-500 mb-4">
              Last {Math.min(5, bids.length)} bids by timestamp.
            </p>

            {loading ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 font-medium text-sm py-2 border-b">
                  <div>Tender Name</div>
                  <div>Status</div>
                </div>

                {bids
                  .sort((a, b) => {
                    // Sort by timestamp in descending order (newest first)
                    const timeA = a.timestamp
                      ? new Date(a.timestamp).getTime()
                      : 0;
                    const timeB = b.timestamp
                      ? new Date(b.timestamp).getTime()
                      : 0;
                    return timeB - timeA;
                  })
                  .slice(0, 5)
                  .map((bid) => {
                    return (
                      <div
                        key={bid._id}
                        className="grid grid-cols-2 text-sm py-2"
                      >
                        <div className="truncate">
                          <Button
                            variant="link"
                            className="p-0 h-auto text-left font-normal"
                            onClick={() =>
                              navigate(`/bid/${bid._id}/proposal-plan`)
                            }
                          >
                            {bid.bid_title || bid.client_name || "Unnamed Bid"}
                          </Button>
                        </div>
                        <div>
                          <BidStatusMenu
                            value={bid.status}
                            onChange={() => {}}
                            disabled={true}
                          />
                        </div>
                      </div>
                    );
                  })}

                {bids.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No bids available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tasks Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-3">My Tasks</h2>
            <p className="text-sm text-gray-500 mb-4">
              Review and complete your assigned tasks
            </p>

            {tasksLoading ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : (
              <div className="h-96 overflow-y-auto pr-1">
                <div className="space-y-3">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <div
                        key={task._id}
                        className="p-3 border rounded-md hover:bg-gray-50 relative group"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div
                              className="text-sm font-medium text-blue-600 cursor-pointer mb-1"
                              onClick={() => handleTaskClick(task)}
                            >
                              {task.name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <FileText size={12} />
                              <span className="truncate max-w-[180px]">
                                {getBidTitle(task.bid_id)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Clock size={12} />
                              <span>
                                Created {getRelativeTime(task.created_at)}
                              </span>
                            </div>
                          </div>
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            onClick={() => handleDeleteTask(task._id)}
                            title="Remove task"
                          >
                            <X
                              size={16}
                              className="text-gray-400 hover:text-red-500"
                            />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                      <CheckCircle className="mb-2" size={24} />
                      <div>No pending tasks</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Potential Revenue Opportunities Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-3">
              Potential Revenue Opportunities
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Overview of financial potential
            </p>

            {loading ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="text-3xl font-bold text-green-600">
                    ${calculateTotalBidValue().toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Estimated total value
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 font-medium text-sm py-2 border-b">
                    <div>Category</div>
                    <div className="text-right">Count</div>
                  </div>

                  <div className="grid grid-cols-2 text-sm py-2">
                    <div>Active bids</div>
                    <div className="text-right">{bids.length}</div>
                  </div>

                  <div className="grid grid-cols-2 text-sm py-2">
                    <div>High probability</div>
                    <div className="text-right">
                      {bids.filter((b) => b.win_probability === "high")
                        .length || 0}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 text-sm py-2">
                    <div>Medium probability</div>
                    <div className="text-right">
                      {bids.filter((b) => b.win_probability === "medium")
                        .length || 0}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Home);
