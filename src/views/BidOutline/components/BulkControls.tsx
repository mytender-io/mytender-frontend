import { useState, useEffect } from "react";
import { Users2, HelpCircle, Trash2, X, Clock, Undo2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { DeleteConfirmationDialog } from "@/modals/DeleteConfirmationModal";
import { Button } from "@/components/ui/button";

const BulkControls = ({
  selectedCount,
  onClose,
  onUpdateSections,
  onDeleteSections,
  onRevert,
  canRevert,
  contributors
}) => {
  const [wordCount, setWordCount] = useState("500");
  const [reviewer, setReviewer] = useState("");
  const [questionType, setQuestionType] = useState("3b");
  const [status, setStatus] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDeleteSections();
    setShowDeleteDialog(false);
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
            <Button
              key={index}
              variant="ghost"
              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2 group border-b border-gray-100 last:border-0 justify-start h-auto"
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
            </Button>
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
    <>
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-lg z-40 border border-gray-line">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="rounded-l-xl flex items-center bg-orange text-white h-12 w-12 min-w-12 justify-center text-base">
              {selectedCount}
            </div>
            <span className="text-md text-nowrap">Items Selected</span>
          </div>
          <div className="flex items-center">
            <div className="flex flex-col items-center gap-2 w-[100px]">
              <Input
                type="number"
                value={wordCount}
                onChange={handleWordCountChange}
                className="w-full h-4 text-center border-none outline-none shadow-none"
                min="0"
                step="50"
              />
              <span className="text-xs font-medium">Word Count</span>
            </div>

            <div className="relative w-[100px]">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setOpenMenu(
                    openMenu === "questionType" ? null : "questionType"
                  )
                }
                className="bg-transparent flex-col w-full p-1 h-auto"
                title="Question Type"
              >
                <HelpCircle />
                <span className="text-xs font-medium">Question Type</span>
              </Button>
              <Dropdown
                items={questionTypeOptions}
                type="questionType"
                title="Select Question Type"
              />
            </div>

            <div className="relative w-[100px]">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setOpenMenu(openMenu === "reviewer" ? null : "reviewer")
                }
                className="bg-transparent flex-col w-full p-1 h-auto"
              >
                <Users2 />
                <span className="text-xs font-medium">Assign to</span>
              </Button>
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

            <div className="relative w-[100px]">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setOpenMenu(openMenu === "status" ? null : "status")
                }
                className="bg-transparent flex-col w-full p-1 h-auto"
              >
                <Clock />
                <span className="text-xs font-medium">Select Status</span>
              </Button>
              <Dropdown
                items={statusOptions}
                type="status"
                title="Select Status"
              />
            </div>

            <div className="w-[100px]">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="bg-transparent flex-col w-full p-1 h-auto"
                title="Delete Selected"
              >
                <Trash2 />
                <span className="text-xs font-medium">Delete</span>
              </Button>
            </div>

            <div className="w-[100px]">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onRevert}
                      disabled={!canRevert}
                      className={`bg-transparent flex-col w-full p-1 h-auto ${
                        canRevert ? "" : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <Undo2 />
                      <span className="text-xs font-medium">Revert</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {canRevert ? "Undo last change" : "No changes to undo"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="bg-transparent w-12 h-12 min-w-12 rounded-r-xl rounded-l-none border-l border-gray-line"
            >
              <X />
            </Button>
          </div>
        </div>
      </div>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Selected Sections"
        message={`Are you sure you want to delete ${selectedCount} selected sections? This action cannot be undone.`}
      />
    </>
  );
};

export default BulkControls;
