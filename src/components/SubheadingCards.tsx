import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import DebouncedTextArea from "./DeboucedTextArea";

const SubheadingCards = ({
  section,
  index,
  handleSectionChange,
  handleDeleteSubheading
}) => {
  // Helper function to format text as bullet points
  const formatAsBullets = (text) => {
    if (!text) return "";
    return text
      .split(";")
      .map((item) => item.trim())
      .join("\n• ");
  };

  // Helper function to convert bullet points back to semicolon format
  const convertFromBullets = (text) => {
    if (!text) return "";
    return text.split("\n• ").join(";").replace(/^• /, "");
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {section.subheadings.map((subheading, subIndex) => (
        <div key={subIndex} className="bg-white rounded-lg shadow-md">
          <div className="p-2 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DebouncedTextArea
                  value={subheading.title}
                  onChange={(value) => {
                    const newSubheadings = [...section.subheadings];
                    newSubheadings[subIndex] = {
                      ...newSubheadings[subIndex],
                      title: value
                    };
                    handleSectionChange(index, "subheadings", newSubheadings);
                  }}
                  className="w-full bg-transparent resize-none focus:outline-none"
                  style={{
                    minHeight: "24px",
                    padding: "2px",
                    lineHeight: "20px"
                  }}
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
              onChange={(value) => {
                const newSubheadings = [...section.subheadings];
                newSubheadings[subIndex] = {
                  ...newSubheadings[subIndex],
                  extra_instructions: convertFromBullets(value)
                };
                handleSectionChange(index, "subheadings", newSubheadings);
              }}
              className="w-full bg-transparent focus:outline-none text-gray-600 overflow-y-auto"
              placeholder="Please write any extra guidance to help improve the responses"
              rows={4}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubheadingCards;