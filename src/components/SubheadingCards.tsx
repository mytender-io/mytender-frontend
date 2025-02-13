import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

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
              <div className="flex items-center flex-1">
                <textarea
                  value={subheading.title}
                  onChange={(e) => {
                    const newSubheadings = [...section.subheadings];
                    newSubheadings[subIndex] = {
                      ...newSubheadings[subIndex],
                      title: e.target.value
                    };
                    handleSectionChange(index, "subheadings", newSubheadings);
                  }}
                  className="w-full bg-transparent resize-none focus:outline-none ms-2"
                  rows={1}
                />
              </div>
              <button
                onClick={() => handleDeleteSubheading(index, subIndex)}
                className="ml-2 p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="Delete subheading"
              >
                <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-3">
            <textarea
              value={
                subheading.extra_instructions
                  ? `• ${formatAsBullets(subheading.extra_instructions)}`
                  : ""
              }
              onChange={(e) => {
                const newSubheadings = [...section.subheadings];
                newSubheadings[subIndex] = {
                  ...newSubheadings[subIndex],
                  extra_instructions: convertFromBullets(e.target.value)
                };
                handleSectionChange(index, "subheadings", newSubheadings);
              }}
              className="w-full bg-transparent focus:outline-none text-gray-600 overflow-y-auto h-32"
              placeholder="Add extra instructions..."
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubheadingCards;
