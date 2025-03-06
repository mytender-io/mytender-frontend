import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import axios from "axios";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import { Spinner } from "@/components/ui/spinner";

const CreateToneOfVoiceDialog = ({ onClose, onAddTone }) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [responses, setResponses] = useState(["", "", ""]);
  const [generatedTone, setGeneratedTone] = useState("");
  const [editedTone, setEditedTone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const totalStages = 3;

  // Get auth token
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  // Reset state when the component mounts
  useEffect(() => {
    setCurrentStage(1);
    setResponses(["", "", ""]);
    setGeneratedTone("");
    setEditedTone("");
    setError("");
  }, []);

  // Stage content
  const stages = [
    {
      title: "Create a tone of voice that resonates!",
      description:
        "We've asked a professional bid writer to come up with 3 questions to get you thinking",
      question:
        "Who is our target customer, what challenges are they facing, and what language or phrases have resonated with them in the past?",
      hint: "This question ensures you understand your audience and leverage proven messaging."
    },
    {
      title: "Create a tone of voice that resonates!",
      description:
        "We've asked a professional bid writer to come up with 3 questions to get you thinking",
      question:
        "How do we want our brand to be perceived—whether as a trusted advisor, innovative partner, or another role?",
      hint: "Defining your brand's desired image helps tailor the overall bid tone."
    },
    {
      title: "Create a tone of voice that resonates!",
      description:
        "We've asked a professional bid writer to come up with 3 questions to get you thinking",
      question:
        "What tone of voice (e.g., confident, approachable, authoritative) best reflects our company's values and the message we wish to convey?",
      hint: "This creates consistency across all customer touchpoints."
    }
  ];

  const handleResponseChange = (value) => {
    const updatedResponses = [...responses];
    updatedResponses[currentStage - 1] = value;
    setResponses(updatedResponses);
  };

  const generateToneOfVoice = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Filter out any empty responses (from skipped questions)
      const filteredResponses = responses.filter(
        (response) => response.trim() !== ""
      );

      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/llm_generate_tone_of_voice`,
        filteredResponses, // Send the array directly, not wrapped in an object
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      if (response.data.error) {
        setError(response.data.error);
        toast.error("Failed to generate tone of voice: " + response.data.error);
      } else {
        setGeneratedTone(response.data);
        setEditedTone(response.data);
        setCurrentStage(4); // Move to tone editing stage
        toast.success("Tone of voice generated successfully!");
      }
    } catch (err) {
      console.error("Error generating tone of voice:", err);
      setError("Failed to generate tone of voice. Please try again.");
      toast.error("Failed to generate tone of voice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addToneToLibrary = async (tone) => {
    if (!tone || tone.trim() === "") {
      setError("Tone cannot be empty");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/add_tone`,
        [tone.trim()], // Send the tone as an array for API consistency
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      if (response.data.error) {
        setError(response.data.error);
        toast.error("Failed to add tone: " + response.data.error);
        return false;
      } else {
        toast.success("Tone added to library successfully!");
        onAddTone(tone.trim()); // Notify parent component
        return true;
      }
    } catch (err) {
      console.error("Error adding tone:", err);
      setError("Failed to add tone to library. Please try again.");
      toast.error("Failed to add tone to library. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStage < totalStages) {
      setCurrentStage(currentStage + 1);
    } else if (currentStage === totalStages) {
      // Final question stage complete - generate tone of voice
      generateToneOfVoice();
    } else {
      // Editing stage complete - add the tone to library
      addToneToLibrary(editedTone);
    }
  };

  const handleSkip = () => {
    if (currentStage < totalStages) {
      setCurrentStage(currentStage + 1);
    }
  };

  // Render the content based on the current stage
  const renderContent = () => {
    // If we're in the editing stage (stage 4)
    if (currentStage > totalStages) {
      return (
        <>
          <CardHeader>
            <div className="flex items-center justify-center mb-6">
              {Array.from({ length: totalStages }).map((_, index) => (
                <React.Fragment key={index}>
                  <div className="rounded-full w-8 h-8 flex items-center justify-center bg-orange-500 text-white">
                    {index + 1}
                  </div>
                  {index < totalStages - 1 && (
                    <div className="h-px bg-gray-300 flex-grow mx-2" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <CardTitle className="text-xl font-bold">
              Review your tone of voice
            </CardTitle>
            <p className="text-gray-600 mt-2">
              We've generated a tone of voice based on your answers. Feel free
              to edit it before adding to your library.
            </p>
          </CardHeader>

          <CardContent>
            <Textarea
              placeholder="Your tone of voice"
              className="w-full h-32 mt-4"
              value={editedTone}
              onChange={(e) => setEditedTone(e.target.value)}
            />
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setCurrentStage(totalStages)}
            >
              Back
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleNext}
            >
              Add to Library
            </Button>
          </CardFooter>
        </>
      );
    }

    // If we're in the loading state
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner className="w-8 h-8 mb-4" />
          <p className="text-gray-600">Generating your tone of voice...</p>
        </div>
      );
    }

    // Regular question stages (1-3)
    return (
      <>
        <CardHeader>
          <div className="flex items-center justify-center mb-6">
            {Array.from({ length: totalStages }).map((_, index) => (
              <React.Fragment key={index}>
                <div
                  className={`rounded-full w-8 h-8 flex items-center justify-center ${
                    index + 1 === currentStage
                      ? "bg-orange-500 text-white"
                      : index + 1 < currentStage
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                {index < totalStages - 1 && (
                  <div className="h-px bg-gray-300 flex-grow mx-2" />
                )}
              </React.Fragment>
            ))}
          </div>
          <CardTitle className="text-xl font-bold">
            {stages[currentStage - 1].title}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {stages[currentStage - 1].description}
          </p>
        </CardHeader>

        <CardContent>
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <p className="font-medium text-gray-700">
              {stages[currentStage - 1].question}
            </p>
          </div>
          <Textarea
            placeholder={stages[currentStage - 1].hint}
            className="w-full h-32 mt-4"
            value={responses[currentStage - 1]}
            onChange={(e) => handleResponseChange(e.target.value)}
          />
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() =>
              currentStage > 1 ? setCurrentStage(currentStage - 1) : onClose()
            }
            disabled={currentStage === 1}
          >
            Back
          </Button>
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleNext}
            >
              {currentStage < totalStages ? "Next Step" : "Generate Tone"}
            </Button>
          </div>
        </CardFooter>
      </>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="p-3 max-w-3xl">
        <Card className="w-full border-0 shadow-none">{renderContent()}</Card>
      </DialogContent>
    </Dialog>
  );
};

export default CreateToneOfVoiceDialog;
