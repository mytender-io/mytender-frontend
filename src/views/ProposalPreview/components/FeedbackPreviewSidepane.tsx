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
import posthog from "posthog-js";
import GetFeedbackButton from "./GetQuestionFeedbackButton";
import { BidContext } from "@/views/BidWritingStateManagerView";
import BinIcon from "@/components/icons/BinIcon";
import CheckIcon from "@/components/icons/CheckIcon";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface FeedbackSidepaneProps {
  bid_id: string;
  sectionIndex: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeFeedback: any;
  onFeedbackResolved: (feedbackId: string) => void;
}

const FeedbackSidepane = ({
  bid_id,
  sectionIndex,
  open,
  onOpenChange,
  activeFeedback,
  onFeedbackResolved
}: FeedbackSidepaneProps) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
  const { sharedState } = useContext(BidContext);
  const { outline } = sharedState;
  
  // State to track selected prompts - only overall feedback selected by default
  const [selectedPrompts, setSelectedPrompts] = useState({
    "ai_bid_review_clarity_and_persuasivness": false,
    "ai_review_evidencing": false,
    "ai_review_overall_feedback": true,
    "ai_review_structure_and_flow": false
  });

  const handleCheckboxChange = (promptKey) => {
    setSelectedPrompts(prev => ({
      ...prev,
      [promptKey]: !prev[promptKey]
    }));
  };

  // Get array of selected prompt keys
  const getSelectedPromptsList = () => {
    return Object.keys(selectedPrompts).filter(key => selectedPrompts[key]);
  };

  const handleAcceptFeedback = () => {
    if (activeFeedback?.feedback && onFeedbackResolved) {
      // Call the feedback resolution handler
      onFeedbackResolved(activeFeedback.id);

      // Track the event
      posthog.capture("feedback_accepted", {
        feedbackId: activeFeedback.id,
        bidId: bid_id
      });
    }
  };

  const handleDeclineFeedback = () => {
    if (activeFeedback?.id && onFeedbackResolved) {
      // Just mark as resolved without applying the suggested changes
      onFeedbackResolved(activeFeedback.id);

      // Track the event
      posthog.capture("feedback_declined", {
        feedbackId: activeFeedback.id,
        bidId: bid_id
      });
    }
  };

  // If not open, return null
  if (!open) return null;

  return (
    <div className="shadow-lg flex flex-col w-full h-fit bg-white overflow-hidden border border-gray-line">
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {activeFeedback ? (
          <div className="space-y-4">
            <div className="space-y-4 text-gray-hint_text font-medium">
              <p>Overall Feedback:</p>
              <p>
                Overall this response is well structured, but there are some
                areas for improvement.
              </p>
              <p>Here are some potential edits:</p>
            </div>
            <div className="bg-gray-bg rounded-xl p-3 space-y-3 text-gray-hint_text font-medium">
              <div className="flex items-center justify-between">
                <span>Overall Feedback</span>
                {/* Action buttons */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeclineFeedback}
                    className="bg-status-planning_light border-status-planning w-8 rounded-lg"
                  >
                    <BinIcon className="text-status-planning" />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAcceptFeedback}
                    className="bg-status-success_light border-status-success w-8 rounded-lg"
                  >
                    <CheckIcon className="text-status-success" />
                  </Button>
                </div>
              </div>
              <div className="border-l-2 border-orange px-3">
                <p className="text-sm">{activeFeedback.originalText}</p>
              </div>
              <p className="text-sm">{activeFeedback.reasoning} for example:</p>
              <div className="px-3">
                <p className="text-sm">{activeFeedback.feedback}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col gap-2 font-medium">
              <span className="text-gray-hint_text">
                Add question specific criteria for optimal feedback
              </span>
              <span className="text-gray-border1 text-sm">
                Get much more specific feedback based around the criteria
              </span>
              <Button
                variant="outline"
                className="w-fit text-orange border-orange hover:text-orange-light hover:bg-white mt-2"
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
                    onCheckedChange={() => handleCheckboxChange("ai_review_overall_feedback")}
                  />
                  <div className="leading-tight">
                    <label
                      htmlFor="overall-feedback"
                      className="text-gray-hint_text block"
                    >
                      Overall Feedback
                    </label>
                    <span className="text-gray-border1 text-xs">
                      Assess where you could improve given the scoring criteria
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="evidencing" 
                    checked={selectedPrompts["ai_review_evidencing"]}
                    onCheckedChange={() => handleCheckboxChange("ai_review_evidencing")}
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
                    onCheckedChange={() => handleCheckboxChange("ai_review_structure_and_flow")}
                  />
                  <div className="leading-tight">
                    <label
                      htmlFor="structure-flow"
                      className="text-gray-hint_text block"
                    >
                      Structure and Flow
                    </label>
                    <span className="text-gray-border1 text-xs">
                      Improve the logical flow and organization of your response
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="clarity" 
                    checked={selectedPrompts["ai_bid_review_clarity_and_persuasivness"]}
                    onCheckedChange={() => handleCheckboxChange("ai_bid_review_clarity_and_persuasivness")}
                  />
                  <div className="leading-tight">
                    <label
                      htmlFor="clarity"
                      className="text-gray-hint_text block"
                    >
                      Clarity and persuasiveness
                    </label>
                    <span className="text-gray-border1 text-xs">
                      Enhance the clarity and persuasive power of your arguments
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
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackSidepane;