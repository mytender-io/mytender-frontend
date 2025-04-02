import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadPDF from "@/components/UploadPDF";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import { useAuthUser } from "react-auth-kit";
import { BidContext } from "../../BidWritingStateManagerView";
import SelectTenderLibraryFile from "@/components/SelectTenderLibraryFile";
import SelectFolder from "@/components/SelectFolder";
// import { Box, LinearProgress, Typography } from "@mui/material";
import axios from "axios";
import CustomDateInput from "../../../buttons/CustomDateInput";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle
} from "@/components/ui/dialog";
import { cn } from "@/utils";
import { DeleteConfirmationDialog } from "@/modals/DeleteConfirmationModal";

interface NewTenderModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  existingBids: Array<{ bid_title: string }>;
  fetchBids: () => void;
  isGeneratingOutline: boolean;
  setIsGeneratingOutline: (isGenerating: boolean) => void;
  setProgress: (progress: number) => void;
  setLoadingMessage: (message: string) => void;
}

type Step = "details" | "documents" | "content" | "questions";

const NewTenderModal: React.FC<NewTenderModalProps> = ({
  show,
  onHide,
  onSuccess,
  existingBids,
  fetchBids,
  isGeneratingOutline,
  setIsGeneratingOutline,
  setProgress,
  setLoadingMessage
}) => {
  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  const tokenRef = useRef(auth?.token || "default");

  const { sharedState, setSharedState } = useContext(BidContext);
  const [deadline, setDeadline] = useState<string>("");
  const [contractValue, setContractValue] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [currentStep, setCurrentStep] = useState<Step>("details");

  const navigate = useNavigate();

  const progressInterval = useRef(null);

  // Add new state for confirmation dialog
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // Add new state for error message
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [isUploadingDocuments, setIsUploadingDocuments] =
    useState<boolean>(false);

  const initialModalState = {
    bidInfo: "",
    opportunity_information: "",
    compliance_requirements: "",
    tender_summary: "",
    evaluation_criteria: "",
    derive_insights: "",
    differentiation_opportunities: "",
    questions: "",
    value: "",
    client_name: "",
    bid_qualification_result: "",
    opportunity_owner: "",
    submission_deadline: "",
    bid_manager: "",
    contributors: {},
    original_creator: "",
    isSaved: false,
    isLoading: false,
    saveSuccess: null,
    object_id: null,
    selectedFolders: ["default"],
    outline: [],
    win_themes: [],
    customer_pain_points: [],
    differentiating_factors: []
  };

  const loadingMessages = [
    "Looking at the tender docs...",
    "Searching for questions...",
    "Extracting information...",
    "Generating outline... Please wait a little bit longer..."
  ];

  const startProgressBar = () => {
    const duration = 68000; // 1 minute in ms
    const interval = 100;
    const steps = duration / interval;
    const increment = 98 / steps;

    let currentProgress = 0;
    let lastMessageIndex = -1;

    progressInterval.current = setInterval(() => {
      currentProgress += increment;

      // Update message at 25% intervals
      const messageIndex = Math.floor(currentProgress / 25);
      if (
        messageIndex !== lastMessageIndex &&
        messageIndex < loadingMessages.length
      ) {
        lastMessageIndex = messageIndex;
        setLoadingMessage(loadingMessages[messageIndex]);
      }

      if (currentProgress >= 98) {
        clearInterval(progressInterval.current);
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

  const handleFileSelection = (files) => {
    setSelectedFiles(files);
  };

  const handleFolderSelection = (folders) => {
    console.log("Folders selected in SelectFolder component:", folders);
    setSelectedFolders(folders);
    setSharedState((prevState) => ({
      ...prevState,
      selectedFolders: folders
    }));
  };

  const isDocumentsStepValid = () => {
    return documents.length > 0;
  };

  const handlePrevStep = () => {
    if (currentStep === "documents") {
      setCurrentStep("details");
    } else if (currentStep === "content") {
      setCurrentStep("documents");
    } else if (currentStep === "questions") {
      setCurrentStep("content");
    }
  };

  const handleNextStep = () => {
    if (currentStep === "details") {
      if (!clientName) {
        setErrorMessage("Tender name cannot be empty.");
        return;
      }
      setErrorMessage(""); // Clear error message if validation passes
      setSharedState((prevState) => ({
        ...prevState,
        bidInfo: clientName,
        value: contractValue,
        submission_deadline: deadline,
        original_creator: auth.email,
        contributors: auth.email ? { [auth.email]: "admin" } : {},
        new_bid_completed: false
      }));
      setCurrentStep("documents");
    } else if (currentStep === "documents") {
      if (!isDocumentsStepValid()) {
        toast.error("Please upload at least one document");
        return;
      }
      setCurrentStep("content");
    } else if (currentStep === "content") {
      if (!selectedFiles.length) {
        toast.error("Please select at least one question document");
        return;
      }
      setCurrentStep("questions");
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentStep === "questions" && !selectedFolders.length) {
      // toast.error("Please select at least one content folder");
      return;
    }

    try {
      setIsGeneratingOutline(true);
      startProgressBar();
      console.log(selectedFiles);

      // Start the outline generation API call (don't await it yet)
      const outlinePromise = axios.post(
        `http${HTTP_PREFIX}://${API_URL}/generate_outline`,
        {
          bid_id: sharedState.object_id,
          extra_instructions: "",
          datasets: sharedState.selectedFolders,
          file_names: selectedFiles,
          newbid: true
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      // Wait for 6 seconds - during this time the bid should be created
      // while the outline is still generating
      await new Promise((resolve) => setTimeout(resolve, 6000));

      // Fetch the bids to update the list now that the bid should be created
      await fetchBids();
      console.log("Bids refreshed while outline is still generating");

      // Now await the outline response
      const response = await outlinePromise;

      console.log("outline final submit");
      console.log(response.data.outline);
      console.log(response.data.tender_summary);
      console.log(response.data.evaluation_criteria);
      console.log(response.data.pain_points);
      console.log(response.data.differentiation_opportunities);
      console.log(response.data?.newbid_completed);

      // Navigate after updating shared state
      navigate("/bids");
      resetForm();
      onSuccess();
    } catch (err) {
      console.error("Full error:", err.response?.data);
      handleError(err);
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  useEffect(() => {
    if (show) {
      // Clear localStorage
      localStorage.clear();

      // Reset all modal-specific state
      setDeadline(new Date().toISOString().split("T")[0]);
      setContractValue("");
      setClientName("");
      setDocuments([]);
      setSelectedQuestions([]);
      setSelectedFiles([]);
      setSelectedFolders([]);
      setCurrentStep("details");

      // Reset shared state to initial values while preserving user info
      setSharedState({
        ...initialModalState,
        original_creator: auth?.email || "",
        contributors: auth?.email ? { [auth?.email]: "admin" } : {}
      });
    }
  }, [show, auth?.email, setSharedState]);

  // Separate form reset logic
  const resetForm = () => {
    setDeadline("");
    setContractValue("");
    setClientName("");
    setDocuments([]);
    setSelectedQuestions([]);
    setSelectedFolders([]);
    setCurrentStep("details");
  };

  // Handle API errors
  const handleError = (err) => {
    if (err.response?.status === 404) {
      toast.error("No documents found in the tender library.");
    } else {
      toast.error("Failed to generate outline");
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d.,]/g, "");
    value = value.replace(/,/g, "");
    const parts = value.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    value = parts.join(".");

    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;

    setContractValue(value);
  };

  // Modify the close handler
  const handleClose = () => {
    // If we're on the first step or no changes made, close directly
    if (
      currentStep === "details" &&
      !clientName &&
      !contractValue &&
      !deadline
    ) {
      onHide();
    } else {
      // Otherwise show confirmation
      setShowConfirmClose(true);
    }
  };

  // Handle confirmed close
  // Handle confirmed close with bid deletion
  const handleConfirmedClose = async () => {
    try {
      // Only attempt to delete if we have an object_id (bid has been created)
      if (sharedState.object_id) {
        const formData = new FormData();
        formData.append("bid_id", sharedState.object_id);

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

        // Log success or handle response if needed
        console.log("Bid deleted successfully:", response.data);

        // Refresh the bids list to reflect the deletion
        fetchBids();
      }
    } catch (error) {
      // Handle any errors
      console.error("Error deleting bid:", error);
      toast.error("Failed to delete the bid. Please try again.");
    } finally {
      // Close the modal and reset form regardless of success/failure
      setShowConfirmClose(false);
      resetForm();
      onHide();
    }
  };

  return (
    <>
      <Dialog open={show && !isGeneratingOutline} onOpenChange={handleClose}>
        <DialogContent className="w-full max-w-5xl overflow-hidden p-0 bg-gray-light">
          <DialogTitle className="sr-only">Create New Tender</DialogTitle>
          <div className="bg-white border-b border-gray-200">
            <div className="flex items-stretch w-full h-12 overflow-x-auto">
              {/* Details Step */}
              <div
                className={cn(
                  "relative flex items-center px-8 bg-white flex-1 min-w-[180px] max-w-[250px]",
                  currentStep === "details" ? "text-orange" : "text-gray"
                )}
              >
                <div className="relative z-[3] flex items-center gap-2 w-full">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full border flex items-center justify-center text-sm font-medium flex-shrink-0",
                      currentStep === "details"
                        ? "border-orange text-orange"
                        : "border-gray"
                    )}
                  >
                    1
                  </span>
                  <span className="text-base font-bold whitespace-nowrap">
                    Tender Details
                  </span>
                </div>
                <div className="absolute top-1/2 -right-3 w-8 h-8 bg-white transform -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-gray-200 z-[2]" />
                <div className="absolute top-0 right-0 bottom-0 w-5 bg-white z-[1]" />
              </div>

              {/* Documents Step */}
              <div
                className={cn(
                  "relative flex items-center px-8 bg-white flex-1 min-w-[180px] max-w-[250px]",
                  currentStep === "documents" ? "text-orange" : "text-gray"
                )}
              >
                <div className="relative z-[3] flex items-center gap-2 w-full">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full border flex items-center justify-center text-sm font-medium flex-shrink-0",
                      currentStep === "documents"
                        ? "border-orange text-orange"
                        : "border-gray"
                    )}
                  >
                    2
                  </span>
                  <span className="text-base font-bold whitespace-nowrap">
                    Upload Documents
                  </span>
                </div>
                <div className="absolute top-1/2 -right-3 w-8 h-8 bg-white transform -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-gray-200 z-[2]" />
                <div className="absolute top-0 right-0 bottom-0 w-5 bg-white z-[1]" />
              </div>

              {/* Content Step */}
              <div
                className={cn(
                  "relative flex items-center px-8 bg-white flex-1 min-w-[180px] max-w-[250px]",
                  currentStep === "content" ? "text-orange" : "text-gray"
                )}
              >
                <div className="relative z-[3] flex items-center gap-2 w-full">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full border flex items-center justify-center text-sm font-medium flex-shrink-0",
                      currentStep === "content"
                        ? "border-orange text-orange"
                        : "border-gray"
                    )}
                  >
                    3
                  </span>
                  <span className="text-base font-bold whitespace-nowrap">
                    Select Questions
                  </span>
                </div>
                <div className="absolute top-1/2 -right-3 w-8 h-8 bg-white transform -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-gray-200 z-[2]" />
                <div className="absolute top-0 right-0 bottom-0 w-5 bg-white z-[1]" />
              </div>

              {/* Questions Step */}
              <div
                className={cn(
                  "relative flex items-center px-8 bg-white flex-1 min-w-[180px] max-w-[250px]",
                  currentStep === "questions" ? "text-orange" : "text-gray"
                )}
              >
                <div className="relative z-[3] flex items-center gap-2 w-full">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full border flex items-center justify-center text-sm font-medium flex-shrink-0",
                      currentStep === "questions"
                        ? "border-orange text-orange"
                        : "border-gray"
                    )}
                  >
                    4
                  </span>
                  <span className="text-base font-bold whitespace-nowrap">
                    Select Context
                  </span>
                </div>
              </div>
            </div>
          </div>
          <form onSubmit={handleFinalSubmit}>
            <div className="px-8 space-y-2">
              {!isGeneratingOutline ? (
                <div className="space-y-2">
                  <h5 className="text-2xl font-bold">
                    {currentStep === "details"
                      ? "Tender Details"
                      : currentStep === "documents"
                        ? "Upload Documents"
                        : currentStep === "content"
                          ? "Select Questions"
                          : "Select Context"}
                  </h5>
                  <span className="text-sm">
                    {currentStep === "details"
                      ? "Please fill in details of the following:"
                      : currentStep === "documents"
                        ? "Upload the tender documentation so we can extract all the key information and your outline"
                        : currentStep === "content"
                          ? "Select the document which contains the questions to help generate the outline :)"
                          : " Select the folders below from your content library to use as context in your final proposal. The AI will be able to use information from these when generating an answer."}
                  </span>
                </div>
              ) : null}
              <>
                {currentStep === "details" && (
                  <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="font-bold text-nowrap min-w-40">
                        Tender Name: *
                      </Label>
                      <Input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Enter tender name"
                      />
                    </div>
                    {errorMessage && (
                      <p className="text-red-500 text-sm ml-[10.5rem]">
                        {errorMessage}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Label className="font-bold text-nowrap min-w-40">
                        Deadline:
                      </Label>
                      <CustomDateInput
                        value={deadline}
                        onChange={(value) => setDeadline(value)}
                        defaultValue={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="font-bold text-nowrap min-w-40">
                        Contract Value:
                      </Label>
                      <div className="relative w-full">
                        <Input
                          type="text"
                          value={contractValue}
                          onChange={handleValueChange}
                          placeholder="Enter contract value"
                          className="pl-6"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-hint_text">
                          £
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === "documents" && (
                  <UploadPDF
                    bid_id={sharedState.object_id}
                    apiUrl={`http${HTTP_PREFIX}://${API_URL}/uploadfile_tenderlibrary`}
                    onUploadComplete={(uploadedFiles) => {
                      setDocuments([...documents, ...uploadedFiles]);
                    }}
                    uploadedDocuments={documents}
                    isUploadingDocuments={isUploadingDocuments}
                    setUploadingDocuments={setIsUploadingDocuments}
                  />
                )}

                {currentStep === "content" && (
                  <SelectTenderLibraryFile
                    bid_id={sharedState.object_id || ""}
                    onFileSelect={handleFileSelection}
                    initialSelectedFiles={selectedFiles}
                  />
                )}

                {currentStep === "questions" && (
                  <div>
                    <SelectFolder
                      onFolderSelect={handleFolderSelection}
                      initialSelectedFolders={selectedFolders}
                    />
                  </div>
                )}
              </>
            </div>
            <DialogFooter className="sm:justify-between px-4 py-4">
              <Button
                type="button"
                variant="secondary"
                className="text-sm py-4"
                disabled={currentStep === "details"}
                onClick={handlePrevStep}
              >
                Back
              </Button>
              {currentStep === "questions" ? (
                <Button type="submit" disabled={isGeneratingOutline}>
                  {isGeneratingOutline ? "Creating..." : "Create Tender"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isUploadingDocuments}
                >
                  {isUploadingDocuments ? "Uploading..." : "Next Step →"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showConfirmClose}
        onClose={() => setShowConfirmClose(false)}
        onConfirm={handleConfirmedClose}
        title="Are you sure you want to exit?"
        message="All progress will be lost. This action cannot be undone."
        confirmTitle="Exit"
      />
    </>
  );
};

export default NewTenderModal;
