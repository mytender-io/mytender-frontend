import React, { useState, useEffect, useRef, useContext } from "react";
import { useAuthUser } from "react-auth-kit";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants.tsx";
import { useNavigate } from "react-router-dom";
import withAuth from "../../routes/withAuth.tsx";
import NewTenderModal from "./components/NewTenderModal.tsx";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation.tsx";
import EllipsisMenuDashboard from "./components/EllipsisMenuDashboard.tsx";
import BidStatusMenu from "./components/BidStatusMenu.tsx";
import BidResultDropdown from "./components/BidResultDropdown.tsx";
import KanbanView from "./components/KanbanView.tsx";
import ViewToggle from "./components/ViewToggle.tsx";
import PaginationRow from "@/components/PaginationRow.tsx";
import SearchInput from "@/components/SearchInput.tsx";
import { Button } from "@/components/ui/button";
import PlusIcon from "@/components/icons/PlusIcon.tsx";
import { WelcomeModal } from "./components/WelcomeModal.tsx";
import SkeletonRow from "./components/SkeletonRow.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import SortUpIcon from "@/components/icons/SortUpIcon.tsx";
import { DeleteConfirmationDialog } from "@/modals/DeleteConfirmationModal.tsx";
import { customLocale, cn } from "@/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { useLoading } from "@/context/LoadingContext";
import posthog from "posthog-js";
import FeedbackDialog from "@/modals/FeedbackDialog.tsx";
import { useUserData } from "@/context/UserDataContext.tsx";
import EditBidModal from "./components/EditBidModal.tsx";
import { BidContext } from "../BidWritingStateManagerView.tsx";

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
  new_bid_completed?: boolean;
  [key: string]: string | string[] | boolean | undefined;
}

interface SortConfig {
  key: keyof Bid;
  direction: "asc" | "desc";
}

const Bids = () => {
  const { setSharedState } = useContext(BidContext);
  const [bids, setBids] = useState<Bid[]>([]);
  const [filteredBids, setFilteredBids] = useState<Bid[]>([]);
  const [sortedBids, setSortedBids] = useState<Bid[]>([]);
  const [currentBids, setCurrentBids] = useState<Bid[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [bidToDelete, setBidToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { userProfile } = useUserData();

  const [viewType, setViewType] = useState("table"); // or 'kanban'

  const {
    isGeneratingOutline,
    setIsGeneratingOutline,
    setProgress,
    setLoadingMessage
  } = useLoading();

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentBidForFeedback, setCurrentBidForFeedback] = useState<
    string | null
  >(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [bidToEdit, setBidToEdit] = useState<Bid | null>(null);

  // Add this function to your Bids component
  const handleFeedbackClick = (bidId: string): void => {
    setCurrentBidForFeedback(bidId);
    setShowFeedbackModal(true);
  };

  const duplicateBid = async (bidId: string): Promise<void> => {
    try {
      posthog.capture("duplicate_bid", { bid_id: bidId });
      toast.warning("Duplicating Bid...");

      const formData = new FormData();
      formData.append("object_id", bidId);

      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/duplicate_bid/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.data && response.data.status === "success") {
        // Fetch the updated list of bids to include the new duplicate
        await fetchBids();
        toast.success("Bid duplicated successfully");
      } else {
        toast.error("Failed to duplicate bid");
      }
    } catch (err) {
      console.error("Error duplicating bid:", err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Display the exact error message from the backend
          const errorMessage =
            err.response.data?.detail || "Failed to duplicate bid";
          toast.error(errorMessage);
        } else if (err.request) {
          toast.error("No response received from server. Please try again.");
        }
      } else {
        toast.error("Error duplicating bid. Please try again.");
      }
    }
  };

  // Function to check if a bid was recently created and new_bid_completed is false
  const isIncompleteBid = (bid: Bid): boolean => {
    // Check if timestamp exists

    // Check if new_bid_completed is false or undefined (treating undefined as false)
    const isNewBidIncomplete = bid.new_bid_completed === false;

    // Return true if edited less than 20 minutes ago and new_bid_completed is false
    return isNewBidIncomplete;
  };
  // Modify the ViewToggle button click handler
  const handleViewChange = (view: "table" | "kanban") => {
    setViewType(view);
    posthog.capture("view_change", { view_type: view });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  // Sorting bids based on the selected criteria
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "timestamp",
    direction: "desc"
  } as const);

  const sortData = (data: Bid[], sortConfig: SortConfig): Bid[] => {
    const sortedData = [...data].sort((a: Bid, b: Bid) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Helper function to check if value is empty
      const isEmpty = (value: unknown): boolean => {
        return (
          value === null ||
          value === undefined ||
          value === "" ||
          String(value).trim() === ""
        );
      };

      // Always put empty values at the end
      if (isEmpty(aValue) && !isEmpty(bValue)) return 1;
      if (!isEmpty(aValue) && isEmpty(bValue)) return -1;
      if (isEmpty(aValue) && isEmpty(bValue)) return 0;

      let comparison = 0;
      const dateA = new Date(aValue as string);
      const dateB = new Date(bValue as string);
      const isValidDateA = !isNaN(dateA.getTime());
      const isValidDateB = !isNaN(dateB.getTime());

      switch (sortConfig.key) {
        case "timestamp":
        case "submission_deadline":
          if (!isValidDateA && isValidDateB) return 1;
          if (isValidDateA && !isValidDateB) return -1;
          if (!isValidDateA && !isValidDateB) return 0;

          comparison = dateA.getTime() - dateB.getTime();
          break;

        case "status":
        case "bid_qualification_result":
          comparison = String(aValue)
            .toLowerCase()
            .localeCompare(String(bValue).toLowerCase());
          break;

        default:
          comparison = String(aValue)
            .toLowerCase()
            .localeCompare(String(bValue).toLowerCase());
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return sortedData;
  };

  const filterBids = (bids: Bid[], searchTerm: string): Bid[] => {
    if (!searchTerm) return bids;

    const lowercaseSearch = searchTerm.toLowerCase();
    return bids.filter((bid) => {
      return (
        bid.bid_title?.toLowerCase().includes(lowercaseSearch) ||
        bid.client_name?.toLowerCase().includes(lowercaseSearch) ||
        (typeof bid.value === "string" &&
          bid.value?.toLowerCase().includes(lowercaseSearch)) ||
        bid.status?.toLowerCase().includes(lowercaseSearch) ||
        bid.bid_qualification_result?.toLowerCase().includes(lowercaseSearch)
      );
    });
  };

  const requestSort = (key: keyof Bid) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    posthog.capture("sort_bids", { sort_key: key, sort_direction: direction });
  };

  const getSortIcon = (columnKey: keyof Bid): React.ReactElement => {
    if (sortConfig.key !== columnKey) {
      return <></>;
    }

    return (
      <SortUpIcon
        className={cn("w-3 h-3 text-typo-900 transition-all duration-300", {
          "rotate-180": sortConfig.direction === "desc"
        })}
      />
    );
  };

  const headers = [
    { key: "bid_title", label: "Tender Name", width: "300px" },
    { key: "timestamp", label: "Last edited" },
    { key: "value", label: "Value" },
    { key: "submission_deadline", label: "Deadline" },
    { key: "status", label: "Status" },
    { key: "bid_qualification_result", label: "Won/Lost" }
  ];

  useEffect(() => {
    // First apply the search term filter
    const searchFiltered = filterBids(bids, searchTerm);

    // Then filter out any incomplete bids
    const completeBids = searchFiltered.filter((bid) => !isIncompleteBid(bid));

    setFilteredBids(completeBids);
    setFilteredBids(filterBids(bids, searchTerm));
    posthog.capture("search_bids", { search_term: searchTerm });
  }, [bids, searchTerm]);

  useEffect(() => {
    setSortedBids(sortData(filteredBids, sortConfig));
  }, [filteredBids, sortConfig]);

  useEffect(() => {
    if (!Array.isArray(sortedBids)) return; // Safety check

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentPageBids = sortedBids.slice(startIndex, endIndex);

    // Reset to first page if current page is empty
    if (currentPageBids.length === 0 && currentPage > 1) {
      setCurrentPage(1);
      return;
    }

    setCurrentBids(currentPageBids);
  }, [sortedBids, currentPage, pageSize]);

  const navigateToChatbot = (bid: Bid) => {
    localStorage.removeItem("bidState");
    localStorage.removeItem("tenderLibChatMessages");
    localStorage.removeItem("previewSidepaneMessages");
    navigate(`/bid?id=${bid._id}`, {
      state: { bid: bid, fromBidsTable: true }
    });
  };

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
        setBids(response.data.bids);
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
    localStorage.removeItem("lastActiveBid");
  }, []);

  const confirmDeleteBid = async () => {
    if (bidToDelete) {
      posthog.capture("delete_bid", { bid_id: bidToDelete });

      const formData = new FormData();
      formData.append("bid_id", bidToDelete);
      try {
        const response = await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/delete_bid/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );
        // New version
        if (response.data && response.data.status === "success") {
          setBids((prevBids) =>
            prevBids.filter((bid) => bid._id !== bidToDelete)
          );
          toast.success("Bid deleted successfully");
        } else {
          toast.error("Failed to delete bid");
        }
      } catch (err) {
        // Type guard to check if error is AxiosError
        if (axios.isAxiosError(err)) {
          console.error("Error deleting bid:", err);
          if (err.response) {
            // Display the exact error message from the backend
            const errorMessage =
              err.response.data?.detail || "Failed to delete bid";
            toast.error(errorMessage);
          } else if (err.request) {
            toast.error("No response received from server. Please try again.");
          }
        } else {
          // Handle non-Axios errors
          console.error("Non-Axios error:", err);
          toast.error("Error deleting bid. Please try again.");
        }
      } finally {
        setShowDeleteModal(false);
      }
    }
  };

  const handleDeleteClick = (bidId: string): void => {
    setBidToDelete(bidId);
    setShowDeleteModal(true);
  };

  // Function to update the bid qualification result
  const updateBidQualificationResult = async (
    bidId: string,
    newResult: string
  ): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("bid_id", bidId);
      formData.append("bid_qualification_result", newResult);
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/update_bid_qualification_result/`,
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
            bid._id === bidId
              ? { ...bid, bid_qualification_result: newResult }
              : bid
          )
        );

        toast.success("Bid result updated successfully");
      } else {
        toast.error("Failed to update bid result");
      }
    } catch (err) {
      console.error("Error updating bid result:", err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Display the exact error message from the backend
          const errorMessage =
            err.response.data?.detail || "Failed to update bid result";
          toast.error(errorMessage);
        } else if (err.request) {
          toast.error("No response received from server. Please try again.");
        }
      } else {
        toast.error("Error updating bid result. Please try again.");
      }
    }
  };

  const updateBidStatus = async (
    bidId: string,
    newStatus: Bid["status"]
  ): Promise<void> => {
    try {
      posthog.capture("update_bid_status", {
        bid_id: bidId,
        new_status: newStatus
      });

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

        toast.success("Bid status updated successfully");
      } else {
        toast.error("Failed to update bid status");
      }
    } catch (err) {
      console.error("Error updating bid status:", err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Display the exact error message from the backend
          const errorMessage =
            err.response.data?.detail || "Failed to update bid status";
          toast.error(errorMessage);
        } else if (err.request) {
          toast.error("No response received from server. Please try again.");
        }
      } else {
        toast.error("Error updating bid status. Please try again.");
      }
    }
  };

  const handleWriteProposalClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setIsGeneratingOutline(false);
  };

  const handleSuccess = () => {
    handleModalClose();
    fetchBids();
  };

   const handleFail = () => {
    handleModalClose();
    fetchBids();
  };

  const parentPages = [] as Array<{ name: string; path: string }>;

  // Check if this is the user's first visit
  useEffect(() => {
    if (userProfile) {
      const hasVisitedBefore = userProfile?.tutorial_complete;
      if (!hasVisitedBefore) {
        setShowWelcomeModal(true);
      }
    }
  }, [userProfile]);

  const markTutorialComplete = async (token: string) => {
    try {
      await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/tutorial_complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (err) {
      console.error("Failed to mark tutorial as complete:", err);
    }
  };

  const handleTutorialComplete = () => {
    markTutorialComplete(tokenRef.current);
    setShowWelcomeModal(false);
  };

  // Function to update bid details (value and deadline)
  const updateBidDetails = async (data: {
    value: string;
    submission_deadline: string;
  }): Promise<void> => {
    if (!bidToEdit) return;

    setSharedState((prevState) => {
      return {
        ...prevState,
        submission_deadline: data.submission_deadline,
        value: data.value
      };
    });

    try {
      setBids((prevBids) =>
        prevBids.map((bid) =>
          bid._id === bidToEdit._id
            ? {
                ...bid,
                value: data.value,
                submission_deadline: data.submission_deadline
              }
            : bid
        )
      );

      toast.success("Bid details updated successfully");
    } catch (err) {
      console.log(err);
      toast.error("Error updating bid details. Please try again.");
    }
  };

  const handleEditClick = (bid: Bid): void => {
    console.log("bid", bid);
    setBidToEdit(bid);
    if (bid) {
      setSharedState((prevState) => {
        return {
          ...prevState,
          object_id: bid?._id || "",
          timestamp: bid?.timestamp || ""
        };
      });
    }
    setShowEditModal(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between w-full border-b border-typo-200 px-6 py-2 min-h-14">
        <BreadcrumbNavigation
          currentPage="Tender Dashboard"
          parentPages={parentPages}
          rightContent={
            <SearchInput value={searchTerm} onChange={setSearchTerm} />
          }
        />
      </div>
      <div className="flex flex-col py-4 px-6 space-y-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <span className="block text-2xl font-semibold">
              Track your tenders
            </span>
            <span className="block text-base text-gray-hint_text">
              Monitor all of your tenders through the bid lifecycle.
            </span>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <ViewToggle value={viewType} onChange={handleViewChange} />
            <Button
              size="lg"
              className="px-4"
              onClick={handleWriteProposalClick}
            >
              <PlusIcon className="text-white" />
              New Tender
            </Button>
          </div>
        </div>
        {viewType === "table" ? (
          <div className="flex flex-col justify-between flex-1 overflow-y-auto space-y-4">
            <div className="border border-typo-200 rounded-lg overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHead
                        key={header.key}
                        className="text-sm text-typo-900 font-semibold py-3.5 px-4 cursor-pointer select-none"
                        onClick={() => requestSort(header.key)}
                        style={{ width: header.width }}
                      >
                        <div className="flex items-center gap-2">
                          {header.label}
                          {getSortIcon(header.key)}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="w-[100px] text-right text-sm text-typo-900 font-semibold py-3.5 px-4 select-none">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(14)
                      .fill(0)
                      .map((_, index) => <SkeletonRow key={index} />)
                  ) : currentBids.length > 0 ? (
                    currentBids.map((bid) => {
                      return (
                        <TableRow key={bid._id}>
                          <TableCell className="px-4 group">
                            {/* For all bids, use a span that we can control the click behavior on */}
                            <span
                              className={`block truncate w-full ${
                                isIncompleteBid(bid)
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-gray-hint_text cursor-pointer hover:text-orange hover:font-bold transition-colors duration-200"
                              }`}
                              onClick={(e) => {
                                // Only navigate for complete bids
                                if (!isIncompleteBid(bid)) {
                                  navigateToChatbot(bid);
                                } else {
                                  // For incomplete bids, just show the toast and don't navigate
                                  e.preventDefault();
                                  toast.info(
                                    "This tender is still being created. Please try again later."
                                  );
                                }
                              }}
                            >
                              {bid.bid_title}
                            </span>
                          </TableCell>
                          <TableCell className="px-4">
                            {bid.timestamp
                              ? formatDistanceToNow(new Date(bid.timestamp), {
                                  addSuffix: true,
                                  locale: customLocale
                                })
                              : ""}
                          </TableCell>
                          <TableCell className="px-4">£{bid.value}</TableCell>
                          <TableCell className="px-4">
                            {bid.submission_deadline &&
                            !isNaN(Date.parse(bid.submission_deadline))
                              ? new Date(
                                  bid.submission_deadline
                                ).toLocaleDateString()
                              : ""}
                          </TableCell>
                          <TableCell className="px-4">
                            <BidStatusMenu
                              value={bid.status}
                              onChange={(value) => {
                                updateBidStatus(bid._id, value);
                              }}
                            />
                          </TableCell>
                          <TableCell className="px-4">
                            <BidResultDropdown
                              value={bid.bid_qualification_result}
                              onChange={(value) => {
                                updateBidQualificationResult(bid._id, value);
                              }}
                            />
                          </TableCell>
                          <TableCell className="w-[100px] text-right px-4">
                            <EllipsisMenuDashboard
                              onDeleteClick={() => handleDeleteClick(bid._id)}
                              onFeedbackClick={() =>
                                handleFeedbackClick(bid._id)
                              }
                              onDuplicateClick={() => duplicateBid(bid._id)}
                              onEditClick={() => handleEditClick(bid)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell className="text-center py-4" colSpan={7}>
                        No matching tenders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <PaginationRow
              currentPage={currentPage}
              pageSize={pageSize}
              totalRecords={bids.length}
              onPageChange={handlePageChange}
            />
          </div>
        ) : (
          <KanbanView
            bids={sortedBids}
            updateBidStatus={updateBidStatus}
            navigateToChatbot={navigateToChatbot}
          />
        )}
        <NewTenderModal
          show={showModal}
          onHide={handleModalClose}
          onSuccess={handleSuccess}
          onFail={handleFail}
          existingBids={bids}
          fetchBids={fetchBids}
          isGeneratingOutline={isGeneratingOutline}
          setIsGeneratingOutline={setIsGeneratingOutline}
          setProgress={setProgress}
          setLoadingMessage={setLoadingMessage}
        />

        <DeleteConfirmationDialog
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteBid}
          title="Confirm Delete"
          message="Are you sure you want to delete this tender?"
        />

        <FeedbackDialog
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          bidId={currentBidForFeedback || undefined}
          token={tokenRef.current}
        />

        <EditBidModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={updateBidDetails}
          currentValue={bidToEdit?.value || ""}
          currentDeadline={bidToEdit?.submission_deadline || ""}
        />

        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={handleTutorialComplete}
        />
      </div>
    </div>
  );
};

export default withAuth(Bids);
