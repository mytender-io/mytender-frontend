import React, { useContext, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Section, BidContext } from "@/views/BidWritingStateManagerView";
import { ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";

interface GenerateSectonButtonProps {
  section: Section;
}

const GenerateSectonButton: React.FC<GenerateSectonButtonProps> = ({
  section
}) => {
  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  const tokenRef = useRef(auth?.token || "default");
  const { sharedState, setSharedState } = useContext(BidContext);
  const [isLoading, setIsLoading] = useState(false);

  const onGenerate = async () => {
    if (!sharedState.object_id) {
      toast.error("No bid ID found");
      return;
    }
    if (!section) {
      toast.error("No section data available");
      return;
    }
    try {
      setIsLoading(true);
      toast.info("Generating section content...");
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/generate_section_answer`,
        {
          bid_id: sharedState.object_id,
          datasets: sharedState.selectedFolders || [],
          section: section
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      console.log("API Response:", response.data);

      if (response.data) {
        toast.success("Section generated successfully!");

        setSharedState((prevState) => {
          const updatedOutline = [...(prevState.outline || [])];
          const sectionIndex = updatedOutline.findIndex(
            (s) => s.section_id === section.section_id
          );

          console.log("SECTION INDEX");
          console.log(sectionIndex);

          if (sectionIndex !== -1) {
            updatedOutline[sectionIndex] = {
              ...updatedOutline[sectionIndex],
              answer: response.data // This should now correctly assign the answer text
            };
          }

          return {
            ...prevState,
            outline: updatedOutline
          };
        });
      }
    } catch (err: any) {
      console.error("Full error:", err.response?.data);
      toast.error("Failed to generate section");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      <Button
        onClick={onGenerate}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <ArrowRight className="h-4 w-4" />
            Generate Section
          </>
        )}
      </Button>
    </div>
  );
};

export default GenerateSectonButton;
