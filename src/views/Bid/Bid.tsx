import { useContext, useState, useEffect, useCallback, useRef } from "react";
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
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import CollapsibleHeader from "./components/CollapsibleHeader";

const Bid = () => {
  const { sharedState, setSharedState } = useContext(BidContext);
  const { bidInfo, object_id, outline } = sharedState;
  const initialBidName = bidInfo;
  const navigate = useNavigate();

  const parentPages = [{ name: "Tender Dashboard", path: "/bids" }];

  const location = useLocation();
  const bidData = location.state?.bid || null;
  const contentRef = useRef<HTMLDivElement>(null);
  const [yPosition, setYPosition] = useState(0);

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
    (taskId: string | null, sectionIndex: string | null) => {
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

  // Scroll to top function
  const scrollToTop = () => {
    contentRef.current?.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Handle scroll event to show/hide scroll button
  const handleScroll = () => {
    if (contentRef.current) {
      setYPosition(contentRef.current.scrollTop);
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const currentRef = contentRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll);
      return () => {
        currentRef.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

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
          (folder: string) => folder?.length > 1
        );
        if (selectedFolders.length === 0) {
          selectedFolders = ["default"];
        }

        const competitor_urls = Array.isArray(bidData?.competitor_urls)
          ? bidData.competitor_urls
          : [];

        console.log("loading competitor urls");
        console.log(bidData?.competitor_urls);

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
          isSaved: false,
          object_id: bidData?._id || "",
          selectedFolders: selectedFolders,
          timestamp: bidData?.timestamp || "",
          outline: bidData?.outline || [],
          win_themes: bidData?.win_themes || [],
          customer_pain_points: bidData?.customer_pain_points || [],
          differentiating_factors: bidData?.differentiating_factors || [],
          competitor_urls: competitor_urls,
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
      <div ref={contentRef} className="flex flex-1 overflow-y-auto relative">
        <div className="w-60 min-w-60 h-full border-r border-gray-line">
          <BidNavbar activeTab={activeTab} handleTabClick={handleTabClick} />
        </div>
        <div className="flex flex-col h-full flex-1 overflow-y-auto">
          <CollapsibleHeader>
            <span className="text-xl font-semibold text-gray-hint_text">
              {activeTab === "/bid-extractor" && "Tender Insights"}
              {activeTab === "/bid-intel" && "Bid Inputs"}
              {activeTab === "/proposal-planner" && "Bid Outline"}
              {activeTab === "/proposal-preview" && "Bid Enhancer"}
            </span>
            <span className="text-gray-hint_text">
              {activeTab === "/bid-extractor" &&
                "Please detail how you would implement a positive impact on the surrounding local community for the contract?"}
              {activeTab === "/bid-intel" &&
                "Create all of the bid inputs to have as inputs into the bid response "}
              {activeTab === "/proposal-planner" &&
                "Create all of the bid inputs to have as inputs into the bid response "}
              {activeTab === "/proposal-preview" && "Bid Enhancer"}
            </span>
          </CollapsibleHeader>
          <div className="flex flex-col gap-4 h-full flex-1 py-4 px-6 overflow-y-auto">
            {activeTab === "/bid-extractor" && <BidPlanner />}
            {activeTab === "/bid-intel" && (
              <BidIntel showViewOnlyMessage={showViewOnlyMessage} />
            )}
            {activeTab === "/proposal-planner" && (
              <ProposalPlan
                openTask={openTask}
                taskToOpen={shouldOpenTask ? taskId : null}
                sectionIndex={shouldOpenTask ? sectionIndex : null}
                handleRegenerateClick={handleRegenerateClick}
                handleTabClick={handleTabClick}
              />
            )}
            {activeTab === "/proposal-preview" && (
              <ProposalPreview yPosition={yPosition} />
            )}
            <OutlineInstructionsModal
              show={showModal}
              onHide={() => setShowModal(false)}
              bid_id={object_id}
            />
          </div>
        </div>

        {/* Scroll to top button */}
        {yPosition > 200 && (
          <Button
            variant="ghost"
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-primary rounded-full p-3 text-white shadow-lg hover:bg-primary-dark hover:text-white transition-all duration-300 z-50 w-9"
            aria-label="Scroll to top"
          >
            <ArrowUp size={24} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default withAuth(Bid);
