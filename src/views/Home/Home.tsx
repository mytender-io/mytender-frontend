import React, { useState, useEffect, useRef } from "react";
import { useAuthUser } from "react-auth-kit";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants.tsx";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation.tsx";
import withAuth from "@/routes/withAuth.tsx";
import BidStatusMenu from "../Bids/components/BidStatusMenu.tsx";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  FileText,
  X,
  ChevronRight,
  TrendingUp,
  FileCheck,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { toast } from "react-toastify";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";

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
  new_bid_completed?: boolean;
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
  const [bidMap, setBidMap] = useState<Record<string, Bid>>({});
  const navigate = useNavigate();
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const fetchBids = async () => {
    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/get_bids_list`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      if (response.data && response.data.bids) {
        const bidsList = response.data.bids.filter(
          (bid) => bid.new_bid_completed !== false
        );
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
      toast.error("Failed to load bids");
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `http${HTTP_PREFIX}://${API_URL}/get_user_tasks`,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      if (response.data && response.data.tasks) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch both in parallel
        await Promise.all([fetchBids(), fetchTasks()]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const updateBidStatus = async (
    bidId: string,
    newStatus: string
  ): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("bid_id", bidId);
      formData.append("status", newStatus);

      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/update_bid_status/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.data && response.data.status === "success") {
        // Update local state instead of fetching all bids
        setBids((prevBids) =>
          prevBids.map((bid) =>
            bid._id === bidId ? { ...bid, status: newStatus } : bid
          )
        );

        // Also update in the map
        setBidMap((prevMap) => ({
          ...prevMap,
          [bidId]: { ...prevMap[bidId], status: newStatus }
        }));

        toast.success("Bid status updated successfully");
      } else {
        toast.error("Failed to update bid status");
      }
    } catch (err) {
      console.error("Error updating bid status:", err);
      toast.error("Error updating bid status. Please try again.");
    }
  };

  const handleTaskClick = (task) => {
    // Get the corresponding bid for this task
    const bid = bidMap[task.bid_id];

    if (!bid) {
      console.error(
        `Bid not found for task: ${task.name}, bid_id: ${task.bid_id}`
      );
      toast.error("Could not find the associated bid for this task");
      return;
    }

    // Clean up any existing state
    localStorage.removeItem("bidState");
    localStorage.removeItem("tenderLibChatMessages");
    localStorage.removeItem("previewSidepaneMessages");
    // Navigate with both query parameters and state
    navigate(
      `/bid?id=${task.bid_id}&openTask=true&taskId=${task._id}&sectionIndex=${task.index}`,
      {
        state: { bid: bid, fromBidsTable: true }
      }
    );
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const formData = new FormData();
      formData.append("task_id", taskId);

      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/delete_user_task?task_id=${taskId}`,
        {}, // Empty body since we're using URL parameter
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

  // Calculate estimated value of won bids
  const calculateTotalWonValue = () => {
    if (!bids.length) return 0;

    return bids.reduce((total, bid) => {
      // Only include bids that have been won
      if (bid.bid_qualification_result === "won") {
        const value = bid.value ? parseFloat(bid.value.toString()) : 0;
        return total + value;
      }
      return total;
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

  const isRecentlyCreatedWithEmptyThemes = (bid: Bid): boolean => {
    const isNewBidIncomplete = bid.new_bid_completed === false;
    return isNewBidIncomplete;
  };

  const navigateToChatbot = (bid: Bid) => {
    // Check if bid is disabled
    if (isRecentlyCreatedWithEmptyThemes(bid)) {
      toast.info("This tender is still being created. Please try again later.");
      return;
    }
    localStorage.removeItem("bidState");
    localStorage.removeItem("tenderLibChatMessages");
    localStorage.removeItem("previewSidepaneMessages");
    navigate(`/bid?id=${bid._id}`, {
      state: { bid: bid, fromBidsTable: true }
    });
  };

  // Get counts for stats
  const getActiveBidsCount = () => bids.length;
  const getWonBidsCount = () =>
    bids.filter((b) => b.bid_qualification_result === "won").length || 0;
  const getLostBidsCount = () =>
    bids.filter((b) => b.bid_qualification_result === "lost").length || 0;

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="flex items-center justify-between w-full border-b border-typo-200 px-6 py-2 min-h-14 bg-white">
          <BreadcrumbNavigation currentPage="Home" parentPages={parentPages} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center justify-between w-full border-b border-typo-200 px-6 py-2 min-h-14 bg-white">
        <BreadcrumbNavigation currentPage="Home" parentPages={parentPages} />
      </div>

      <div className="flex flex-col py-6 px-8 space-y-6 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">Bid Center</h1>
            <p className="text-gray-hint_text">
              Access all the key analytics of your bidding
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-hint_text">Active Bids</p>
                  <p className="text-2xl font-bold">{getActiveBidsCount()}</p>
                </div>
                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-hint_text">Bids Won</p>
                  <p className="text-2xl font-bold">{getWonBidsCount()}</p>
                </div>
                <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-hint_text">Bids Lost</p>
                  <p className="text-2xl font-bold">{getLostBidsCount()}</p>
                </div>
                <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-hint_text">Total Value Won</p>
                  <p className="text-2xl font-bold text-green-600">
                    £{calculateTotalWonValue().toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Bids Card */}
          <Card className="bg-white overflow-hidden">
            <CardHeader className="bg-white pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Recent Bids</CardTitle>
                  <CardDescription>
                    Last {Math.min(5, bids.length)} bids by timestamp
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/bids")}
                  className="text-blue-600 hover:text-blue-800 flex items-center text-base"
                >
                  View all <ChevronRight />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-0 pt-0">
              <div>
                <div className="grid grid-cols-4 text-sm font-bold text-gray-hint_text bg-white px-6 py-4 border-y">
                  <div className="col-span-3">Tender Name</div>
                  <div>Status</div>
                </div>

                {bids
                  .sort((a, b) => {
                    const timeA = a.timestamp
                      ? new Date(a.timestamp).getTime()
                      : 0;
                    const timeB = b.timestamp
                      ? new Date(b.timestamp).getTime()
                      : 0;
                    return timeB - timeA;
                  })
                  .slice(0, 5)
                  .map((bid, index) => (
                    <div
                      key={bid._id}
                      className={`grid grid-cols-4 px-6 py-3 ${
                        index !== bids.slice(0, 5).length - 1 ? "border-b" : ""
                      }`}
                    >
                      <div className="col-span-3 truncate flex items-center">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-left font-medium text-blue-600 hover:text-blue-800"
                          onClick={() => navigateToChatbot(bid)}
                        >
                          {bid.bid_title || bid.client_name || "Unnamed Bid"}
                        </Button>
                      </div>
                      <div>
                        <BidStatusMenu
                          value={bid.status}
                          onChange={(value) => updateBidStatus(bid._id, value)}
                          disabled={false}
                        />
                      </div>
                    </div>
                  ))}

                {bids.length === 0 && (
                  <div className="text-center py-8 text-gray-hint_text">
                    No bids available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tasks Card */}
          <Card className="bg-white overflow-hidden">
            <CardHeader className="bg-white pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">My Tasks</CardTitle>
                  <CardDescription>
                    Review and complete your assigned tasks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 pt-0 border-t">
              <div className="max-h-[400px] overflow-y-auto">
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <div
                      key={task._id}
                      className={`px-6 py-3 hover:bg-gray-50 transition-colors relative group ${
                        index !== tasks.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={() => handleTaskClick(task)}
                          >
                            {task.name}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <FileText size={12} />
                              <span className="truncate max-w-[180px]">
                                {getBidTitle(task.bid_id)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-hint_text flex items-center gap-1">
                              <Clock size={12} />
                              <span>{getRelativeTime(task.created_at)}</span>
                            </div>
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
                  <div className="flex flex-col items-center justify-center py-10 text-gray-hint_text gap-2">
                    <CheckCircle className="text-green-500" size={32} />
                    <p>No pending tasks</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Card */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Bid Analytics</CardTitle>
                <CardDescription>
                  Overview of your bidding performance
                </CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-2">
              <div className="space-y-1">
                <p className="text-sm text-gray-hint_text">Active bids</p>
                <p className="text-2xl font-semibold">{getActiveBidsCount()}</p>
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-hint_text">Win rate</p>
                <p className="text-2xl font-semibold">
                  {getWonBidsCount() + getLostBidsCount() > 0
                    ? Math.round(
                        (getWonBidsCount() /
                          (getWonBidsCount() + getLostBidsCount())) *
                          100
                      )
                    : 0}
                  %
                </p>
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${
                        getWonBidsCount() + getLostBidsCount() > 0
                          ? Math.round(
                              (getWonBidsCount() /
                                (getWonBidsCount() + getLostBidsCount())) *
                                100
                            )
                          : 0
                      }%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-hint_text">Average value</p>
                <p className="text-2xl font-semibold">
                  £
                  {getWonBidsCount() > 0
                    ? Math.round(
                        calculateTotalWonValue() / getWonBidsCount()
                      ).toLocaleString()
                    : 0}
                </p>
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default withAuth(Home);
