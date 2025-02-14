import React, { useMemo, useRef, useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import axios from "axios";
import { Section } from "@/views/BidWritingStateManagerView";
import { useAuthUser } from "react-auth-kit";
import { BidContext } from "@/views/BidWritingStateManagerView";

interface RegenerateButtonProps {
  section: Section;
  index: number;  // Add index prop to know which section to update
}

const RegenerateButton: React.FC<RegenerateButtonProps> = ({ section, index }) => {
  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  const tokenRef = useRef(auth?.token || "default");
  const [isLoading, setIsLoading] = useState(false);
  const { setSharedState } = useContext(BidContext);

  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("section", JSON.stringify(section));
      
      const response = await axios({
        method: "post",
        url: `http${HTTP_PREFIX}://${API_URL}/generate_writing_plans_for_section`,
        data: formData,
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
          "Content-Type": "multipart/form-data"
        }
      });

      const updatedSection = response.data;
      
      // Update the shared state with the new section data
      setSharedState(prevState => {
        const newOutline = [...prevState.outline];
        newOutline[index] = updatedSection;
        return {
          ...prevState,
          outline: newOutline
        };
      });

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
      } else {
        console.error("Error regenerating content:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      <button
        className="orange-button flex items-center"
        onClick={handleRegenerate}
        disabled={isLoading}
      >
        <FontAwesomeIcon icon={faWandMagicSparkles} className="me-2" />
        <span>{isLoading ? "Regenerating..." : "Regenerate"}</span>
      </button>
    </div>
  );
};

export default RegenerateButton;