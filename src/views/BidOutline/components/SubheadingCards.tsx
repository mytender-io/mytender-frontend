import * as React from "react";
import { useCallback, useState, useRef, useContext, useMemo } from "react";
import { useAuthUser } from "react-auth-kit";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import DebouncedTextArea from "./DeboucedTextArea";
import { Plus, PlusIcon, Trash } from "lucide-react";
import RegeneratePopover from "@/buttons/RegeneratePopover";
import RegenerateButton from "./RegenerateButton";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { BidContext } from "@/views/BidWritingStateManagerView";

const SubheadingCards = ({
  section,
  index,
  handleSectionChange,
  handleDeleteSubheading
}) => {
  const [openPopoverIndex, setOpenPopoverIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  const tokenRef = useRef(auth?.token || "default");
  const { setSharedState } = useContext(BidContext);

  const [isExpanded, setIsExpanded] = useState(false);
  const [numSubheadings, setNumSubheadings] = useState("3");
  const [instructions, setInstructions] = useState("");

  const formatAsBullets = useCallback((text) => {
    if (!text) return "";
    return text
      .split(";")
      .map((item) => item.trim())
      .join("\n• ");
  }, []);

  const convertFromBullets = useCallback((text) => {
    if (!text) return "";
    return text.split("\n• ").join(";").replace(/^• /, "");
  }, []);

  const handleAddSubheading = useCallback(() => {
    const newSubheadings = [
      ...section.subheadings,
      {
        title: "",
        extra_instructions: ""
      }
    ];
    handleSectionChange(index, "subheadings", newSubheadings);
  }, [section.subheadings, index, handleSectionChange]);

  const handleTitleChange = useCallback(
    (subIndex, value) => {
      const newSubheadings = [...section.subheadings];
      newSubheadings[subIndex] = {
        ...newSubheadings[subIndex],
        title: value
      };
      handleSectionChange(index, "subheadings", newSubheadings);
    },
    [section.subheadings, index, handleSectionChange]
  );

  const handleInstructionsChange = useCallback(
    (subIndex, value) => {
      const newSubheadings = [...section.subheadings];
      newSubheadings[subIndex] = {
        ...newSubheadings[subIndex],
        extra_instructions: convertFromBullets(value)
      };
      handleSectionChange(index, "subheadings", newSubheadings);
    },
    [section.subheadings, index, handleSectionChange, convertFromBullets]
  );

  const handleRegenerateSubheading = async (e, subIndex, instructions) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("section", JSON.stringify(section));
      formData.append("user_instructions", instructions); // Changed from regenerate_instructions
      formData.append("index", subIndex.toString()); // Changed from subheading_index

      const response = await axios({
        method: "post",
        url: `http${HTTP_PREFIX}://${API_URL}/regenerate_single_subheading`,
        data: formData,
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
          "Content-Type": "multipart/form-data"
        }
      });

      // The endpoint returns the entire updated section
      const updatedSection = response.data;

      // Update the entire section in the parent component
      setSharedState((prevState) => {
        const newOutline = [...prevState.outline];
        newOutline[index] = updatedSection;
        return {
          ...prevState,
          outline: newOutline
        };
      });

      setOpenPopoverIndex(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
      } else {
        console.error("Error regenerating subheading:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleRegenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("section", JSON.stringify(section));
      //formData.append("regenerate_instructions", instructions);
      //formData.append("num_subheadings", numSubheadings);

      const response = await axios({
        method: "post",
        url: `http${HTTP_PREFIX}://${API_URL}/regenerate_writingplans_and_subheadings`,
        data: formData,
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
          "Content-Type": "multipart/form-data"
        }
      });

      const updatedSection = response.data;
      setSharedState((prevState) => {
        const newOutline = [...prevState.outline];
        newOutline[index] = updatedSection;
        return {
          ...prevState,
          outline: newOutline
        };
      });

      setIsExpanded(false);
      setInstructions("");
      setNumSubheadings("3");
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

  const handlePopoverChange = (open, subIndex) => {
    console.log("Popover state changing:", { open, subIndex });
    setOpenPopoverIndex(open ? subIndex : null);
  };

  return (
    <div className="sidepane-section">
      <div className="proposal-header mb-4">
        <div>Writing Plan</div>
        <div className="flex items-center">
          <button
            className="bg-white rounded-lg p-2 me-2 shadow-sm hover:bg-gray-50 transition-colors"
            onClick={handleAddSubheading}
          >
            <PlusIcon className="w-6 h-6" />
          </button>
          <RegenerateButton
            section={section}
            index={index}
            onRegenerate={handleRegenerate}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {section.subheadings.map((subheading, subIndex) => (
          <div key={subIndex} className="bg-white rounded-lg shadow-md">
            <div className="p-2 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <DebouncedTextArea
                    value={subheading.title}
                    onChange={(value) => handleTitleChange(subIndex, value)}
                    className="w-full bg-transparent resize-none focus:outline-none"
                    style={{
                      minHeight: "24px",
                      padding: "2px",
                      lineHeight: "20px"
                    }}
                    placeholder="Write the name of the subtopic..."
                    rows={1}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDeleteSubheading(index, subIndex)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
                    title="Delete subheading"
                  >
                    <Trash className="h-6 w-6" />
                  </button>

                  <RegeneratePopover
                    subIndex={subIndex}
                    isOpen={openPopoverIndex === subIndex}
                    onOpenChange={handlePopoverChange}
                    onRegenerateSubheading={handleRegenerateSubheading}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="p-3">
              <DebouncedTextArea
                value={
                  subheading.extra_instructions
                    ? `• ${formatAsBullets(subheading.extra_instructions)}`
                    : ""
                }
                onChange={(value) => handleInstructionsChange(subIndex, value)}
                className="w-full bg-transparent focus:outline-none text-gray-600 overflow-y-auto"
                placeholder="Please write any extra guidance..."
                rows={4}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(SubheadingCards);
