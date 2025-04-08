import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

interface AiBidConsultantProps {
  onOpenChange: (arg: boolean) => void;
  open: boolean;
}

const check_options = [
  {
    check: "overall_feedback",
    title: "Overall Feedback",
    desc: "Assess where you could improve given the scoring criteria"
  },
  {
    check: "evidencing",
    title: "Evidencing",
    desc: "Find areas where you need to support your claims more"
  },
  {
    check: "grammar",
    title: "Grammar",
    desc: "Fix spelling and grammar errors"
  }
];

export const AiBidConsultant = ({
  onOpenChange,
  open
}: AiBidConsultantProps) => {
  const [checks, setChecks] = useState<string[]>([]);
  const [customCriteriaList, setCustomCriteriaList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleCriteriaSelect = (check: string) => {
    if (checks.includes(check)) {
      setChecks((prev) => prev.filter((i) => i !== check));
    } else {
      setChecks((prev) => [...prev, check]);
    }
  };

  const handleAddCustomCriteria = () => {
    const newCheckKey = `custom_${customCriteriaList.length + 1}`;
    setCustomCriteriaList((prev) => [...prev, newCheckKey]);
    setChecks((prev) => [...prev, newCheckKey]);
  };

  const handleCustomInputChange = (index: number, value: string) => {
    const newList = [...customCriteriaList];
    newList[index] = value;
    setCustomCriteriaList(newList);
  };

  const handleStartEvaluation = () => {
    if (!checks.length && !customCriteriaList.length) {
      toast.error("Plesae select at least one criteria for evaluation");
      return;
    }

    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
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
        <Button
          variant="outline"
          className="text-orange border-orange mt-4 hover:bg-orange-100 hover:text-orange-600"
          onClick={handleAddCustomCriteria}
        >
          Add Criteria
        </Button>

        <div className="mt-8 pb-6">
          <p className="text-lg font-medium mb-2">
            Click on the checks you would like to run
          </p>

          <div className="flex flex-col gap-6">
            {check_options.map((option) => (
              <div key={option.check} className="flex gap-3">
                <Checkbox
                  checked={checks.includes(option.check)}
                  onCheckedChange={() => handleCriteriaSelect(option.check)}
                  className="rounded"
                />
                <div className="flex flex-col w-full">
                  <p className="text-lg font-medium">{option.title}</p>
                  <p className="text-sm text-gray-400">{option.desc}</p>
                </div>
              </div>
            ))}

            {customCriteriaList.map((checkKey, idx) => (
              <div key={checkKey} className="flex gap-3">
                <Checkbox
                  checked={checks.includes(checkKey)}
                  onCheckedChange={() => handleCriteriaSelect(checkKey)}
                  className="rounded"
                />
                <div className="flex flex-col w-full">
                  <p className="text-lg font-medium">Custom Criteria</p>
                  <Input
                    className="placeholder:text-gray-400"
                    placeholder="What would you like us to check or analyze?"
                    value={customCriteriaList[idx]}
                    onChange={(e) =>
                      handleCustomInputChange(idx, e.target.value)
                    }
                  />
                </div>
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

