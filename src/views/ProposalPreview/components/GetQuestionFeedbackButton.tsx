import { Button } from "@/components/ui/button";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import axios from "axios";
import { toast } from "react-toastify";
import { useContext } from "react";
import { BidContext } from "@/views/BidWritingStateManagerView";

const GetFeedbackButton = ({ section, tokenRef }) => {
  const { setSharedState } = useContext(BidContext);

  const handleGetSectionFeedback = async () => {
    try {
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
        // Update the shared state with the new section
        setSharedState((prevState) => {
          const newOutline = [...prevState.outline];
          
          // Find the index of the section that was updated
          const sectionIndex = newOutline.findIndex(
            (s) => s.section_id === section.section_id
          );
          
          if (sectionIndex !== -1) {
            // Replace the old section with the updated one
            newOutline[sectionIndex] = response.data.updated_section;
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
    }
  };
  
  return <Button onClick={handleGetSectionFeedback}>Get AI Feedback</Button>;
};

export default GetFeedbackButton;