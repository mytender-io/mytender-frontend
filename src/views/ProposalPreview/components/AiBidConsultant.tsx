import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip";
import { Trash, X } from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { AiBidConsultantModal } from "./AiBidConsultantModal";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import { useAuthUser } from "react-auth-kit";
import axios from "axios";
import { BidContext } from "@/views/BidWritingStateManagerView";
import Lottie from "lottie-react";
import loadingAnimation from "@/lottie/loadingAnimation.json";

const LoadingState = () => (
  <div className="h-[600px] flex flex-col gap-4 items-center justify-center">
    <p>Loading...</p>
    <Lottie animationData={loadingAnimation} />
    <p>We’re just loading up our feedback...</p>
  </div>
);

interface AiBidConsultantProps {
  onOpenChange: (arg: boolean) => void;
  open: boolean;
}

const initial_criterias = [
  {
    key: "review_bid_overall_feedback",
    prompt: "ai_review_overall_feedback",
    question: "Overall Feedback",
    requirements: "Assess where you could improve given the scoring criteria"
  },
  {
    key: "review_bid_evidencing",
    prompt: "ai_review_evidencing",
    question: "Evidencing",
    requirements: "Find areas where you need to support your claims more"
  },
  {
    key: "review_bid_structure_and_flow",
    prompt: "ai_review_structure_and_flow",
    question: "Structure and Flow",
    requirements: "Help present the response in a logical way"
  },
  {
    key: "review_bid_clarity_and_persuasiveness",
    prompt: "ai_bid_review_clarity_and_persuasivness",
    question: "Clarity and Persuasiveness",
    requirements: "Make sure it is laid out in a convincying and clear way"
  }
];

export const AiBidConsultant = ({
  onOpenChange,
  open
}: AiBidConsultantProps) => {
  const [checkedCriterias, setCheckedCriterias] = useState<string[]>([]);
  const [criterias, setCriterias] =
    useState<typeof initial_criterias>(initial_criterias);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<unknown[]>([]);
  const { sharedState } = useContext(BidContext);
  const { outline } = sharedState;

  const getAuth = useAuthUser();
  const auth = getAuth();

  if (!open) return null;

  const handleCriteriaSelect = (criteriaKey: string) => {
    if (checkedCriterias.find((c) => c === criteriaKey)) {
      setCheckedCriterias((prev) => prev.filter((i) => i !== criteriaKey));
    } else {
      setCheckedCriterias((prev) => [...prev, criteriaKey]);
    }
  };

  const handleStartEvaluation = async () => {
    if (!checkedCriterias.length) {
      toast.error("Please select at least one criteria for evaluation");
      return;
    }

    setLoading(true);

    try {
      const results = await Promise.all(
        checkedCriterias.map(async (c) => {
          const formData = new FormData();
          formData.append("question", outline[0]?.question);
          formData.append("answer", outline[0]?.answer);
          formData.append("scoring_criteria", "ai_review_evidencing");

          const response = await axios.post(
            `http${HTTP_PREFIX}://${API_URL}/${c}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${auth?.token}`,
                "Content-Type": "application/json"
              }
            }
          );

          return response.data;
        })
      );

      setResults(results);
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during evaluation.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCriteria = (key: string) => {
    setCriterias((prev) => prev.filter((c) => c.key !== key));
  };

  return (
    <div className="flex flex-col w-full h-fit bg-white overflow-hidden border border-gray-line">
      <div className="p-3 border-b border-gray-100 flex justify-between items-center">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className="font-medium text-center w-full">
                Ai Bid Consultant
              </h3>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-center">
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

      {loading ? (
        <LoadingState />
      ) : (
        <div className="h-[600px]">
          <div className="mt-6 px-6">
            <p className="text-lg font-medium mb-2">
              Add question specific criteria for optimal feedback
            </p>
            <p className="text-sm text-gray-500">
              Get much more specific feedback based around the criteria
            </p>
            <AiBidConsultantModal setCriterias={setCriterias} />

            <div className="mt-8 pb-6">
              <p className="text-lg font-medium mb-2">
                Click on the checks you would like to run
              </p>

              <div className="flex flex-col gap-6">
                {criterias.map((criteria) => (
                  <div key={criteria.key} className="flex gap-3">
                    <Checkbox
                      checked={checkedCriterias.includes(criteria.key)}
                      onCheckedChange={() => handleCriteriaSelect(criteria.key)}
                      className="rounded"
                    />
                    <div className="flex flex-col w-full">
                      <p className="text-lg font-medium">{criteria.question}</p>
                      <p className="text-sm text-gray-400">
                        {criteria.requirements}
                      </p>
                    </div>

                    <Button
                      disabled={loading}
                      onClick={() => handleDeleteCriteria(criteria.key)}
                      variant="ghost"
                      className="hover:bg-transparent border-0 hover:text-orange"
                    >
                      <Trash />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 border-t py-6 px-6">
            <p className="text-lg">Click here to start the evaluation</p>

            <div className="flex items-center justify-center mt-3">
              <Button onClick={handleStartEvaluation}>Start Evaluation</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

