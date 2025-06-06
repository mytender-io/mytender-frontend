import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useRef, useState } from "react";
import { API_URL, HTTP_PREFIX } from "../../../helper/Constants";
import axios from "axios";
import { useAuthUser } from "react-auth-kit";
import SelectFolder from "@/components/SelectFolder";
import { BidContext } from "../../BidWritingStateManagerView";
import SelectTenderLibraryFile from "@/components/SelectTenderLibraryFile";
import { Check, Edit, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-toastify";
import posthog from "posthog-js";
import { useGeneratingOutline } from "@/context/GeneratingOutlineContext";

interface OutlineInstructionsModalProps {
  show: boolean;
  onHide: () => void;
  bid_id: string;
}

const OutlineInstructionsModal = ({
  show,
  onHide,
  bid_id
}: OutlineInstructionsModalProps) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
  const { sharedState, setSharedState } = useContext(BidContext);

  const {
    state: { currentStep = 1, isGeneratingOutline, progress, loadingMessage },
    setCurrentStep,
    setIsGeneratingOutline,
    setProgress,
    setLoadingMessage,
    resetState
  } = useGeneratingOutline();

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState(
    sharedState.selectedFolders || []
  );

  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const loadingMessages = [
    "Looking at the tender docs...",
    "Scanning tender requirements and specifications...",
    "Identifying key evaluation criteria...",
    "Searching for questions...",
    "Analyzing submission requirements...",
    "Extracting mandatory compliance items...",
    "Reviewing technical specifications...",
    "Mapping response requirements...",
    "Extracting information...",
    "Identifying section dependencies...",
    "Analyzing scoring weightings...",
    "Cross-referencing tender appendices...",
    "Generating tender summary...",
    "Summarizing key tender requirements...",
    "Identifying evaluation criteria weightings...",
    "Analyzing customer pain points...",
    "Understanding buyer's objectives...",
    "Extracting customer challenges...",
    "Identifying decision-making factors...",
    "Discovering win themes...",
    "Analyzing competitive landscape...",
    "Finding differentiation opportunities...",
    "Identifying unique value propositions...",
    "Mapping customer needs to solutions...",
    "Analyzing historical win patterns...",
    "Extracting compliance requirements...",
    "Building evaluation criteria matrix...",
    "Identifying critical success factors...",
    "Analyzing stakeholder priorities...",
    "Extracting budget constraints...",
    "Understanding project timelines...",
    "Identifying risk factors...",
    "Analyzing technical requirements depth...",
    "Planning outline...",
    "Structuring response sections...",
    "Organizing compliance matrix...",
    "Aligning with evaluation criteria...",
    "Building section hierarchy...",
    "Analyzing word limits and page counts...",
    "Incorporating win themes...",
    "Optimizing section flow...",
    "Integrating customer pain points...",
    "Positioning differentiators...",
    "Finalizing outline structure...",
    "Generating outline... Please wait a little bit longer..."
  ];

  interface ProgressWithLabelProps {
    value: number;
    message: string;
  }

  function ProgressWithLabel({ value, message }: ProgressWithLabelProps) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-full">
          <Progress value={value} className="h-2.5" />
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">{`${Math.round(value)}%`}</p>
          <p className="text-sm text-gray-600 italic">{message}</p>
        </div>
      </div>
    );
  }

  const startProgressBar = () => {
    const duration = 300000; // 5 minutes in ms
    const interval = 100;
    const steps = duration / interval;
    const increment = 98 / steps;

    let currentProgress = 0;
    let messageIndex = 0;

    const messageRotationInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 6500); // Adjusted to rotate through all messages during 5 minutes

    progressInterval.current = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 98) {
        clearInterval(progressInterval.current!);
        clearInterval(messageRotationInterval);
        if (!isGeneratingOutline) {
          setProgress(100);
          setLoadingMessage("Finalizing outline structure...");
        } else {
          setProgress(98);
        }
      } else {
        setProgress(currentProgress);
      }
    }, interval);
  };

  const handleFileSelection = (files: string[]) => {
    console.log("Files selected in SelectTenderLibraryFile component:", files);
    setSelectedFiles(files);
  };

  const handleFolderSelection = (folders: string[]) => {
    setSelectedFolders(folders);
    setSharedState((prevState) => ({
      ...prevState,
      selectedFolders: folders
    }));
    console.log(folders);
  };

  const resetModalState = () => {
    setSelectedFiles([]);
    resetState(); // This resets the generation state from context
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const generateOutline = async () => {
    if (isGeneratingOutline) return;

    setIsGeneratingOutline(true);
    startProgressBar();

    posthog.capture("generating_outline_started", {
      bid_id,
      selected_folders: sharedState.selectedFolders,
      selected_files: selectedFiles
    });

    const datasets = Array.isArray(sharedState.selectedFolders)
      ? sharedState.selectedFolders
      : [];

    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/generate_outline`,
        {
          bid_id: bid_id,
          extra_instructions: "",
          datasets: datasets,
          file_names: selectedFiles
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          },
          timeout: 2000000 // longer timeout
        }
      );

      console.log(response.data);
      setCurrentStep(4);
      setProgress(100);
      setLoadingMessage("Outline generated successfully!");

      posthog.capture("generating_outline_succeeded", {
        bid_id,
        section_id: response.data.section_id,
        selected_folders: sharedState.selectedFolders,
        selected_files: selectedFiles
      });

      setSharedState((prevState) => ({
        ...prevState,
        outline: response.data?.outline || [],
        tender_summary: response.data?.tender_summary || "",
        evaluation_criteria: response.data?.evaluation_criteria || "",
        derive_insights: response.data?.derive_insights || "",
        differentiation_opportunities:
          response.data?.differentiation_opportunities || "",
        customer_pain_points: response.data?.customer_pain_points || [],
        win_themes: response.data?.win_themes || [],
        differentiating_factors: response.data?.differentiating_factors || [],
        isSaved: false
      }));
    } catch (err) {
      posthog.capture("generating_outline_failed", {
        bid_id,
        selected_folders: sharedState.selectedFolders,
        selected_files: selectedFiles,
        error: err instanceof Error ? err.message : "Failed to generate outline"
      });

      console.error(err);

      // Clear the progress intervals
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }

      const isTimeoutError =
        err instanceof Error &&
        (("code" in err && err.code === "ECONNABORTED") ||
          err.message?.includes("timeout"));

      const isNotFoundError =
        err instanceof Error &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status === 404;

      if (isTimeoutError) {
        toast.error(
          "Request timed out. The outline generation is taking longer than expected."
        );
      } else if (isNotFoundError) {
        toast.warning("No documents found in the tender library.");
      } else {
        toast.error("Failed to generate outline");
      }

      // Reset generation state but keep the user on step 3
      setIsGeneratingOutline(false);
      setProgress(0);
      setLoadingMessage("Analysing tender documents...");
    } finally {
      setIsGeneratingOutline(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (selectedFiles.length === 0) {
        toast.warning("Please select at least one document");
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      generateOutline();
    } else if (currentStep === 4) {
      resetModalState();
      onHide();
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onCancel();
    }
  };

  const getButtonLabel = () => {
    switch (currentStep) {
      case 1:
        return "Next";
      case 2:
        return "Continue";
      case 3:
        return isGeneratingOutline ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
            Generating...
          </>
        ) : (
          "Generate"
        );
      case 4:
        return "Finish";
      default:
        return "Next";
    }
  };

  const onCancel = () => {
    onHide();
  };

  const getHeaderTitle = () => {
    if (currentStep === 1) {
      return "Instructions";
    }
    return `Step ${currentStep - 1} of 3`;
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="px-4 py-2">
          <div className="mb-4 space-y-8">
            {/* Step 1 */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange text-white text-2xl font-bold shadow-sm">
                  1
                </div>
              </div>
              <div>
                <h6 className="text-lg font-bold">
                  Select Tender Questions Document
                </h6>
                <p className="text-base text-gray-500">
                  First, select the tender question document as the outline will
                  extract the questions from here
                  <Upload className="inline-block ml-2" size={16} />
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange text-white text-2xl font-bold shadow-sm">
                  2
                </div>
              </div>
              <div>
                <h6 className="text-lg font-bold">
                  Select Company Library Docs
                </h6>
                <p className="text-base text-gray-500">
                  Select previous bids from your company library to use as
                  context.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange text-white text-2xl font-bold shadow-sm">
                  3
                </div>
              </div>
              <div>
                <h6 className="text-lg font-bold">Generate Outline</h6>
                <p className="text-base text-gray-500">
                  Click the button below to automatically generate your proposal
                  outline based on the tender questions.
                  <Edit className="inline-block ml-2" size={16} />
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (currentStep === 2) {
      return (
        <div className="px-4 py-2">
          <p className="text-gray-700 mb-4">
            Select the documents which contain the questions you need to answer
            in your bid. These will be used to generate the outline for your
            proposal.
          </p>
          <div className="mt-0 px-2">
            <SelectTenderLibraryFile
              bid_id={bid_id}
              onFileSelect={handleFileSelection}
              initialSelectedFiles={selectedFiles}
            />
          </div>
          <div className="mt-4 p-4 rounded-lg bg-orange-ultra_light text-orange">
            <span className="font-semibold">Note:</span> Please verify your
            selections before proceeding. The outline will be generated based on
            the selected documents.
          </div>
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="px-4 py-2">
          <p className="text-gray-700 mb-4">
            Select the folders below from your content library to use as context
            in your final proposal. The AI will be able to use information from
            these when generating an answer.
          </p>
          <div className="mt-3 p-0">
            <SelectFolder
              onFolderSelect={handleFolderSelection}
              initialSelectedFolders={selectedFolders}
            />
          </div>
          {isGeneratingOutline && (
            <div className="mt-4">
              <ProgressWithLabel value={progress} message={loadingMessage} />
            </div>
          )}
        </div>
      );
    }

    if (currentStep === 4) {
      return (
        <div className="px-4">
          <div className="flex items-center mb-3">
            <h4 className="text-xl font-bold">
              Outline Generated Successfully
            </h4>
            <Check className="ml-2 text-green-500 w-6 h-6" />
          </div>
          <p className="text-gray-500 mb-6">
            Your outline has been created based on your tender question
            documents.
          </p>

          <div>
            <h5 className="text-gray-600 text-xl font-bold mb-4">
              Next Steps:
            </h5>
            <ol className="space-y-4 list-decimal list-inside">
              <li>
                <div className="font-semibold inline text-xl">
                  Review Questions
                </div>
                <p className="text-gray-500 mt-2 ml-6">
                  Check that all questions extracted match your tender
                  questions. You can edit these in the sidepane by clicking on a
                  section or add new sections by right clicking on a row in the
                  table.
                </p>
              </li>
              <li>
                <div className="font-semibold inline text-xl">
                  Start Writing
                </div>
                <p className="text-gray-500 mt-2 ml-6">
                  If you want to add more detail to a section, click on the
                  section to show the sidepane. This will let you add talking
                  points you want the AI to cover in the final proposal for that
                  section.
                </p>
              </li>
              <li>
                <div className="font-semibold inline text-xl">
                  Create Proposal
                </div>
                <p className="text-gray-500 mt-2 ml-6">
                  Click the Create Proposal button to generate a proposal. Once
                  your proposal has been generated you can go to the Preview
                  Proposal tab to download it as a word document.
                </p>
              </li>
            </ol>
          </div>
        </div>
      );
    }
  };

  return (
    <Dialog open={show} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{getHeaderTitle()}</DialogTitle>
        </DialogHeader>
        {renderStepContent()}
        <DialogFooter>
          <Button variant="outline" onClick={handleBack}>
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 2 && selectedFiles.length === 0) ||
              isGeneratingOutline
            }
          >
            {getButtonLabel()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OutlineInstructionsModal;
