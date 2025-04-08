import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip";
import { Trash, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { AiBidConsultantModal } from "./AiBidConsultantModal";

interface AiBidConsultantProps {
  onOpenChange: (arg: boolean) => void;
  open: boolean;
}

const initial_criterias = [
  {
    key: "overall_feedback",
    question: "Overall Feedback",
    requirements: "Assess where you could improve given the scoring criteria"
  },
  {
    key: "evidencing",
    question: "Evidencing",
    requirements: "Find areas where you need to support your claims more"
  },
  {
    key: "grammar",
    question: "Grammar",
    requirements: "Fix spelling and grammar errors"
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

  if (!open) return null;

  const handleCriteriaSelect = (criteriaKey: string) => {
    if (checkedCriterias.find((c) => c === criteriaKey)) {
      setCheckedCriterias((prev) => prev.filter((i) => i !== criteriaKey));
    } else {
      setCheckedCriterias((prev) => [...prev, criteriaKey]);
    }
  };

  const handleStartEvaluation = () => {
    if (!checkedCriterias.length) {
      toast.error("Plesae select at least one criteria for evaluation");
      return;
    }

    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleDeleteCriteria = (key: string) => {
    setCriterias((prev) => prev.filter((c) => c.key !== key));
  };

  return (
    <div className="flex flex-col w-full h-fit bg-white overflow-hidden border border-gray-line">
      <div className="p-3 border-b border-gray-100 flex justify-between items-center">
        {/* <Button variant="outline" size="sm" className="absolute">
          View Checks
        </Button> */}

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
        {loading ? (
          <div className="flex justify-start items-center h-full text-2xl tracking-wider leading-none font-semibold">
            <span className="animate-[blink_1.4s_infinite] text-black">.</span>
            <span className="animate-[blink_1.4s_infinite_0.2s] text-black">
              .
            </span>
            <span className="animate-[blink_1.4s_infinite_0.4s] text-black">
              .
            </span>
          </div>
        ) : (
          <p className="text-lg">Click here to start the evaluation</p>
        )}
        <div className="flex items-center justify-center mt-3">
          <Button onClick={handleStartEvaluation}>Start Evaluation</Button>
        </div>
      </div>
    </div>
  );
};

