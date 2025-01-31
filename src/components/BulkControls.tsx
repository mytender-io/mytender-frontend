import React, { useState, useEffect } from "react";
import { PenLine, Users2, HelpCircle, Trash2, X, Clock } from "lucide-react";

const BulkControls = ({
  selectedCount,
  onClose,
  onUpdateSections,
  contributors
}) => {
  const [wordCount, setWordCount] = useState("500");
  const [reviewer, setReviewer] = useState("");
  const [questionType, setQuestionType] = useState("3b");
  const [status, setStatus] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    // Apply initial word count
    handleUpdate("word_count", wordCount);
  }, []); // Run once on mount

  const handleUpdate = (field, value) => {
    const updates = {};
    if (field === "word_count") {
      updates.word_count = parseInt(value);
      setWordCount(value);
    }
    if (field === "reviewer") {
      updates.reviewer = value;
      setReviewer(value);
    }
    if (field === "choice") {
      updates.choice = value;
      setQuestionType(value);
    }
    if (field === "status") {
      updates.status = value;
      setStatus(value);
    }
    onUpdateSections(updates);
    setOpenMenu(null);
  };

  const handleWordCountChange = (e) => {
    const newValue = e.target.value;
    setWordCount(newValue);
    handleUpdate("word_count", newValue);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenu && !event.target.closest("[data-dropdown]")) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  const Dropdown = ({ items, type, title }) => {
    if (openMenu !== type) return null;

    return (
      <div
        data-dropdown
        className="absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[250px]"
      >
        <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
          {title}
        </div>
        <div className="max-h-[240px] overflow-y-auto">
          {items.map((item, index) => (
            <button
              key={index}
              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2 group border-b border-gray-100 last:border-0"
              onClick={() =>
                handleUpdate(
                  type === "reviewer"
                    ? "reviewer"
                    : type === "questionType"
                      ? "choice"
                      : "status",
                  item.value
                )
              }
            >
              {item.icon && (
                <item.icon
                  size={16}
                  className="text-gray-400 group-hover:text-gray-600"
                />
              )}
              <div className="flex flex-col">
                <span className="text-sm text-gray-700">{item.label}</span>
                {item.role && (
                  <span className="text-xs text-gray-400">{item.role}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const questionTypeOptions = [
    { value: "3b", label: "General" },
    { value: "3b_case_study", label: "Case Study" },
    { value: "3b_commercial", label: "Compliance" },
    { value: "3b_personnel", label: "Team" },
    { value: "3b_technical", label: "Technical" }
  ];

  const statusOptions = [
    { value: "Not Started", label: "Not Started" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg py-4 px-6 z-40 border border-gray-100">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#FF8019] text-white rounded-full w-10 h-10 justify-center text-base text-xl">
            {selectedCount}
          </div>
          <span className="text-base text-gray-600 text-xl">
            Items Selected
          </span>
        </div>

        <div className="h-8 w-px bg-gray-200" />

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={wordCount}
              onChange={handleWordCountChange}
              className="w-28 h-12 px-2 text-center text-base border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-[#FF8019]"
              min="0"
              step="50"
            />
          </div>

          <div className="relative">
            <button
              onClick={() =>
                setOpenMenu(openMenu === "questionType" ? null : "questionType")
              }
              className="text-gray-500 hover:text-[#FF8019] transition-colors"
              title="Question Type"
            >
              <HelpCircle size={22} />
            </button>
            <Dropdown
              items={questionTypeOptions}
              type="questionType"
              title="Select Question Type"
            />
          </div>

          <div className="relative">
            <button
              onClick={() =>
                setOpenMenu(openMenu === "reviewer" ? null : "reviewer")
              }
              className="text-gray-500 hover:text-[#FF8019] transition-colors"
            >
              <Users2 size={22} />
            </button>
            <Dropdown
              items={Object.entries(contributors || {}).map(
                ([email, role]) => ({
                  value: email,
                  label: email,
                  role: role
                })
              )}
              type="reviewer"
              title="Select Reviewer"
            />
          </div>

          <div className="relative">
            <button
              onClick={() =>
                setOpenMenu(openMenu === "status" ? null : "status")
              }
              className="text-gray-500 hover:text-[#FF8019] transition-colors"
            >
              <Clock size={22} />
            </button>
            <Dropdown
              items={statusOptions}
              type="status"
              title="Select Status"
            />
          </div>

          <button
            onClick={onClose}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkControls;
