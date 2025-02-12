import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { Modal, Form } from "react-bootstrap";
import UploadPDF from "../../../components/upload/UploadPDF";
import { API_URL, HTTP_PREFIX } from "../../../helper/Constants";
import { useAuthUser } from "react-auth-kit";
import { BidContext } from "../../BidWritingStateManagerView";
import SelectTenderLibraryFile from "../../../components/SelectTenderLibraryFile";
import SelectFolder from "../../../components/SelectFolder";
// import { Box, LinearProgress, Typography } from "@mui/material";
import axios from "axios";
import CustomDateInput from "../../../buttons/CustomDateInput";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle
} from "@/components/ui/dialog";
import { cn } from "@/utils";
interface NewTenderModalProps {
  show: boolean;
  onHide: () => void;
  existingBids: Array<{ bid_title: string }>;
}

type Step = "details" | "documents" | "content" | "questions";

// Replace the FinalDialog component with this new version
const LoadingOverlay = ({
  isOpen,
  progress,
  loadingMessage
}: {
  isOpen: boolean;
  progress: number;
  loadingMessage: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 p-0 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-bg border-[0.5px] border-gray-line p-3">
        <h2 className="text-base font-semibold">Thank you for completing</h2>
      </div>
      <div className="p-3">
        <span className="font-semibold">Setting up your bid:</span>
        <span className="block mt-3 mb-10">{loadingMessage}</span>
        <div className="flex items-center gap-2">
          <Progress value={progress} />
          <p className="text-sm">{`${Math.round(progress)}%`}</p>
        </div>
      </div>
    </div>
  );
};

const NewTenderModal: React.FC<NewTenderModalProps> = ({
  show,
  onHide,
  existingBids
}) => {
  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  const tokenRef = useRef(auth?.token || "default");

  const { sharedState, setSharedState } = useContext(BidContext);
  const [isGeneratingOutline, setIsGeneratingOutline] =
    useState<boolean>(false);
  const [bidName, setBidName] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [contractValue, setContractValue] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [currentStep, setCurrentStep] = useState<Step>("details");

  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(
    "Analyzing tender documents..."
  );
  const progressInterval = useRef(null);

  // Add new state for confirmation dialog
  const [showConfirmClose, setShowConfirmClose] = useState(false);

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

  useEffect(() => {
    // When documents state changes and there are documents
    if (currentStep === "documents" && documents.length > 0) {
      handleNextStep();
    }
  }, [documents]); // Add other dependencies if needed

  const loadingMessages = [
    "Looking at the tender docs...",
    "Searching for questions...",
    "Extracting information...",
    "Planning outline...",
    "Generating outline... Please wait a little bit longer..."
  ];

  // function LinearProgressWithLabel(props) {
  //   return (
  //     <Box
  //       sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}
  //     >
  //       <Box sx={{ width: "100%", mr: 1 }}>
  //         <LinearProgress
  //           variant="determinate"
  //           {...props}
  //           sx={{
  //             height: 10,
  //             borderRadius: 5,
  //             backgroundColor: "#ffd699",
  //             "& .MuiLinearProgress-bar": {
  //               backgroundColor: "#ff9900"
  //             }
  //           }}
  //         />
  //       </Box>
  //       <Box sx={{ minWidth: 35, mt: 1, textAlign: "center" }}>
  //         <Typography variant="body2" color="text.secondary">
  //           {`${Math.round(props.value)}%`}
  //         </Typography>
  //         <Typography
  //           variant="body2"
  //           color="text.secondary"
  //           sx={{ fontStyle: "italic" }}
  //         >
  //           {props.message}
  //         </Typography>
  //       </Box>
  //     </Box>
  //   );
  // }

  const startProgressBar = () => {
    const duration = 68000; // 1 minute in ms
    const interval = 100;
    const steps = duration / interval;
    const increment = 98 / steps;

    let currentProgress = 0;
    let messageIndex = 0;

    const messageRotationInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 1000);

    progressInterval.current = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 98) {
        clearInterval(progressInterval.current);
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

  const isDetailsStepValid = () => {
    return clientName && contractValue;
  };

  const isDocumentsStepValid = () => {
    return documents.length > 0;
  };

  const handleNextStep = () => {
    if (currentStep === "details") {
      if (!isDetailsStepValid()) {
        toast.error("Please fill in all required fields");
        return;
      }
      setSharedState((prevState) => ({
        ...prevState,
        bidInfo: clientName,
        value: contractValue,
        submission_deadline: deadline,
        original_creator: auth.email,
        contributors: auth.email ? { [auth.email]: "admin" } : {},
        lastUpdated: Date.now()
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
      toast.error("Please select at least one content folder");
      return;
    }
    try {
      setIsGeneratingOutline(true);
      startProgressBar();
      console.log(selectedFiles);

      // Capture the response from the API call
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/generate_outline`,
        {
          bid_id: sharedState.object_id,
          extra_instructions: "",
          datasets: sharedState.selectedFolders,
          file_names: selectedFiles
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      console.log("outline final submit");
      console.log(response.data.outline);
      console.log(response.data.tender_summary);
      console.log(response.data.evaluation_criteria);
      console.log(response.data.pain_points);
      console.log(response.data.differentiation_opportunities);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSharedState((prevState) => ({
        ...prevState,
        outline: response.data?.outline || [],
        tender_summary: response.data?.tender_summary || "",
        evaluation_criteria: response.data?.evaluation_criteria || "",
        derive_insights: response.data?.pain_points || "",
        differentiation_opportunities:
          response.data?.differentiation_opportunities || "",
        customer_pain_points: response.data?.relevant_pain_points || [],
        win_themes: response.data?.relevant_win_themes || [],
        differentiating_factors:
          response.data?.relevant_differentiation_opportunities || []
      }));

      navigate("/bid-extractor");

      resetForm();
      onHide();
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
        contributors: auth?.email ? { [auth?.email]: "admin" } : {},
        lastUpdated: Date.now()
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
  const handleConfirmedClose = () => {
    setShowConfirmClose(false);
    resetForm();
    onHide();
  };

  // const renderStepContent = () => {
  //   switch (currentStep) {
  //     case "details":
  //       return (
  //         <div className="selectfolder-container mt-0 p-0">
  //           <div className="white-card p-4 ">
  //             <Form.Group className="mb-4">
  //               <Form.Label className="card-label">Tender Name:</Form.Label>
  //               <Form.Control
  //                 type="text"
  //                 value={clientName}
  //                 onChange={(e) => setClientName(e.target.value)}
  //                 placeholder="Enter tender name"
  //               />
  //             </Form.Group>

  //             <Form.Group className="mb-4">
  //               <Form.Label className="card-label">Deadline:</Form.Label>
  //               <CustomDateInput
  //                 value={deadline}
  //                 onChange={(value) => setDeadline(value)} // Direct value handling
  //                 defaultValue={new Date().toISOString().split("T")[0]}
  //               />
  //             </Form.Group>

  //             <Form.Group className="mb-4">
  //               <Form.Label className="card-label">Contract Value:</Form.Label>
  //               <Form.Control
  //                 type="text"
  //                 value={contractValue}
  //                 onChange={handleValueChange}
  //                 placeholder="Enter contract value"
  //               />
  //             </Form.Group>
  //           </div>
  //         </div>
  //       );

  //     case "documents":
  //       return (
  //         <div className="white-card p-4">
  //           <UploadPDF
  //             bid_id={sharedState.object_id}
  //             apiUrl={`http${HTTP_PREFIX}://${API_URL}/uploadfile_tenderlibrary`}
  //             descriptionText="Documents uploaded to the Tender Library will be used as context by
  //                 our AI to generate compliance requirements and opportunity
  //                 information for the Tender."
  //             onUploadComplete={(uploadedFiles) => {
  //               // Instead of an immediate handleNextStep call, update documents
  //               // and use a useEffect to handle the transition
  //               setDocuments(uploadedFiles);
  //             }}
  //           />
  //         </div>
  //       );

  //     case "content":
  //       return (
  //         <div className="white-card p-4 ">
  //           <p className="description-text">
  //             Select the documents which contain the questions you need to
  //             answer in your bid. These will be used to generate the outline for
  //             your proposal.
  //           </p>
  //           <div className="selectfolder-container mt-0 p-0">
  //             <SelectTenderLibraryFile
  //               bid_id={sharedState.object_id}
  //               onFileSelect={handleFileSelection}
  //               initialSelectedFiles={selectedFiles}
  //               folderView={true}
  //             />
  //           </div>
  //         </div>
  //       );

  //     case "questions":
  //       return (
  //         <div>
  //           <div className="">
  //             <p>
  //               Select the folders below from your content library to use as
  //               context in your final proposal. The AI will be able to use
  //               information from these when generating an answer.
  //             </p>
  //           </div>

  //           <div className="selectfolder-container mt-3">
  //             <SelectFolder
  //               onFolderSelect={handleFolderSelection}
  //               initialSelectedFolders={selectedFolders}
  //             />
  //           </div>

  //           {isGeneratingOutline && (
  //             <div className="mt-4">
  //               <Progress
  //                 value={progress}
  //                 className="h-2.5 rounded-full bg-[#ffd699]"
  //               />
  //               <div className="mt-1 text-center">
  //                 <p className="text-gray-600">{`${Math.round(progress)}%`}</p>
  //                 <p className="text-gray-600 italic">{loadingMessage}</p>
  //               </div>
  //             </div>
  //           )}
  //         </div>
  //       );
  //   }
  // };

  return (
    <>
      <Dialog open={show && !isGeneratingOutline} onOpenChange={handleClose}>
        <DialogContent className="w-full max-w-5xl overflow-hidden p-0 bg-gray-light">
          <DialogTitle className="sr-only">Create New Tender</DialogTitle>
          <div className="bg-white border-b border-gray-200">
            <div className="flex items-stretch w-full h-[60px] overflow-x-auto">
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
                  <span className="text-lg font-bold whitespace-nowrap">
                    Tender Details
                  </span>
                </div>
                <div className="absolute top-1/2 -right-3 w-11 h-[42px] bg-white transform -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-gray-200 z-[2]" />
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
                  <span className="text-lg font-bold whitespace-nowrap">
                    Upload Documents
                  </span>
                </div>
                <div className="absolute top-1/2 -right-3 w-11 h-[42px] bg-white transform -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-gray-200 z-[2]" />
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
                  <span className="text-lg font-bold whitespace-nowrap">
                    Select Questions
                  </span>
                </div>
                <div className="absolute top-1/2 -right-3 w-11 h-[42px] bg-white transform -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-gray-200 z-[2]" />
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
                  <span className="text-lg font-bold whitespace-nowrap">
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
                        Tender Name:
                      </Label>
                      <Input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Enter tender name"
                      />
                    </div>

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
                      <Input
                        type="text"
                        value={contractValue}
                        onChange={handleValueChange}
                        placeholder="Enter contract value"
                      />
                    </div>
                  </div>
                )}

                {currentStep === "documents" && (
                  <UploadPDF
                    bid_id={sharedState.object_id}
                    apiUrl={`http${HTTP_PREFIX}://${API_URL}/uploadfile_tenderlibrary`}
                    onUploadComplete={(uploadedFiles) => {
                      setDocuments(uploadedFiles);
                    }}
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
                onClick={handleClose}
              >
                Exit
              </Button>
              {currentStep === "questions" ? (
                <Button type="submit" disabled={isGeneratingOutline}>
                  {isGeneratingOutline ? "Creating..." : "Create Tender"}
                </Button>
              ) : (
                <Button type="button" onClick={handleNextStep}>
                  Next Step →
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Confirmation Dialog */}
      <Dialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Are you sure you want to exit?</DialogTitle>
          <div className="py-4">
            <p>All progress will be lost. This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowConfirmClose(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmedClose}
            >
              Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LoadingOverlay
        isOpen={isGeneratingOutline}
        progress={progress}
        loadingMessage={loadingMessage}
      />
    </>
  );
};

export default NewTenderModal;
