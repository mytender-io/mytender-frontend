import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { displayAlert } from "../helper/Alert";
import "./NewTenderModal.css";
import UploadPDF from "../views/UploadPDF";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import { useAuthUser } from "react-auth-kit";
import { BidContext } from "../views/BidWritingStateManagerView";
import SelectTenderLibraryFile from "../components/SelectTenderLibraryFile";
import SelectFolder from "../components/SelectFolder";
import { Box, LinearProgress, Typography } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CustomDateInput from "../buttons/CustomDateInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCirclePlus } from "@fortawesome/free-solid-svg-icons";

interface NewTenderModalProps {
  show: boolean;
  onHide: () => void;
  existingBids: Array<{ bid_title: string }>;
}

type Step = "details" | "documents" | "content" | "questions";

const NewTenderModal: React.FC<NewTenderModalProps> = ({
  show,
  onHide,
  existingBids
}) => {
  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  const tokenRef = useRef(auth?.token || "default");

  const { sharedState, setSharedState } = useContext(BidContext);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [deadline, setDeadline] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [contractValue, setContractValue] = useState("");
  const [clientName, setClientName] = useState("");
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

  function LinearProgressWithLabel(props) {
    return (
      <Box
        sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}
      >
        <Box sx={{ width: "100%", mr: 1 }}>
          <LinearProgress
            variant="determinate"
            {...props}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "#ffd699",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#ff9900"
              }
            }}
          />
        </Box>
        <Box sx={{ minWidth: 35, mt: 1, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {`${Math.round(props.value)}%`}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            {props.message}
          </Typography>
        </Box>
      </Box>
    );
  }

  const startProgressBar = () => {
    const duration = 60000; // 1 minute in ms
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
        displayAlert("Please fill in all required fields", "danger");
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
        displayAlert("Please upload at least one document", "danger");
        return;
      }
      setCurrentStep("content");
    } else if (currentStep === "content") {
      if (!selectedFiles.length) {
        // Change this line
        displayAlert("Please select at least one question document", "danger");
        return;
      }
      setCurrentStep("questions");
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentStep === "questions" && !selectedFolders.length) {
      displayAlert("Please select at least one content folder", "danger");
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
      console.log(response.data);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSharedState((prevState) => ({
        ...prevState,
        outline: response.data
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
      displayAlert("No documents found in the tender library.", "warning");
    } else {
      displayAlert("Failed to generate outline", "danger");
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

  const renderStepContent = () => {
    switch (currentStep) {
      case "details":
        return (
          <div className="selectfolder-container mt-0 p-0">
            <div className="white-card p-4 ">
              <Form.Group className="mb-4">
                <Form.Label className="card-label">Tender Name:</Form.Label>
                <Form.Control
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter tender name"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="card-label">Deadline:</Form.Label>
                <CustomDateInput
                  value={deadline}
                  onChange={(value) => setDeadline(value)} // Direct value handling
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="card-label">Contract Value:</Form.Label>
                <Form.Control
                  type="text"
                  value={contractValue}
                  onChange={handleValueChange}
                  placeholder="Enter contract value"
                />
              </Form.Group>

              <div className="d-flex justify-content-end mt-4">
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="upload-button"
                >
                  Next Step →
                </Button>
              </div>
            </div>
          </div>
        );

      case "documents":
        return (
          <div className="white-card p-4">
            <UploadPDF
              bid_id={sharedState.object_id}
              apiUrl={`http${HTTP_PREFIX}://${API_URL}/uploadfile_tenderlibrary`}
              descriptionText="Documents uploaded to the Tender Library will be used as context by
                  our AI to generate compliance requirements and opportunity
                  information for the Tender."
              onUploadComplete={(uploadedFiles) => {
                // Instead of an immediate handleNextStep call, update documents
                // and use a useEffect to handle the transition
                setDocuments(uploadedFiles);
              }}
            />
          </div>
        );

      case "content":
        return (
          <div className="white-card p-4 ">
            <p className="description-text">
              Select the documents which contain the questions you need to
              answer in your bid. These will be used to generate the outline for
              your proposal.
            </p>
            <div className="selectfolder-container mt-0 p-0">
              <SelectTenderLibraryFile
                bid_id={sharedState.object_id}
                onFileSelect={handleFileSelection}
                initialSelectedFiles={selectedFiles}
                folderView={true}
              />
            </div>
            <div className="d-flex justify-content-end mt-4">
              <Button onClick={handleNextStep} className="upload-button">
                Next Step →
              </Button>
            </div>
          </div>
        );

      case "questions":
        return (
          <div>
            <div className="">
              <p>
                Select the folders below from your content library to use as
                context in your final proposal. The AI will be able to use
                information from these when generating an answer.
              </p>
            </div>

            <div className="selectfolder-container mt-3">
              <SelectFolder
                onFolderSelect={handleFolderSelection}
                initialSelectedFolders={selectedFolders}
              />
            </div>

            {isGeneratingOutline && (
              <div className="mt-4">
                <LinearProgressWithLabel
                  value={progress}
                  message={loadingMessage}
                />
              </div>
            )}

            <div className="d-flex justify-content-end mt-3">
              <Button
                type="submit"
                className="upload-button"
                disabled={isGeneratingOutline}
              >
                <FontAwesomeIcon icon={faFileCirclePlus} className="me-2" />
                Create Tender
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      dialogClassName="custom-modal-width"
      className="custom-modal-newbid"
    >
      <Modal.Body className="p-0">
        <div className="steps-container">
          <div className="step-wrapper">
            <div
              className={`step ${currentStep === "details" ? "active" : ""}`}
            >
              <div className="step-content">
                <span className="step-number">1</span>
                <span className="step-text">Tender Details</span>
              </div>
            </div>
            <div
              className={`step ${currentStep === "documents" ? "active" : ""}`}
            >
              <div className="step-content">
                <span className="step-number">2</span>
                <span className="step-text">Upload Documents</span>
              </div>
            </div>
            <div
              className={`step ${currentStep === "content" ? "active" : ""}`}
            >
              <div className="step-content">
                <span className="step-number">3</span>
                <span className="step-text">Select Questions</span>
              </div>
            </div>
            <div
              className={`step ${currentStep === "questions" ? "active" : ""}`}
            >
              <div className="step-content">
                <span className="step-number">4</span>
                <span className="step-text">Select Context</span>
              </div>
            </div>
          </div>
        </div>
        <div
          className="modal-content-wrapper px-5 py-5"
          style={{ backgroundColor: "#f5f5f5" }}
        >
          <h5 className="mb-3 new-bid-modal-header">
            {currentStep === "details"
              ? "Tender Details"
              : currentStep === "documents"
                ? "Upload Documents"
                : currentStep === "content"
                  ? "Select Question Document"
                  : "Select Context"}
          </h5>

          <Form onSubmit={handleFinalSubmit}>{renderStepContent()}</Form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default NewTenderModal;
