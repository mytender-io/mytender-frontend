import React, { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import DebouncedTextArea from "./DeboucedTextArea";

const SubheadingCards = ({
  section,
  index,
  handleSectionChange,
  handleDeleteSubheading,
  RegenerateButton
}) => {
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
    const newSubheadings = [...section.subheadings, {
      title: "",
      extra_instructions: ""
    }];
    handleSectionChange(index, "subheadings", newSubheadings);
  }, [section.subheadings, index, handleSectionChange]);

  const handleTitleChange = useCallback((subIndex, value) => {
    const newSubheadings = [...section.subheadings];
    newSubheadings[subIndex] = {
      ...newSubheadings[subIndex],
      title: value
    };
    handleSectionChange(index, "subheadings", newSubheadings);
  }, [section.subheadings, index, handleSectionChange]);

  const handleInstructionsChange = useCallback((subIndex, value) => {
    const newSubheadings = [...section.subheadings];
    newSubheadings[subIndex] = {
      ...newSubheadings[subIndex],
      extra_instructions: convertFromBullets(value)
    };
    handleSectionChange(index, "subheadings", newSubheadings);
  }, [section.subheadings, index, handleSectionChange, convertFromBullets]);

  return (
    <div className="sidepane-section">
      <div className="proposal-header mb-2">
        <div>Writing Plan</div>
        <div className="flex items-center">
          <button
            className="bg-white rounded-lg p-2 me-2 shadow-sm hover:bg-gray-50 transition-colors"
            onClick={handleAddSubheading}
          >
            <FontAwesomeIcon
              icon={faPlus}
              className="text-gray-500 h-5 w-7"
            />
          </button>
          <RegenerateButton
            section={section}
            index={index}
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