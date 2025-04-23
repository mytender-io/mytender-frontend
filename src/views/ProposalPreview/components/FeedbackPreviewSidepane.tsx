import { useContext, useRef } from "react";
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
                areas for improvement. You did well here:
              </p>
              <ul className="leading-none">
                <li>Saying this</li>
                <li>In this way</li>
                <li> And here</li>
              </ul>
              <p>Here are some potential edits: (1)</p>
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
                  <Checkbox id="overall-feedback" />
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
                  <Checkbox id="evidencing" />
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
                  <Checkbox id="grammar" />
                  <div className="leading-tight">
                    <label
                      htmlFor="grammar"
                      className="text-gray-hint_text block"
                    >
                      Grammar
                    </label>
                    <span className="text-gray-border1 text-xs">
                      Fix spelling and grammar errors
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="custom" />
                  <div className="leading-tight w-full space-y-1.5">
                    <label
                      htmlFor="custom"
                      className="text-gray-hint_text block"
                    >
                      Custom
                    </label>
                    <Input
                      placeholder="What would you like us to check or anaylse?"
                      className="h-8"
                    />
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
