import React, { useState, useEffect, useRef, useContext } from "react";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import axios from "axios";
import { useAuthUser } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import {
  faCheckCircle,
  faRocket,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BidContext } from "../views/BidWritingStateManagerView";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import wordpaneImage from "../resources/images/wordpanescreenshot.png";
import Confetti from "react-confetti";
import FastIcon from "@/components/icons/FastIcon";

const GenerateProposalModal = ({ bid_id, outline }) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const navigate = useNavigate();
  const { sharedState, setSharedState } = useContext(BidContext);
  const [currentStep, setCurrentStep] = useState(1);
  const tokenRef = useRef(auth?.token || "default");
  const [show, setShow] = useState(false);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    if (currentStep === 2) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const [loadingMessage, setLoadingMessage] = useState(
    "Analyzing tender requirements..."
  );

  const loadingMessages = [
    "Analyzing tender requirements...",
    "Cross-checking with company library...",
    "Mining past successful proposals...",
    "Evaluating win themes...",
    "Calculating competitive advantages...",
    "Identifying key differentiators...",
    "Structuring executive summary...",
    "Crafting value propositions...",
    "Optimizing technical approach...",
    "Enhancing solution architecture...",
    "Polishing management strategy...",
    "Fine-tuning pricing strategy...",
    "Adding compelling case studies...",
    "Incorporating best practices...",
    "Validating compliance requirements...",
    "Optimizing proposal language...",
    "Adding winning elements...",
    "Performing quality checks...",
    "Enhancing visual elements...",
    "Reviewing risk mitigation strategies...",
    "Finalizing implementation approach...",
    "Double-checking all requirements...",
    "Polishing final draft...",
    "Downloading additional information...",
    "Resolving any remaining issues...",
    "Analyzing market positioning...",
    "Refining unique selling points...",
    "Strengthening past performance examples...",
    "Enhancing capability statements...",
    "Optimizing resource allocation plans...",
    "Validating delivery timelines...",
    "Incorporating sustainability measures...",
    "Detailing quality assurance processes...",
    "Enhancing innovation descriptions...",
    "Polishing methodology sections...",
    "Refining cost breakdowns...",
    "Adding social value elements...",
    "Strengthening local content details...",
    "Validating certification requirements...",
    "Enhancing team credentials...",
    "Optimizing project schedules..."
  ];

  const incompleteSections =
    outline?.filter((section) => section.status !== "Completed") || [];
  const hasIncompleteSections = incompleteSections.length > 0;

  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);

  const LinearProgressWithLabel = ({ value, message }) => {
    return (
      <div className="flex flex-col items-center w-full">
        <div className="w-full">
          <Progress value={value} className="h-2.5" />
        </div>
        <div className="mt-2 text-center">
          <p className="text-sm text-muted-foreground">{`${Math.round(value)}%`}</p>
          <p className="text-sm text-muted-foreground italic">{message}</p>
        </div>
      </div>
    );
  };

  const startProgressBar = () => {
    const duration = 180000; // 3:00 minutes in ms
    const interval = 100; // Update every 100ms
    const steps = duration / interval;
    const increment = 98 / steps;

    let currentProgress = 0;
    let messageIndex = 0;

    const messageRotationInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 1000); // Changed from 3000 to 1000 to rotate every second

    progressInterval.current = setInterval(() => {
      currentProgress += increment;

      if (currentProgress >= 98) {
        clearInterval(progressInterval.current);
        clearInterval(messageRotationInterval);
        if (!isGeneratingProposal) {
          setProgress(100);
          setLoadingMessage(
            "Post processing final document.... Document will be downloaded shortly..."
          );
        } else {
          setProgress(98);
        }
      } else {
        setProgress(currentProgress);
      }
    }, interval);
  };

  const generateProposal = async () => {
    try {
      setIsGeneratingProposal(true);
      startProgressBar();
      console.log(sharedState.selectedFolders);

      const datasets = Array.isArray(sharedState.selectedFolders)
        ? sharedState.selectedFolders
        : ["default"];

      console.log("Using datasets:", datasets);

      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/generate_proposal`,
        {
          bid_id: bid_id,
          datasets: datasets
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          },
          responseType: "blob"
        }
      );

      const blob = new Blob([response.data], { type: "application/msword" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download =
        response.headers["content-disposition"]?.split("filename=")[1] ||
        "proposal.docx";
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      setProgress(100);
      fetchOutline(bid_id, tokenRef, setSharedState);
      setIsGenerationComplete(true); // Set completion state
      setCurrentStep(2); // Move to success step
    } catch (err) {
      console.error("Error generating proposal:", err);
    } finally {
      clearInterval(progressInterval.current);
      setIsGeneratingProposal(false);
    }
  };

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setCurrentStep(1);
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      generateProposal();
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      handleClose();
    }
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="px-2 py-4">
          <div className="px-3">
            <p className="mb-4">
              This is where the magic happens! The proposal will be generated as
              a Word document that you can then edit and format as needed. You
              can preview the document in the Preview Proposal tab. Make sure
              you download our{" "}
              <a
                href="https://appsource.microsoft.com/en-us/product/office/WA200007690"
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                wordpane
              </a>{" "}
              so that you can easily refine your answers.
            </p>
            <img
              src={wordpaneImage}
              alt="Wordpane Preview"
              className="w-full max-h-[350px] object-cover object-top rounded-lg shadow-md"
            />
            {isGeneratingProposal && (
              <div className="mt-4">
                <LinearProgressWithLabel
                  value={progress}
                  message={loadingMessage}
                />
              </div>
            )}
          </div>
        </div>
      );
    } else if (currentStep === 2) {
      return (
        <div className="px-4 py-5 text-center bg-gradient-to-br from-white to-gray-50 rounded-xl relative overflow-hidden">
          {showConfetti && (
            <Confetti
              width={windowDimensions.width}
              height={windowDimensions.height}
              recycle={false}
              numberOfPieces={200}
              gravity={0.3}
            />
          )}
          <div className="mb-4 mt-4 animate-[scaleIn_0.5s_ease-out]">
            <FontAwesomeIcon
              icon={faCheckCircle}
              size="3x"
              className="text-green-500 animate-bounce"
            />
          </div>
          <h4 className="text-3xl font-bold mb-6 animate-[slideIn_0.5s_ease-out]">
            Fantastic. Your proposal is ready! 🚀
          </h4>
          <p className="text-xl text-gray-600 mb-6 animate-[fadeIn_0.5s_ease-out]">
            Your proposal has been generated & is ready for editing. Time to
            review and make it shine! ✨
          </p>
          <Button
            className="animate-[slideUp_0.5s_ease-out]"
            onClick={() => {
              setShow(false);
              navigate(`/proposal-preview`);
            }}
          >
            Preview Your Masterpiece
          </Button>
        </div>
      );
    }
  };

  return (
    <>
      <Button variant="default" onClick={() => setShow(true)}>
        <FastIcon />
        Generate Proposal
      </Button>

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="max-w-5xl">
          {currentStep === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle>Generate Proposal</DialogTitle>
              </DialogHeader>
              {renderStepContent()}
              <div className="flex justify-end">
                <Button onClick={handleNext} disabled={isGeneratingProposal}>
                  {isGeneratingProposal ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Generate Proposal"
                  )}
                </Button>
              </div>
            </>
          ) : (
            renderStepContent()
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GenerateProposalModal;
