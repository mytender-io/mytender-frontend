// SubheadingCards.tsx
import * as React from "react";
import { useCallback, useState, useRef, useContext, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useAuthUser } from "react-auth-kit";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import { BidContext } from "@/views/BidWritingStateManagerView";
import DebouncedTextArea from "./DeboucedTextArea";
import RegenerateButton from "@/buttons/RegenerateButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const SubheadingCards = ({
  section,
  index,
  handleSectionChange,
  handleDeleteSubheading
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [numSubheadings, setNumSubheadings] = useState("3");
  const [instructions, setInstructions] = useState("");

  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  const tokenRef = useRef(auth?.token || "default");
  const { setSharedState } = useContext(BidContext);

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

  const handleRegenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("section", JSON.stringify(section));
      formData.append("regenerate_instructions", instructions);
      formData.append("num_subheadings", numSubheadings);

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

  return (
    <div className="sidepane-section">
      <div className="proposal-header mb-4">
        <div>Writing Plan</div>
        <div className="flex items-center">
          <button
            className="bg-white rounded-lg p-2 me-2 shadow-sm hover:bg-gray-50 transition-colors"
            onClick={handleAddSubheading}
          >
            <FontAwesomeIcon icon={faPlus} className="text-gray-500 h-5 w-7" />
          </button>
          <RegenerateButton
            section={section}
            index={index}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />
        </div>
      </div>

      {isExpanded && (
        <form
          onSubmit={handleRegenerate}
          className="mb-4 bg-white rounded-lg p-4 shadow-sm space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="numSubheadings" className="text-lg">
              Number of Subheadings
            </Label>
            <Input
              id="numSubheadings"
              type="number"
              min="1"
              max="10"
              value={numSubheadings}
              onChange={(e) => setNumSubheadings(e.target.value)}
              className="w-full !text-lg !md:text-lg p-2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-lg">
              Regeneration Instructions
            </Label>
            <Textarea
              id="instructions"
              placeholder="e.g., Focus on: technical implementation, cost breakdown, timeline. Include specific details about server infrastructure. Emphasize security measures. Exclude marketing aspects."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full text-lg"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExpanded(false)}
              className="text-lg"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="text-lg">
              {isLoading ? "Regenerating..." : "Submit"}
            </Button>
          </div>
        </form>
      )}

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
                    placeholder="Write the name of the the subtopic you want the AI to cover in the answer"
                    rows={1}
                  />
                </div>
                <button
                  onClick={() => handleDeleteSubheading(index, subIndex)}
                  className="ml-2 p-2 text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
                  title="Delete subheading"
                >
                  <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                </button>
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
                placeholder="Please write any extra guidance to help improve the responses"
                rows={5}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(SubheadingCards);
