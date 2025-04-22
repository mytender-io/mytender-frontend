import { Button } from "@/components/ui/button";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import axios from "axios";
import { toast } from "react-toastify";
import { useContext, useState } from "react";
import { BidContext } from "@/views/BidWritingStateManagerView";
import { Spinner } from "@/components/ui/spinner";

const GetFeedbackButton = ({ section, tokenRef, sectionIndex }) => {
  const { setSharedState } = useContext(BidContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetSectionFeedback = async () => {
    try {
      setIsLoading(true);
      toast.info("Getting feedback...");
      const formData = new FormData();
      // Convert the section object to a JSON string
      formData.append("section", JSON.stringify(section));
      formData.append(
        "scoring_criteria",
        section.relevant_evaluation_criteria || ""
      );

      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/review_bid_overall_feedback`,
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
    <Button onClick={handleGetSectionFeedback} disabled={isLoading}>
      {isLoading ? (
        <>
          <Spinner color="text-white" className="h-4 w-4" />
          Getting Feedback...
        </>
      ) : (
        "Get AI Feedback"
      )}
    </Button>
  );
};

export default GetFeedbackButton;
