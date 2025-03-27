import { useContext, useState, useEffect, useCallback } from "react";
import withAuth from "../../routes/withAuth";
import BidNavbar from "@/views/Bid/components/BidNavbar";
import { BidContext } from "../BidWritingStateManagerView";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation";
import { toast } from "react-toastify";
import BidPlanner from "../BidPlanner/BidPlanner";
import BidIntel from "../BidInputs/BidIntel";
import ProposalPlan from "../BidOutline/ProposalPlan";
import ProposalPreview from "../ProposalPreview/ProposalPreview";
import OutlineInstructionsModal from "../BidOutline/components/OutlineInstructionsModal";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/utils";

const Bid = () => {
  const { sharedState, setSharedState } = useContext(BidContext);
  const { bidInfo, object_id, outline } = sharedState;
  const initialBidName = bidInfo;
  const navigate = useNavigate();

  const parentPages = [{ name: "Tender Dashboard", path: "/bids" }];

  const location = useLocation();
  const bidData = location.state?.bid || null;

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const bidId = queryParams.get("id");
  const shouldOpenTask = queryParams.get("openTask") === "true";
  const taskId = queryParams.get("taskId");
  const sectionIndex = queryParams.get("sectionIndex");

  const [activeTab, setActiveTab] = useState(() => {
    // If we're being asked to open a task, default to proposal planner tab
    if (shouldOpenTask) {
      return "/proposal-planner";
    }
    return "/bid-extractor";
  });

  const [showModal, setShowModal] = useState(false);

  // Function to handle opening a task
  const openTask = useCallback(
    (taskId, sectionIndex) => {
      console.log(`Opening task ${taskId} at section index ${sectionIndex}`);

      // Remove query parameters from URL to avoid reopening on refresh
      navigate(`/bid?id=${bidId}`, { replace: true });
    },
    [object_id, navigate, bidId]
  );

  // Handle task opening when component mounts
  useEffect(() => {
    if (shouldOpenTask && taskId && sectionIndex) {
      // Make sure we're on the proposal planner tab
      setActiveTab("/proposal-planner");
    }
  }, [shouldOpenTask, taskId, sectionIndex]);

  const showViewOnlyMessage = () => {
    toast.error("You only have permission to view this bid.");
  };

  const handleTabClick = (path: string) => {
    // Delay navigation to allow animation to play
    setTimeout(() => {
      setActiveTab(path);
    }, 300); // 300ms matches our CSS transition time
  };

  const handleRegenerateClick = () => {
    setShowModal(true);
  };

  useEffect(() => {
    if (
      object_id &&
      outline.length === 0 &&
      activeTab === "/proposal-planner"
    ) {
      setShowModal(true);
    }
  }, [activeTab, outline.length, object_id]);

  useEffect(() => {
    if (bidData) {
      //console.log(bidData);
      setSharedState((prevState) => {
        // Filter out single-character entries from selectedFolders
        let selectedFolders = Array.isArray(bidData?.selectedFolders)
          ? bidData.selectedFolders
          : ["default"];
        selectedFolders = selectedFolders.filter(
          (folder) => folder?.length > 1
        );
        if (selectedFolders.length === 0) {
          selectedFolders = ["default"];
        }

        return {
          ...prevState,
          bidInfo: bidData?.bid_title || "",
          opportunity_information:
            bidData?.opportunity_information?.trim() || "",
          compliance_requirements:
            bidData?.compliance_requirements?.trim() || "",
          tender_summary: bidData?.tender_summary || "",
          evaluation_criteria: bidData?.evaluation_criteria || "",
          derive_insights: bidData?.derive_insights || "",
          differentiation_opportunities:
            bidData?.differentiation_opportunities || "",
          questions: bidData?.questions || "",
          value: bidData?.value || "",
          client_name: bidData?.client_name || "",
          bid_qualification_result: bidData?.bid_qualification_result || "",
          opportunity_owner: bidData?.opportunity_owner || "",
          submission_deadline: bidData?.submission_deadline || "",
          bid_manager: bidData?.bid_manager || "",
          contributors: bidData?.contributors || "",
          original_creator: bidData?.original_creator || "",
          object_id: bidData?._id || "",
          selectedFolders: selectedFolders,
          timestamp: bidData?.timestamp || "",
          outline: bidData?.outline || [],
          win_themes: bidData?.win_themes || [],
          customer_pain_points: bidData?.customer_pain_points || [],
          differentiating_factors: bidData?.differentiating_factors || [],
          selectedCaseStudies: bidData?.selectedCaseStudies || [],
          solution: bidData?.solution || {
            product: "",
            features: "",
            approach: ""
          },
          tone_of_voice: bidData?.tone_of_voice || "",
          new_bid_completed: bidData?.new_bid_completed || true
        };
      });
    }
  }, [bidData, setSharedState]);

  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          "flex items-center justify-between w-full border-b border-typo-200 pl-6 py-2 min-h-14",
          "pr-6"
        )}
      >
        <BreadcrumbNavigation
          currentPage={initialBidName}
          parentPages={parentPages}
        />
      </div>
      <div className="px-6 pt-4 flex-1 overflow-y-auto">
        <div className="flex flex-col space-y-4 h-full">
          <BidNavbar
            showViewOnlyMessage={showViewOnlyMessage}
            initialBidName={initialBidName}
            description={
              activeTab === "/bid-extractor"
                ? "Explore insights and retrieve info from the tender docs uploaded to peel back the layers of what the customer is asking for."
                : activeTab === "/bid-intel"
                  ? "Review and refine the AI-suggested inputs from the tender documents to configure your response strategy."
                  : activeTab === "/proposal-planner"
                    ? "Enrich the generated structure by injecting specific instructions to each question to assemble your first draft response."
                    : "Review your proposal here and continue working on it through our Word integration!"
            }
            outline={outline}
            object_id={object_id}
            activeTab={activeTab}
            handleTabClick={handleTabClick}
            handleRegenerateClick={handleRegenerateClick}
          />
          {activeTab === "/bid-extractor" && <BidPlanner />}
          {activeTab === "/bid-intel" && (
            <BidIntel showViewOnlyMessage={showViewOnlyMessage} />
          )}
          {activeTab === "/proposal-planner" && (
            <ProposalPlan
              openTask={openTask}
              taskToOpen={shouldOpenTask ? taskId : null}
              sectionIndex={shouldOpenTask ? sectionIndex : null}
            />
          )}
          {activeTab === "/proposal-preview" && (
            <ProposalPreview showViewOnlyMessage={showViewOnlyMessage} />
          )}
          <OutlineInstructionsModal
            show={showModal}
            onHide={() => setShowModal(false)}
            bid_id={object_id}
          />
        </div>
      </div>
    </div>
  );
};

export default withAuth(Bid);
