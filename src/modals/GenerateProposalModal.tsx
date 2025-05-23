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
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import posthog from "posthog-js";

interface GenerateProposalModalProps {
  bid_id: string;
  handleTabClick: (path: string) => void;
}

const GenerateProposalModal = ({
  bid_id,
  handleTabClick
}: GenerateProposalModalProps) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const { sharedState, setSharedState } = useContext(BidContext);
  const [currentStep, setCurrentStep] = useState(1);
  const tokenRef = useRef(auth?.token || "default");
  const [show, setShow] = useState(false);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [loadingMessage, setLoadingMessage] = useState(
    "Analysing the outline..."
  );

  const loadingMessages = [
    "Analysing the outline...",
    "Sifting through the writing plans...",
    "Thinking…",
    "Planning the best proposal structure...",
    "Analysing the inputs...",
    "Retrieving the relevant content from the content library...",
    "Considering win themes and the customer painpoints...",
    "Polishing the proposal language...",
    "Dotting i's and crossing t's...",
    "Ensuring compliance with tender requirements from compliance inputs...",
    "Adding the final improvements...",
    "Almost there! Just applying the finishing touches...",
    "Finalizing the proposal..."
  ];

  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  interface ProgressProps {
    value: number;
    message: string;
  }

  const LinearProgressWithLabel = ({ value, message }: ProgressProps) => {
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
    const interval = 1000; // Update every 100ms
    const steps = duration / interval;
    const increment = 98 / steps;

    let currentProgress = 0;
    let messageIndex = 0;

    // Calculate how often to change messages to ensure we get through all messages
    const messageInterval = Math.floor(duration / loadingMessages.length);

    const messageRotationInterval = setInterval(() => {
      if (messageIndex < loadingMessages.length - 1) {
        messageIndex++;
        setLoadingMessage(loadingMessages[messageIndex]);
      }
    }, messageInterval);

    progressInterval.current = setInterval(() => {
      currentProgress += increment;

      if (currentProgress >= 98) {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          clearInterval(messageRotationInterval);
        }
        if (!isGeneratingProposal) {
          setProgress(100);
          setLoadingMessage(loadingMessages[loadingMessages.length - 1]);
        } else {
          setProgress(98);
        }
      } else {
        setProgress(currentProgress);
      }
    }, interval);
  };

  const generateProposal = async () => {
    posthog.capture("generating_proposal_started", {
      bid_id,
      selected_folders: sharedState.selectedFolders
    });

    try {
      setIsGeneratingProposal(true);
      startProgressBar();
      console.log(sharedState.selectedFolders);

      const datasets = Array.isArray(sharedState.selectedFolders)
        ? sharedState.selectedFolders
        : ["default"];

      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/generate_proposal`,
        {
          bid_id: bid_id,
          datasets: datasets,
          outline: sharedState.outline || []
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      // Update shared state with outline data
      setSharedState((prevState) => ({
        ...prevState,
        outline: response.data?.updated_outline || []
      }));

      setProgress(100);
      setCurrentStep(2); // Move to success step

      posthog.capture("generating_proposal_succeeded", {
        bid_id,
        selected_folders: sharedState.selectedFolders,
        section_id: response.data.section_id
      });
    } catch (err) {
      console.error("Error generating proposal:", err);
      posthog.capture("generating_proposal_failed", {
        bid_id,
        selected_folders: sharedState.selectedFolders,
        error: err.message || "Failed to generate proposal"
      });
    } finally {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setIsGeneratingProposal(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      generateProposal();
    }
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="px-2 py-4">
          <div className="px-3">
            <p className="mb-4">
              The proposal will be generated as a Word document that you can
              then edit and format as needed. You can preview the document in
              the Preview Proposal tab. Make sure you download our{" "}
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
              icon={faCheckCircle as IconProp}
              size="3x"
              className="text-green-500 animate-bounce"
            />
          </div>
          <h4 className="text-3xl font-bold mb-6 animate-[slideIn_0.5s_ease-out] w-full">
            Fantastic. Your proposal is ready! 🚀
          </h4>
          <p className="text-xl text-gray-600 mb-6 animate-[fadeIn_0.5s_ease-out] w-full">
            Your proposal has been generated & is ready for editing. Time to
            review and make it shine! ✨
          </p>
          <Button
            className="animate-[slideUp_0.5s_ease-out]"
            onClick={() => {
              setShow(false);
              handleTabClick("/proposal-preview");
            }}
          >
            Preview Your Masterpiece
          </Button>
        </div>
      );
    }
  };

  useEffect(() => {
    if (currentStep === 2) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

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
                      <FontAwesomeIcon
                        icon={faSpinner as IconProp}
                        spin
                        className="mr-2"
                      />
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
