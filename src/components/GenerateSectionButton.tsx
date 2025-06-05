import React, { useContext, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Section, BidContext } from "@/views/BidWritingStateManagerView";
import { ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import { useGeneration } from "@/context/GeneratingSectionContext";

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
  const { isGenerating, generatingSectionId, setGenerating } = useGeneration();

  // Check if this specific section is generating
  const isThisSectionGenerating =
    isGenerating && generatingSectionId === section.section_id;

  // Check if this section already has content generated
  const isAlreadyGenerated = Boolean(section.answer && section.answer.trim());

  const handleClick = () => {
    // If any section is generating (including this one), show simple toast
    if (isGenerating) {
      toast.warning(
        "Please wait until the section you clicked has finished generating"
      );
      return;
    }

    // Otherwise proceed with generation
    onGenerate();
  };

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
      setGenerating(true, section.section_id);
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
              answer: response.data,
              status: "In Progress"
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
      setGenerating(false);
    }
  };

  return (
    <div className="flex items-center">
      <Button onClick={handleClick} className="flex items-center gap-2">
        {isThisSectionGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <ArrowRight className="h-4 w-4" />
            {isAlreadyGenerated ? "Re-generate Section" : "Generate Section"}
          </>
        )}
      </Button>
    </div>
  );
};

export default GenerateSectonButton;
