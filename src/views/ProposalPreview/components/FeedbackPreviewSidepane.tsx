import { useContext, useRef, useState } from "react";
import { useAuthUser } from "react-auth-kit";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TooltipContent,
  Tooltip,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import GetFeedbackButton from "./GetQuestionFeedbackButton";
import { BidContext } from "@/views/BidWritingStateManagerView";
import BinIcon from "@/components/icons/BinIcon";
import CheckIcon from "@/components/icons/CheckIcon";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/utils";
import LoadingSpinner from "@/components/icons/LoadingSpinner";
import AddCriteriaModal from "./AddCriteriaModal";

// Define feedback type
interface Feedback {
  id: string;
  originalText: string;
  reasoning: string;
  feedback: string;
  resolved?: boolean;
}

// Define SelectedPrompts type
type PromptKey =
  | "ai_bid_review_clarity_and_persuasivness"
  | "ai_review_evidencing"
  | "ai_review_overall_feedback"
  | "ai_review_structure_and_flow";

interface SelectedPrompts {
  ai_bid_review_clarity_and_persuasivness: boolean;
  ai_review_evidencing: boolean;
  ai_review_overall_feedback: boolean;
  ai_review_structure_and_flow: boolean;
}

interface FeedbackSidepaneProps {
  sectionIndex: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFeedbackImprovement: (
    feedbackId: string,
    improvedText: string
  ) => void; // Changed from onReplace
  activeFeedback: Feedback | null;
  onFeedbackResolved: (feedbackId: string) => void;
}

const FeedbackSidepane = ({
  sectionIndex,
  open,
  onOpenChange,
  onApplyFeedbackImprovement,
  activeFeedback,
  onFeedbackResolved
}: FeedbackSidepaneProps) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
  const { sharedState } = useContext(BidContext);
  const { outline } = sharedState;

  // State to track selected prompts - only overall feedback selected by default
  const [selectedPrompts, setSelectedPrompts] = useState<SelectedPrompts>({
    ai_bid_review_clarity_and_persuasivness: false,
    ai_review_evidencing: false,
    ai_review_overall_feedback: true,
    ai_review_structure_and_flow: false
  });

  // State for showing criteria input and storing criteria text
  const [scoringCriteria, setScoringCriteria] = useState("");

  // State for the criteria modal
  const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);
  const [tempCriteria, setTempCriteria] = useState("");

  // Loading state for feedback
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckboxChange = (promptKey: PromptKey) => {
    setSelectedPrompts((prev) => ({
      ...prev,
      [promptKey]: !prev[promptKey]
    }));
  };

  // Get array of selected prompt keys
  const getSelectedPromptsList = () => {
    return Object.keys(selectedPrompts).filter(
      (key) => selectedPrompts[key as PromptKey]
    ) as PromptKey[];
  };

  const handleAcceptFeedback = (feedback: Feedback) => {
    if (feedback?.id && feedback?.feedback && onApplyFeedbackImprovement) {
      // Call the appropriate function with both feedbackId and the improved text
      onApplyFeedbackImprovement(feedback.id, feedback.feedback);
    }
  };

  const handleDeclineFeedback = (feedback: Feedback) => {
    if (feedback?.id && onFeedbackResolved) {
      // Just mark as resolved without applying the suggested changes
      onFeedbackResolved(feedback.id);
    }
  };

  // Function to handle criteria addition
  const handleAddCriteria = () => {
    setCriteriaModalOpen(true);
    setTempCriteria(scoringCriteria);
  };

  // Function to save criteria from modal
  const handleSaveCriteria = () => {
    setScoringCriteria(tempCriteria);
    setCriteriaModalOpen(false);
  };

  // Get all feedback for the current section
  const getAllFeedbackForCurrentSection = () => {
    if (sectionIndex === null || !outline[sectionIndex]) return [];

    const currentSection = outline[sectionIndex];
    const allFeedback = currentSection.answerFeedback || [];

    // Filter out resolved feedback
    return allFeedback.filter((feedback) => !feedback.resolved);
  };

  // Get all feedback and sort with active feedback first
  const getSortedFeedback = () => {
    const allFeedback = getAllFeedbackForCurrentSection();

    if (!activeFeedback) return allFeedback;

    // Sort to put active feedback at top
    return allFeedback.sort((a, b) => {
      if (a.id === activeFeedback.id) return -1;
      if (b.id === activeFeedback.id) return 1;
      return 0;
    });
  };

  // Get the section data for the current section
  const currentSection = sectionIndex !== null ? outline[sectionIndex] : null;

  // Array of sorted feedback items
  const sortedFeedback = getSortedFeedback();

  // If not open, return null
  if (!open) return null;

  return (
    <>
      <div
        className={cn(
          "shadow-lg flex flex-col w-full h-full bg-white overflow-hidden border border-gray-line min-h-[calc(-241px+100vh)]"
        )}
      >
        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-medium text-center w-full">
                  Ai Bid Consultant
                </h3>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                To help improve your responses by checking the response and
                offering improvements
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 absolute right-2"
                  onClick={() => {
                    onOpenChange(false);
                  }}
                >
                  <X size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Close</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8 h-full">
              <p className="text-lg text-gray-hint_text font-semibold">
                Loading...
              </p>
              <LoadingSpinner />
              <p className="text-gray-hint_text font-medium">
                We're just loading up our feedback...
              </p>
            </div>
          ) : activeFeedback && sortedFeedback.length > 0 ? (
            <div className="space-y-4">
              {/* Section heading */}
              {currentSection && (
                <div className="text-gray-hint_text font-medium">
                  <h3 className="text-lg font-bold">
                    {currentSection.heading}
                  </h3>
                </div>
              )}
              <div className="space-y-4 text-gray-hint_text font-medium">
                <p>Overall Feedback:</p>
                <p>
                  Overall this response is well structured, but there are some
                  areas for improvement.
                </p>
                <ul className="leading-none">
                  <li>Saying this</li>
                  <li>In this way</li>
                  <li>And here</li>
                </ul>
                <p>Here are some potential edits: ({sortedFeedback.length})</p>
              </div>
              {/* Render all feedback items */}
              {sortedFeedback.map((feedback) => (
                <div
                  key={feedback.id}
                  className={cn(
                    "bg-gray-bg rounded-xl p-3 space-y-3 text-gray-hint_text font-medium"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>Overall Feedback</span>
                    {/* Action buttons */}
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeclineFeedback(feedback)}
                        className="bg-status-planning_light border-status-planning w-8 rounded-lg"
                      >
                        <BinIcon className="text-status-planning" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAcceptFeedback(feedback)}
                        className="bg-status-success_light border-status-success w-8 rounded-lg"
                      >
                        <CheckIcon className="text-status-success" />
                      </Button>
                    </div>
                  </div>
                  <div className="border-l-2 border-orange px-3">
                    <p className="text-sm">{feedback.originalText}</p>
                  </div>
                  <p className="text-sm">{feedback.reasoning} for example:</p>
                  <div className="px-3">
                    <p className="text-sm">{feedback.feedback}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col gap-2 font-medium">
                {/* Section heading */}
                {currentSection && (
                  <div className="text-gray-hint_text font-medium">
                    <h3 className="text-lg font-bold">
                      {currentSection.heading}
                    </h3>
                  </div>
                )}
                <span className="text-gray-hint_text">
                  Add question specific criteria for optimal feedback
                </span>
                <span className="text-gray-border1 text-sm">
                  Get much more specific feedback based around the criteria
                </span>
                <Button
                  variant="outline"
                  className="w-fit text-orange border-orange hover:text-orange-light hover:bg-white mt-2"
                  onClick={handleAddCriteria}
                >
                  Add Criteria
                </Button>
              </div>
              <div className="space-y-3 font-medium">
                <span className="text-gray-hint_text">
                  Click on the checks you would like to run
                </span>
                <div className="space-y-4 px-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="overall-feedback"
                      checked={selectedPrompts["ai_review_overall_feedback"]}
                      onCheckedChange={() =>
                        handleCheckboxChange("ai_review_overall_feedback")
                      }
                    />
                    <div className="leading-tight">
                      <label
                        htmlFor="overall-feedback"
                        className="text-gray-hint_text block"
                      >
                        Overall Feedback
                      </label>
                      <span className="text-gray-border1 text-xs">
                        Assess where you could improve given the scoring
                        criteria
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="evidencing"
                      checked={selectedPrompts["ai_review_evidencing"]}
                      onCheckedChange={() =>
                        handleCheckboxChange("ai_review_evidencing")
                      }
                    />
                    <div className="leading-tight">
                      <label
                        htmlFor="evidencing"
                        className="text-gray-hint_text block"
                      >
                        Evidencing
                      </label>
                      <span className="text-gray-border1 text-xs">
                        Find areas where you need to support your claims more
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="structure-flow"
                      checked={selectedPrompts["ai_review_structure_and_flow"]}
                      onCheckedChange={() =>
                        handleCheckboxChange("ai_review_structure_and_flow")
                      }
                    />
                    <div className="leading-tight">
                      <label
                        htmlFor="structure-flow"
                        className="text-gray-hint_text block"
                      >
                        Structure and Flow
                      </label>
                      <span className="text-gray-border1 text-xs">
                        Improve the logical flow and organization of your
                        response
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="clarity"
                      checked={
                        selectedPrompts[
                          "ai_bid_review_clarity_and_persuasivness"
                        ]
                      }
                      onCheckedChange={() =>
                        handleCheckboxChange(
                          "ai_bid_review_clarity_and_persuasivness"
                        )
                      }
                    />
                    <div className="leading-tight">
                      <label
                        htmlFor="clarity"
                        className="text-gray-hint_text block"
                      >
                        Clarity and persuasiveness
                      </label>
                      <span className="text-gray-border1 text-xs">
                        Enhance the clarity and persuasive power of your
                        arguments
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {sectionIndex !== null && (
                <div className="text-center">
                  <GetFeedbackButton
                    section={outline[sectionIndex]}
                    tokenRef={tokenRef}
                    sectionIndex={sectionIndex}
                    prompts={getSelectedPromptsList()}
                    scoringCriteria={scoringCriteria}
                    resetScoringCriteria={() => setScoringCriteria("")}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddCriteriaModal
        open={criteriaModalOpen}
        onOpenChange={setCriteriaModalOpen}
        sectionHeading={
          sectionIndex !== null ? outline[sectionIndex]?.heading : undefined
        }
        criteria={tempCriteria}
        onCriteriaChange={setTempCriteria}
        onSave={handleSaveCriteria}
      />
    </>
  );
};

export default FeedbackSidepane;
