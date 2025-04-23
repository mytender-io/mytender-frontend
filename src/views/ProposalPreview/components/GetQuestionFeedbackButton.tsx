import { Button } from "@/components/ui/button";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import axios from "axios";
import { toast } from "react-toastify";
import { useContext } from "react";
import { BidContext } from "@/views/BidWritingStateManagerView";
import { Spinner } from "@/components/ui/spinner";
import { Section } from "@/views/BidWritingStateManagerView";

interface GetFeedbackButtonProps {
  section: Section;
  tokenRef: React.RefObject<string>;
  sectionIndex?: number;
  prompts: string[];
  scoringCriteria: string;
  resetScoringCriteria: () => void;
  onLoadingChange?: (loading: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const GetFeedbackButton = ({
  section,
  tokenRef,
  sectionIndex,
  prompts = [],
  scoringCriteria = "",
  resetScoringCriteria,
  isLoading,
  setIsLoading
}: GetFeedbackButtonProps) => {
  const { setSharedState } = useContext(BidContext);

  const handleGetSectionFeedback = async () => {
    try {
      // Don't proceed if no prompts are selected
      if (prompts.length === 0) {
        toast.warning("Please select at least one feedback option");
        return;
      }

      setIsLoading(true);
      toast.info("Getting feedback...");
      const formData = new FormData();

      // Convert the section object to a JSON string
      formData.append("section", JSON.stringify(section));
      formData.append("scoring_criteria", scoringCriteria || "");

      // Use the prompts passed as a parameter
      prompts.forEach((prompt) => {
        formData.append("promptlist", prompt);
      });

      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/review_bid`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      // Check if the response contains the updated section
      if (response.data && response.data.updated_section) {
        console.log(response.data.updated_section);
        // Update the shared state with the new section
        setSharedState((prevState) => {
          const newOutline = [...prevState.outline];
          // Use the sectionIndex parameter directly if provided
          if (sectionIndex !== undefined) {
            newOutline[sectionIndex] = response.data.updated_section;
          } else {
            // Fallback to finding by ID
            const idx = newOutline.findIndex(
              (s) => s.section_id === section.section_id
            );
            if (idx !== -1) {
              newOutline[idx] = response.data.updated_section;
            }
          }
          return {
            ...prevState,
            outline: newOutline
          };
        });
        toast.success("Feedback retrieved and applied successfully");
        resetScoringCriteria();
      } else {
        toast.success("Feedback retrieved successfully");
      }
    } catch (error) {
      console.error("Error getting feedback:", error);
      toast.error("Failed to get feedback");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGetSectionFeedback}
      disabled={isLoading || prompts.length === 0}
    >
      {isLoading ? (
        <>
          <Spinner color="text-white" className="h-4 w-4" />
          Evaluating...
        </>
      ) : (
        "Start Evaluation"
      )}
    </Button>
  );
};

export default GetFeedbackButton;
