import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants.tsx";
import axios from "axios";
import withAuth from "../../routes/withAuth.tsx";
import { useAuthUser } from "react-auth-kit";
import BidNavbar from "@/components/BidNavbar";
import {
  BidContext,
  Section,
  Subheading
} from "../BidWritingStateManagerView.tsx";
import StatusMenu from "../../buttons/StatusMenu.tsx";
import SectionMenu from "../../buttons/SectionMenu.tsx";
import posthog from "posthog-js";
import OutlineInstructionsModal from "./components/OutlineInstructionsModal.tsx";
import ProposalSidepane from "./components/SlidingSidepane.tsx";
import ReviewerDropdown from "./components/ReviewerDropdown.tsx";
import QuestionTypeDropdown from "./components/QuestionTypeDropdown.tsx";
import SectionControls from "./components/SectionControls.tsx";
import BulkControls from "./components/BulkControls.tsx";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation.tsx";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteConfirmationDialog } from "../../modals/DeleteConfirmationModal.tsx";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProposalPlan = () => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const navigate = useNavigate();
  const tokenRef = useRef(auth?.token || "default");
  const { sharedState, setSharedState } = useContext(BidContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [questionAsked, setQuestionAsked] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [apiChoices, setApiChoices] = useState([]);
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [wordAmounts, setWordAmounts] = useState({});
  const [broadness, setBroadness] = useState("4");
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(
    null
  );

  const [lastOutlineState, setLastOutlineState] = useState(null);
  const [canRevert, setCanRevert] = useState(false);

  const { object_id, contributors, outline } = sharedState;

  // const currentUserPermission = contributors[auth.email] || "viewer";

  const [showModal, setShowModal] = useState(false);

  const [contextMenu, setContextMenu] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSections, setSelectedSections] = useState(new Set());

  const [isSidepaneOpen, setIsSidepaneOpen] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<{
    section: Section;
    index: number;
  } | null>(null);

  // Bulk Update functions
  const handleSelectSection = (index) => {
    setSelectedSections((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(index)) {
        newSelection.delete(index);
      } else {
        newSelection.add(index);
      }
      return newSelection;
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      // Select all sections
      setSelectedSections(new Set(outline.map((_, index) => index)));
    } else {
      // Clear all selections
      setSelectedSections(new Set());
    }
  };

  const handleBulkUpdate = (updates) => {
    // Store current state before making changes
    setLastOutlineState([...sharedState.outline]);
    setCanRevert(true);

    setSharedState((prevState) => {
      const newOutline = [...prevState.outline];
      selectedSections.forEach((index) => {
        newOutline[index] = {
          ...newOutline[index],
          ...updates
        };
      });
      return {
        ...prevState,
        outline: newOutline
      };
    });
  };

  // Add this handler for bulk delete
  const handleBulkDelete = () => {
    try {
      // Store current state before deleting
      setLastOutlineState([...sharedState.outline]);
      setCanRevert(true);

      // Track bulk delete action
      posthog.capture("proposal_sections_bulk_delete", {
        bidId: object_id,
        numberOfSections: selectedSections.size,
        sectionIndices: Array.from(selectedSections)
      });

      const sectionsToDelete = Array.from(selectedSections).sort(
        (a, b) => b - a
      );
      const updatedOutline = [...sharedState.outline];
      sectionsToDelete.forEach((index) => {
        updatedOutline.splice(index, 1);
      });

      setSharedState((prevState) => ({
        ...prevState,
        outline: updatedOutline
      }));

      setSelectedSections(new Set());
      toast.success("Sections deleted successfully");
    } catch (error) {
      console.error("Error deleting sections:", error);
      toast.error("Failed to delete sections");
    }
  };

  // Add this function to handle reverting changes
  const handleRevert = () => {
    if (lastOutlineState) {
      setSharedState((prevState) => ({
        ...prevState,
        outline: lastOutlineState
      }));
      setLastOutlineState(null);
      setCanRevert(false);
      toast.success("Changes reverted successfully");
    }
  };

  const handleRowClick = (e: React.MouseEvent, index: number) => {
    // Add data-status-menu to the list of elements to ignore
    const isInteractiveElement = (e.target as HTMLElement).closest(
      'input, select, button, a, [role="button"], .editable-cell, .dropdown, .dropdown-toggle, .MuiSelect-root, .MuiSelect-select, .MuiMenuItem-root, .MuiPaper-root, .MuiList-root, .css-1dimb5e-singleValue, .css-1s2u09g-control, .css-b62m3t-container, [data-checkbox], [data-status-menu]'
    );

    if (!isInteractiveElement) {
      e.preventDefault();
      setSelectedSection(index);
      setIsSidepaneOpen(true);
      setApiChoices([]);
    }
  };

  // Add these types and functions to your ProposalPlan component:
  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;

    setSharedState((prevState) => {
      const newOutline = [...prevState.outline];
      const [movedItem] = newOutline.splice(index, 1);
      newOutline.splice(newIndex, 0, movedItem);

      return {
        ...prevState,
        outline: newOutline
      };
    });
  };

  const handleContextMenu = (e, index) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
    setSelectedRowIndex(index);
  };

  const handleClickOutside = (e) => {
    if (contextMenu && !e.target.closest(".context-menu")) {
      setContextMenu(null);
      setSelectedRowIndex(null);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [contextMenu]);

  const handleAddSection = async () => {
    if (!object_id || selectedRowIndex === null) return;

    const newSection = {
      heading: "New Section",
      word_count: 250,
      reviewer: "",
      status: "Not Started" as const,
      subsections: 0,
      question: "",
      answer: "",
      weighting: "",
      page_limit: "",
      subheadings: [],
      choice: "3b",
      writingplan: ""
    };

    try {
      const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );

      const updatedOutline = [...sharedState.outline];
      updatedOutline.splice(selectedRowIndex, 0, {
        ...newSection,
        section_id: uuid
      });

      setSharedState((prevState) => ({
        ...prevState,
        outline: updatedOutline
      }));
    } catch (err) {
      console.error("Error adding section:", err);
      toast.error("Failed to add section");
    }
    setContextMenu(null);
  };

  const handleDeleteSection = async (
    sectionId: string,
    sectionIndex: number
  ) => {
    try {
      posthog.capture("proposal_section_delete_started", {
        bidId: object_id,
        sectionId,
        sectionIndex
      });

      await deleteSection(sectionId, sectionIndex);
    } catch (err) {
      console.log(err);
      posthog.capture("proposal_section_delete_failed", {
        bidId: object_id,
        sectionId,
        error: err.message
      });
    }
  };

  const handleEditClick = async (section: Section, index: number) => {
    try {
      // Use preview-specific loading state
      posthog.capture("proposal_section_edit", {
        bidId: object_id,
        sectionId: section.section_id,
        sectionHeading: section.heading
      });

      const selectedChoices =
        section.subheadings.length > 0
          ? section.subheadings.map((subheading) => subheading.title)
          : [section.heading];

      const wordAmount = section.word_count;

      // If no subheadings, use empty array for compliance requirements
      const compliance_requirements =
        section.subheadings.length > 0
          ? section.subheadings.map(
              (subheading) => section.compliance_requirements
            )
          : [""];

      const answer = await sendQuestionToChatbot(
        section.question,
        section.writingplan || "",
        index,
        section.choice,
        selectedChoices,
        wordAmount || 250,
        compliance_requirements
      );

      // Update state and wait for it to complete
      await new Promise<void>((resolve) => {
        setSharedState((prevState) => {
          const newOutline = [...prevState.outline];
          newOutline[index] = {
            ...newOutline[index],
            answer: answer
          };

          setTimeout(resolve, 0);
          return {
            ...prevState,
            outline: newOutline
          };
        });
      });
    } catch (error) {
      console.error("Error in handleEditClick:", error);
      toast.error("Failed to update section");
    }
  };

  const showViewOnlyMessage = () => {
    toast.error("You only have permission to view this bid.");
  };

  useEffect(() => {
    // Only show modal if we have an object_id (meaning shared state is populated)
    // and outline is empty
    console.log(outline);
    console.log(sharedState.outline);
    if (object_id && outline.length === 0) {
      setShowModal(true);
    }
  }, [outline.length, object_id]);

  const handleRegenerateClick = () => {
    setShowModal(true);
  };

  const deleteSection = async (sectionId: string, sectionIndex: number) => {
    try {
      const updatedOutline = [...sharedState.outline];
      updatedOutline.splice(sectionIndex, 1);

      setSharedState((prevState) => ({
        ...prevState,
        outline: updatedOutline
      }));

      toast.success("Section deleted successfully");
    } catch (err) {
      console.error("Error deleting section:", err);
      toast.error("Failed to delete section");
    }
  };

  const handleDeleteClick = (section: Section, index: number) => {
    setSectionToDelete({ section, index });
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (sectionToDelete) {
      deleteSection(sectionToDelete.section.section_id, sectionToDelete.index);
      setShowDeleteDialog(false);
      setSectionToDelete(null);
    }
  };

  const handleDeleteSubheading = (
    sectionIndex: number,
    subheadingIndex: number
  ) => {
    const newOutline = [...outline];

    // Filter out the deleted subheading
    newOutline[sectionIndex].subheadings = newOutline[
      sectionIndex
    ].subheadings.filter((_, idx) => idx !== subheadingIndex);

    // Update the subsections count to match the new number of subheadings
    newOutline[sectionIndex] = {
      ...newOutline[sectionIndex],
      subsections: newOutline[sectionIndex].subheadings.length
    };

    setSharedState((prevState) => ({
      ...prevState,
      outline: newOutline
    }));
  };

  const handleSectionChange = async (
    index: number,
    field: keyof Section,
    value: any
  ) => {
    try {
      // Create new outline by properly spreading nested objects
      const newOutline = [...sharedState.outline];

      // If changing a field other than status and current status is "Not Started", update status to "In Progress"
      if (field !== "status" && newOutline[index].status === "Not Started") {
        newOutline[index] = {
          ...newOutline[index],
          [field]: value,
          status: "In Progress"
        };

        // Track automatic status change
        posthog.capture("proposal_section_status_auto_changed", {
          bidId: object_id,
          sectionIndex: index,
          previousStatus: "Not Started",
          newStatus: "In Progress",
          triggerField: field
        });
      } else {
        newOutline[index] = {
          ...newOutline[index],
          [field]: value
        };
      }

      // Update state using callback to ensure we have latest state
      setSharedState((prevState) => ({
        ...prevState,
        outline: newOutline
      }));

      // Wait for state to update
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Track status changes
      if (field === "status") {
        posthog.capture("proposal_section_status_changed", {
          bidId: object_id,
          sectionIndex: index,
          newStatus: value
        });
      }

      // Track answer changes
      if (field === "answer") {
        posthog.capture("proposal_section_answer_updated", {
          bidId: object_id,
          sectionIndex: index,
          answerLength: value.length
        });
      }

      return true; // Indicate successful update
    } catch (error) {
      console.error("Error updating section:", error);
      toast.error("Failed to update section");
      return false;
    }
  };

  const handleSectionNavigation = (direction: "prev" | "next") => {
    console.log("clicked", selectedSection);
    if (selectedSection === null) return; // Changed condition to check for null specifically

    setApiChoices([]);
    console.log("change section");
    const newIndex =
      direction === "prev" ? selectedSection - 1 : selectedSection + 1;

    if (newIndex >= 0 && newIndex < outline.length) {
      setSelectedSection(newIndex);
    }
  };

  const sendQuestionToChatbot = async (
    inputText: string,
    backgroundInfo: string,
    sectionIndex: number,
    choice: string,
    selectedChoices?: string[],
    wordAmount?: number,
    compliance_requirements?: string[]
  ) => {
    setCurrentSectionIndex(sectionIndex);
    setQuestionAsked(true);
    localStorage.setItem("questionAsked", "true");
    setStartTime(Date.now());
    setElapsedTime(0);
    setApiChoices([]);

    console.log("question");
    console.log(choice);
    console.log(broadness);
    console.log(inputText);
    console.log(backgroundInfo);
    console.log(sharedState.selectedFolders);
    console.log(sharedState.object_id);

    try {
      // Build request body based on choice
      const requestBody: any = {
        choice: choice,
        broadness: broadness,
        input_text: inputText,
        extra_instructions: backgroundInfo,
        datasets: sharedState.selectedFolders,
        bid_id: sharedState.object_id
      };

      // Only include selectedChoices and wordAmounts if choice is not "3a"
      if (choice !== "3a") {
        setIsPreviewLoading(true);
        if (selectedChoices) {
          requestBody.selected_choices = selectedChoices;
        }
        if (wordAmounts) {
          requestBody.word_amount = wordAmount;
        }
        if (wordAmounts) {
          requestBody.compliance_requirements = compliance_requirements;
          console.log("compliance");
          console.log(compliance_requirements);
        }
      } else {
        setIsLoading(true);
      }

      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/question`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      console.log("Received response:", result.data);

      if (choice === "3a") {
        let choicesArray = [];
        try {
          if (result.data && result.data.includes(";")) {
            choicesArray = result.data
              .split(";")
              .map((choice) => choice.trim());
          }
          if (choicesArray.length === 0 && typeof result.data === "string") {
            choicesArray = result.data
              .split("\n")
              .filter((line) => /^\d+\./.test(line.trim()))
              .map((line) => line.replace(/^\d+\.\s*/, "").trim());
          }
          console.log("Parsed choices:", choicesArray);
          if (choicesArray.length === 0) {
            throw new Error("Failed to parse API response into choices");
          }
        } catch (error) {
          console.error("Error processing API response:", error);
        }
        setApiChoices(choicesArray);
      } else {
        return result.data;
      }
    } catch (error) {
      console.error("Error sending question:", error);
      throw error;
    } finally {
      setIsLoading(false);
      setIsPreviewLoading(false);
      setStartTime(null);
    }
  };

  const handleChoiceSelection = (selectedChoice) => {
    if (selectedChoices.includes(selectedChoice)) {
      setSelectedChoices(
        selectedChoices.filter((choice) => choice !== selectedChoice)
      );
      setWordAmounts((prevWordAmounts) => {
        const newWordAmounts = { ...prevWordAmounts };
        delete newWordAmounts[selectedChoice];
        return newWordAmounts;
      });
    } else {
      setSelectedChoices([...selectedChoices, selectedChoice]);
      setWordAmounts((prevWordAmounts) => ({
        ...prevWordAmounts,
        [selectedChoice]: 100 // Default word amount
      }));
    }
  };

  // const renderChoices = () => {
  //   return (
  //     <div className="choices-container ms-2">
  //       {apiChoices
  //         .filter((choice) => choice && choice.trim() !== "") // Filter out empty or whitespace-only choices
  //         .map((choice, index) => (
  //           <div key={index} className="choice-item d-flex align-items-center">
  //             <Form.Check
  //               type="checkbox"
  //               checked={selectedChoices.includes(choice)}
  //               onChange={() => handleChoiceSelection(choice)}
  //             />
  //             {selectedChoices.includes(choice) ? (
  //               <Form.Control
  //                 type="text"
  //                 value={choice}
  //                 onChange={(e) => handleChoiceEdit(index, e.target.value)}
  //                 className="ml-2"
  //               />
  //             ) : (
  //               <span
  //                 onClick={() => handleChoiceSelection(choice)}
  //                 style={{ cursor: "pointer" }}
  //               >
  //                 {choice}
  //               </span>
  //             )}
  //           </div>
  //         ))}
  //     </div>
  //   );
  // };

  // const handleChoiceEdit = (index, newValue) => {
  //   const updatedChoices = [...apiChoices];
  //   updatedChoices[index] = newValue;
  //   setApiChoices(updatedChoices);

  //   // Update selectedChoices and wordAmounts if the edited choice was selected
  //   if (selectedChoices.includes(apiChoices[index])) {
  //     const updatedSelectedChoices = selectedChoices.map((choice) =>
  //       choice === apiChoices[index] ? newValue : choice
  //     );
  //     setSelectedChoices(updatedSelectedChoices);

  //     const updatedWordAmounts = { ...wordAmounts };
  //     if (updatedWordAmounts[apiChoices[index]]) {
  //       updatedWordAmounts[newValue] = updatedWordAmounts[apiChoices[index]];
  //       delete updatedWordAmounts[apiChoices[index]];
  //     }
  //     setWordAmounts(updatedWordAmounts);
  //   }
  // };

  const submitSelections = async () => {
    setIsLoading(true);
    setStartTime(Date.now());
    setElapsedTime(0);
    try {
      console.log("Starting submitSelections with choices:", selectedChoices);

      // Generate UUID for each subheading
      const generateUUID = () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      };

      // Convert selected choices into subheadings format with all required properties
      const newSubheadings: Subheading[] = selectedChoices.map((choice) => ({
        title: choice,
        word_count: parseInt(wordAmounts[choice] || "100"),
        content: "",
        subheading_id: generateUUID(),
        extra_instructions: "" // Add default value for extra_instructions
      }));

      // Get the current section and update its subheadings
      setSharedState((prevState) => {
        const newOutline = [...prevState.outline];

        if (currentSectionIndex !== null && currentSectionIndex >= 0) {
          // If section already has subheadings, append new ones
          const existingSubheadings =
            newOutline[currentSectionIndex].subheadings || [];
          newOutline[currentSectionIndex] = {
            ...newOutline[currentSectionIndex],
            subheadings: [...existingSubheadings, ...newSubheadings],
            subsections: existingSubheadings.length + newSubheadings.length
          };
        }

        return {
          ...prevState,
          outline: newOutline
        };
      });

      // Reset selection state
      setApiChoices([]);
      setSelectedChoices([]);
      setWordAmounts({});
    } catch (error) {
      console.error("Error submitting selections:", error);
      toast.error("Error generating responses");
    } finally {
      setIsLoading(false);
      setStartTime(null);
    }
  };

  const parentPages = [{ name: "Tender Dashboard", path: "/bids" }];
  const location = useLocation();
  const initialBidName = sharedState.bidInfo;

  // Add this function to handle drag end events
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = outline.findIndex(
        (section) => section.section_id === active.id
      );
      const newIndex = outline.findIndex(
        (section) => section.section_id === over.id
      );

      setSharedState((prevState) => {
        const newOutline = [...prevState.outline];
        const [movedItem] = newOutline.splice(oldIndex, 1);
        newOutline.splice(newIndex, 0, movedItem);

        return {
          ...prevState,
          outline: newOutline
        };
      });

      // Track the drag and drop action
      posthog.capture("proposal_section_reordered", {
        bidId: object_id,
        sectionId: active.id,
        oldIndex,
        newIndex
      });
    }
  };

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Create a sortable table row component
  const SortableTableRow = ({ section, index }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id: section.section_id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1 : 0,
      position: "relative" as const
    };

    return (
      <TableRow
        ref={setNodeRef}
        style={style}
        className={`cursor-pointer hover:bg-muted/50 ${isDragging ? "bg-muted/50" : ""}`}
        onClick={(e) => handleRowClick(e, index)}
        onContextMenu={(e) => handleContextMenu(e, index)}
      >
        <TableCell className="w-[60px] px-4" data-checkbox>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="cursor-grab touch-none px-1 h-6"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={16} />
            </Button>
            <Checkbox
              checked={selectedSections.has(index)}
              onCheckedChange={() => handleSelectSection(index)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </TableCell>
        <TableCell className="px-4">
          <div className="truncate max-w-md">
            <span>{section.heading}</span>
          </div>
        </TableCell>
        <TableCell className="px-4">
          <div className="flex items-center justify-center">
            <ReviewerDropdown
              value={section.reviewer}
              onChange={(value) =>
                handleSectionChange(index, "reviewer", value)
              }
              contributors={contributors}
            />
          </div>
        </TableCell>
        <TableCell className="px-4">
          <div className="flex items-center justify-center">
            <QuestionTypeDropdown
              value={section.choice}
              onChange={(value) => handleSectionChange(index, "choice", value)}
            />
          </div>
        </TableCell>
        <TableCell className="px-4">
          <div className="flex items-center justify-center" data-status-menu>
            <StatusMenu
              value={section.status}
              onChange={(value) => {
                handleSectionChange(index, "status", value);
              }}
            />
          </div>
        </TableCell>
        <TableCell className="px-4 text-center">
          {section.subsections}
        </TableCell>
        <TableCell className="px-4">
          <div className="flex items-center justify-center">
            <Input
              type="number"
              value={section.word_count || 0}
              min={0}
              step={50}
              className="w-20 text-center"
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  handleSectionChange(index, "word_count", value);
                }
              }}
            />
          </div>
        </TableCell>
        <TableCell className="w-[60px] text-right px-4">
          <SectionControls
            onDelete={() => handleDeleteClick(section, index)}
            onMoveDown={() => handleMoveSection(index, "down")}
            onMoveUp={() => handleMoveSection(index, "up")}
            isFirst={index === 0}
            isLast={index === outline.length - 1}
          />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between w-full border-b border-typo-200 px-6 py-2 min-h-[3.43785rem]">
        <BreadcrumbNavigation
          currentPage={initialBidName}
          parentPages={parentPages}
          showHome={true}
        />
      </div>
      <div className="px-6 py-4 flex-1 overflow-y-auto">
        <div className="flex flex-col space-y-4 h-full">
          <BidNavbar
            showViewOnlyMessage={showViewOnlyMessage}
            initialBidName="Bid Outline"
            description="Enrich the generated structure by injecting specific instructions to each question to assemble your first draft response."
            outline={outline}
            object_id={object_id}
            handleRegenerateClick={handleRegenerateClick}
          />
          <div className="flex-1">
            <OutlineInstructionsModal
              show={showModal}
              onHide={() => setShowModal(false)}
              bid_id={object_id}
            />
            {outline.length === 0 ? null : (
              <div className="h-full">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px] flex items-center justify-end gap-2 h-full text-sm text-typo-900 font-semibold py-3.5 px-4">
                          <Checkbox
                            checked={selectedSections.size === outline.length}
                            onCheckedChange={(checked) =>
                              handleSelectAll(checked)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableHead>
                        <TableHead className="text-sm text-typo-900 font-semibold py-3.5 px-4">
                          Section
                        </TableHead>
                        <TableHead className="text-sm text-typo-900 font-semibold py-3.5 px-4 text-center">
                          Reviewer
                        </TableHead>
                        <TableHead className="text-sm text-typo-900 font-semibold py-3.5 px-4 text-center">
                          Question Type
                        </TableHead>
                        <TableHead className="text-sm text-typo-900 font-semibold py-3.5 px-4 text-center">
                          Completed
                        </TableHead>
                        <TableHead className="text-sm text-typo-900 font-semibold py-3.5 px-4 text-center">
                          Subsections
                        </TableHead>
                        <TableHead className="text-sm text-typo-900 font-semibold py-3.5 px-4 text-center">
                          Words
                        </TableHead>
                        <TableHead className="w-[60px] text-right text-sm text-typo-900 font-semibold py-3.5 px-4">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                      modifiers={[restrictToVerticalAxis]}
                    >
                      <SortableContext
                        items={outline.map((section) => section.section_id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <TableBody>
                          {outline.map((section, index) => (
                            <SortableTableRow
                              key={section.section_id}
                              section={section}
                              index={index}
                            />
                          ))}
                        </TableBody>
                      </SortableContext>
                    </DndContext>
                  </Table>
                </div>

                <DeleteConfirmationDialog
                  isOpen={showDeleteDialog}
                  onClose={() => {
                    setShowDeleteDialog(false);
                    setSectionToDelete(null);
                  }}
                  onConfirm={handleConfirmDelete}
                  title="Delete Section"
                  message="Are you sure you want to delete this section? This action cannot be undone."
                />

                {contextMenu && (
                  <SectionMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onAddSection={handleAddSection}
                    onDeleteSection={handleDeleteSection}
                  />
                )}

                {selectedSection !== null && (
                  <ProposalSidepane
                    section={outline[selectedSection]}
                    contributors={contributors}
                    index={selectedSection}
                    isOpen={isSidepaneOpen}
                    onClose={() => {
                      setIsSidepaneOpen(false);
                      setSelectedSection(null);
                    }}
                    isLoading={isLoading}
                    isPreviewLoading={isPreviewLoading}
                    handleEditClick={handleEditClick}
                    handleSectionChange={handleSectionChange}
                    sendQuestionToChatbot={sendQuestionToChatbot}
                    apiChoices={apiChoices}
                    selectedChoices={selectedChoices}
                    submitSelections={submitSelections}
                    handleDeleteSubheading={handleDeleteSubheading}
                    totalSections={outline.length}
                    onNavigate={handleSectionNavigation}
                  />
                )}

                {selectedSections.size > 0 && (
                  <BulkControls
                    selectedCount={selectedSections.size}
                    onClose={() => setSelectedSections(new Set())}
                    onUpdateSections={handleBulkUpdate}
                    onDeleteSections={handleBulkDelete}
                    contributors={contributors}
                    onRevert={handleRevert}
                    canRevert={canRevert}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(ProposalPlan);
