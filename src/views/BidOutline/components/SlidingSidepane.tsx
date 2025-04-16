import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import DebouncedTextArea from "./DebouncedTextArea";
import SubheadingCards from "./SubheadingCards";
import {
  BidContext,
  Contributor,
  Section
} from "../../BidWritingStateManagerView";
import StatusMenu from "@/buttons/StatusMenu";
// import ReviewerDropdown from "@/views/BidOutline/components/ReviewerDropdown";
import QuestionTypeDropdown from "@/views/BidOutline/components/QuestionTypeDropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils";
import { ChevronRight, FileIcon, ChevronLeft, X, Plus } from "lucide-react";
import SelectFilePopup from "./SelectFilePopup";
import { Badge } from "@/components/ui/badge";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import axios from "axios";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface HighlightedDocument {
  name: string;
  folder: string;
  unique_id?: string;
  rawtext: string;
}

interface ProposalSidepaneProps {
  section: Section;
  contributors: Contributor;
  index: number;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  isPreviewLoading: boolean;
  handleEditClick: (section: Section, index: number) => void;
  handleSectionChange: (
    index: number,
    field: keyof Section,
    value: any
  ) => void;
  sendQuestionToChatbot: (
    question: string,
    writingPlan: string,
    index: number,
    choice: string
  ) => void;
  apiChoices: string[];
  selectedChoices: string[];
  submitSelections: () => void;
  handleDeleteSubheading: (
    sectionIndex: number,
    subheadingIndex: number
  ) => void;
  totalSections: number;
  onNavigate: (direction: "prev" | "next") => void;
}
const ProposalSidepane: React.FC<ProposalSidepaneProps> = ({
  section,
  contributors,
  index,
  isOpen,
  onClose,
  handleSectionChange,
  handleDeleteSubheading,
  totalSections,
  onNavigate
}) => {
  const { sharedState } = useContext(BidContext);

  const [openSections, setOpenSections] = React.useState({
    compliance: false,
    winThemes: false,
    painPoints: false,
    differentiation: false,
    highlightedDocs: false
  });

  const toggleSection = (sectionName: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Initialize highlighted documents specifically for this section
  const [highlightedDocuments, setHighlightedDocuments] = useState<
    HighlightedDocument[]
  >(() => {
    // Ensure we're getting the correct highlighted documents for this specific section
    return section?.highlightedDocuments || [];
  });
  // Whenever the section prop changes, update the local state
  useEffect(() => {
    setHighlightedDocuments(section?.highlightedDocuments || []);
    console.log(section);
  }, [section]);

  // For tracking loading states of document content fetching
  const [loadingDocuments, setLoadingDocuments] = useState<{
    [key: string]: boolean;
  }>({});

  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  const tokenRef = useRef(auth?.token || "default");

  // Function to fetch file content
  // Modified to just fetch content and return it
  const getFileContent = async (fileName: string, folderName: string) => {
    // Set loading state for this specific document
    setLoadingDocuments((prev) => ({ ...prev, [fileName]: true }));

    const formData = new FormData();
    formData.append("file_name", fileName);
    formData.append("profile_name", folderName);

    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/show_file_content`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      console.log(`Content fetched for ${fileName}`);
      return response.data; // Just return the content
    } catch (error) {
      console.error("Error viewing file:", error);
      toast.error(`Error retrieving content for ${fileName}`);
      return ""; // Return empty string on error
    } finally {
      setLoadingDocuments((prev) => ({ ...prev, [fileName]: false }));
    }
  };

  // This is a partial implementation showing only the changes needed for the highlightedDocuments logic

  const handleSaveSelectedFiles = async (selectedFilesWithMetadata) => {
    console.log("Received files with metadata:", selectedFilesWithMetadata);

    if (!selectedFilesWithMetadata || selectedFilesWithMetadata.length === 0) {
      console.log("No files selected, keeping existing documents");
      return;
    }

    // Convert to HighlightedDocument objects with the correct rawtext
    const documentObjects: HighlightedDocument[] = await Promise.all(
      selectedFilesWithMetadata.map(async (file) => {
        // Try to find existing document to preserve its rawtext if already fetched
        const existingDoc = highlightedDocuments.find(
          (doc) => doc.name === file.filename
        );

        // If existing document has rawtext, use it; otherwise, fetch the content
        const rawtext = await getFileContent(file.filename, file.folder);

        return {
          name: file.filename,
          folder: file.folder,
          rawtext: rawtext
        };
      })
    );

    // Update the state and section with the new document objects
    setHighlightedDocuments(documentObjects);
    handleSectionChange(index, "highlightedDocuments", documentObjects);
  };

  const handleRemoveDocument = (document: HighlightedDocument) => {
    const updatedDocs = highlightedDocuments.filter(
      (doc) => doc.name !== document.name
    );

    // Update local state
    setHighlightedDocuments(updatedDocs);

    // Update section through parent's change handler
    handleSectionChange(index, "highlightedDocuments", updatedDocs);
  };

  // Function to remove a win theme
  const handleRemoveWinTheme = (themeToRemove: string) => {
    // Get current themes
    const currentThemes = section?.relevant_evaluation_criteria || "";
    // Filter out the theme to remove and reconstruct the string
    const updatedThemes = currentThemes
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        return !(
          trimmed === `- ${themeToRemove}` || trimmed === `• ${themeToRemove}`
        );
      })
      .join("\n");

    // Update section through parent's change handler
    handleSectionChange(index, "relevant_evaluation_criteria", updatedThemes);
  };

  // Function to remove a pain point
  const handleRemovePainPoint = (pointToRemove: string) => {
    // Get current pain points
    const currentPainPoints = section?.relevant_derived_insights || "";
    // Filter out the point to remove and reconstruct the string
    const updatedPainPoints = currentPainPoints
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        return !(
          trimmed === `- ${pointToRemove}` || trimmed === `• ${pointToRemove}`
        );
      })
      .join("\n");

    // Update section through parent's change handler
    handleSectionChange(index, "relevant_derived_insights", updatedPainPoints);
  };

  // Get just the file names for the SelectFilePopup component
  const selectedFileNames = useMemo(() => {
    return highlightedDocuments.map((doc) => doc.name);
  }, [highlightedDocuments]);

  // Function to parse bullet points into an array
  const parseBulletPoints = (text: string): string[] => {
    if (!text) return [];
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-") || line.startsWith("•"))
      .map((line) => line.substring(1).trim())
      .filter(Boolean);
  };

  // Get win theme bullet points
  const winThemeBullets = useMemo(
    () => parseBulletPoints(section?.relevant_evaluation_criteria || ""),
    [section?.relevant_evaluation_criteria]
  );

  // Get customer pain points bullet points
  const painPointBullets = useMemo(
    () => parseBulletPoints(section?.relevant_derived_insights || ""),
    [section?.relevant_derived_insights]
  );

  // New state for the dropdown selections
  const [selectedPainPoint, setSelectedPainPoint] = useState<string>("");
  const [selectedWinTheme, setSelectedWinTheme] = useState<string>("");

  // New state for showing/hiding dropdowns
  const [showWinThemeSelect, setShowWinThemeSelect] = useState<boolean>(false);
  const [showPainPointSelect, setShowPainPointSelect] =
    useState<boolean>(false);

  // Function to add a win theme
  const handleAddWinTheme = () => {
    if (showWinThemeSelect) {
      if (!selectedWinTheme) {
        setShowWinThemeSelect(false);
        return;
      }

      // Get current themes
      const currentThemes = section?.relevant_evaluation_criteria || "";
      // Check if theme already exists
      const themeExists = currentThemes.split("\n").some((line) => {
        const trimmed = line.trim();
        return (
          trimmed === `- ${selectedWinTheme}` ||
          trimmed === `• ${selectedWinTheme}`
        );
      });

      if (themeExists) {
        toast.warning("This win theme is already added");
        return;
      }

      // Add the new theme
      const newLine = currentThemes ? "\n" : "";
      const updatedThemes = `${currentThemes}${newLine}- ${selectedWinTheme}`;

      // Update section through parent's change handler
      handleSectionChange(index, "relevant_evaluation_criteria", updatedThemes);
      setSelectedWinTheme("");
      setShowWinThemeSelect(false);
    } else {
      setShowWinThemeSelect(true);
    }
  };

  // Function to add a pain point
  const handleAddPainPoint = () => {
    if (showPainPointSelect) {
      if (!selectedPainPoint) {
        setShowPainPointSelect(false);
        return;
      }

      // Get current pain points
      const currentPainPoints = section?.relevant_derived_insights || "";
      // Check if pain point already exists
      const pointExists = currentPainPoints.split("\n").some((line) => {
        const trimmed = line.trim();
        return (
          trimmed === `- ${selectedPainPoint}` ||
          trimmed === `• ${selectedPainPoint}`
        );
      });

      if (pointExists) {
        toast.warning("This pain point is already added");
        return;
      }

      // Add the new pain point
      const newLine = currentPainPoints ? "\n" : "";
      const updatedPainPoints = `${currentPainPoints}${newLine}- ${selectedPainPoint}`;

      // Update section through parent's change handler
      handleSectionChange(
        index,
        "relevant_derived_insights",
        updatedPainPoints
      );
      setSelectedPainPoint("");
      setShowPainPointSelect(false);
    } else {
      setShowPainPointSelect(true);
    }
  };

  if (!section) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/30 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed top-0 right-0 w-full max-w-3xl h-full bg-white shadow-lg z-50 rounded-md",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <ScrollArea className="h-full">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between gap-2 p-4 border-b border-gray-line">
              <Input
                value={section.heading}
                onChange={(e) =>
                  handleSectionChange(index, "heading", e.target.value)
                }
                className="flex-1 font-bold resize-none overflow-hidden whitespace-nowrap min-h-[1.75rem] bg-transparent border-none focus:ring-0 shadow-none md:text-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-2xl bg-transparent"
              >
                ×
              </Button>
            </div>
            <div className="p-4 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onNavigate("prev")}
                    disabled={index === 0}
                    className="w-fit px-2 gap-1"
                  >
                    <ChevronLeft />
                    Prev
                  </Button>
                  {/* <span>
                    Question {index + 1} of {totalSections}
                  </span> */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onNavigate("next")}
                    disabled={index === totalSections - 1}
                    className="w-fit px-2 gap-1"
                  >
                    Next
                    <ChevronRight />
                  </Button>
                </div>
                <StatusMenu
                  value={section.status}
                  onChange={(value) =>
                    handleSectionChange(index, "status", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QuestionTypeDropdown
                    value={section.choice}
                    onChange={(value) =>
                      handleSectionChange(index, "choice", value)
                    }
                    showIcon={true}
                  />
                  <SelectFilePopup
                    onSaveSelectedFiles={handleSaveSelectedFiles}
                    initialSelectedFiles={selectedFileNames}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Word count:</span>
                  <Input
                    type="number"
                    value={section.word_count || 0}
                    min={0}
                    step={50}
                    className="w-20 text-center h-9"
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        handleSectionChange(index, "word_count", value);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Selected Files Display */}
              {highlightedDocuments.length > 0 && (
                <div className="space-y-2 min-h-10">
                  <div className="flex flex-wrap gap-2 mt-2">
                    {highlightedDocuments.map((doc, idx) => (
                      <Badge
                        key={idx}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 border",
                          loadingDocuments[doc.name]
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : doc.rawtext
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                        )}
                      >
                        <FileIcon className="h-3 w-3" />
                        <span className="max-w-xs truncate">{doc.name}</span>
                        {loadingDocuments[doc.name] && (
                          <span className="ml-1 text-xs">(loading...)</span>
                        )}
                        <Button
                          onClick={() => handleRemoveDocument(doc)}
                          variant="ghost"
                          size="icon"
                          className="ml-1 h-4 w-4 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-lg font-semibold">Question</span>
                <DebouncedTextArea
                  value={section.question}
                  onChange={(value) =>
                    handleSectionChange(index, "question", value)
                  }
                  rows={3}
                  className="border-gray-border min-h-16 font-medium"
                  placeholder="Add in the question here"
                />
              </div>
              <SubheadingCards
                section={section}
                index={index}
                handleSectionChange={handleSectionChange}
                handleDeleteSubheading={handleDeleteSubheading}
              />
              <div className="space-y-6">
                <div className="space-y-2 min-h-10">
                  <span
                    className="font-medium flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => toggleSection("compliance")}
                  >
                    <ChevronRight
                      className={cn(
                        "w-5 h-5 transition-transform duration-200",
                        openSections.compliance && "rotate-90"
                      )}
                    />
                    Compliance Requirements
                  </span>
                  {openSections.compliance && (
                    <DebouncedTextArea
                      value={section.compliance_requirements}
                      onChange={(value) =>
                        handleSectionChange(
                          index,
                          "compliance_requirements",
                          value
                        )
                      }
                      placeholder="These are the compliance requirements relevant to the section..."
                    />
                  )}
                </div>
                <div className="space-y-2 min-h-10">
                  <span
                    className="font-medium flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => toggleSection("winThemes")}
                  >
                    <ChevronRight
                      className={cn(
                        "w-5 h-5 transition-transform duration-200",
                        openSections.winThemes && "rotate-90"
                      )}
                    />
                    Relevant Win Themes
                  </span>
                  {openSections.winThemes && (
                    <>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {winThemeBullets.map((theme, idx) => (
                          <Badge
                            key={idx}
                            className="bg-status-research_light text-status-research border border-status-research rounded-xl flex items-center gap-1 h-8"
                          >
                            {theme}
                            <Button
                              onClick={() => handleRemoveWinTheme(theme)}
                              variant="ghost"
                              size="icon"
                              className="ml-1 h-4 w-4 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                        <div className="flex items-center gap-2 mb-2">
                          {showWinThemeSelect ? (
                            <>
                              <Select
                                value={selectedWinTheme}
                                onValueChange={setSelectedWinTheme}
                              >
                                <SelectTrigger className="w-64 h-8 bg-white text-sm">
                                  <SelectValue placeholder="Select a win theme" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sharedState.win_themes.map((theme, idx) => (
                                    <SelectItem key={idx} value={theme}>
                                      {theme}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddWinTheme}
                                className="flex items-center rounded-lg p-2"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleAddWinTheme}
                              className="flex items-center rounded-lg p-2"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {/* <DebouncedTextArea
                        value={section.relevant_evaluation_criteria}
                        onChange={(value) =>
                          handleSectionChange(
                            index,
                            "relevant_evaluation_criteria",
                            value
                          )
                        }
                        placeholder="These are the win themes relevant to the section..."
                      /> */}
                    </>
                  )}
                </div>
                <div className="space-y-2 min-h-10">
                  <span
                    className="font-medium flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => toggleSection("painPoints")}
                  >
                    <ChevronRight
                      className={cn(
                        "w-5 h-5 transition-transform duration-200",
                        openSections.painPoints && "rotate-90"
                      )}
                    />
                    Relevant Customer Pain Points
                  </span>
                  {openSections.painPoints && (
                    <>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {painPointBullets.map((point, idx) => (
                          <Badge
                            key={idx}
                            className="bg-status-review_light text-status-review border border-status-review rounded-xl flex items-center gap-1 h-8"
                          >
                            {point}
                            <Button
                              onClick={() => handleRemovePainPoint(point)}
                              variant="ghost"
                              size="icon"
                              className="ml-1 h-4 w-4 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                        <div className="flex items-center gap-2 mb-2">
                          {showPainPointSelect ? (
                            <>
                              <Select
                                value={selectedPainPoint}
                                onValueChange={setSelectedPainPoint}
                              >
                                <SelectTrigger className="w-64 h-8 bg-white text-sm">
                                  <SelectValue placeholder="Select a pain point" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sharedState.customer_pain_points.map(
                                    (point, idx) => (
                                      <SelectItem key={idx} value={point}>
                                        {point}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddPainPoint}
                                className="flex items-center rounded-lg p-2"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleAddPainPoint}
                              className="flex items-center rounded-lg p-2"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {/* <DebouncedTextArea
                        value={section.relevant_derived_insights}
                        onChange={(value) =>
                          handleSectionChange(
                            index,
                            "relevant_derived_insights",
                            value
                          )
                        }
                        placeholder="These are the customer pain points relevant to the section..."
                      /> */}
                    </>
                  )}
                </div>
                <div className="space-y-2 min-h-10">
                  <span
                    className="font-medium flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => toggleSection("differentiation")}
                  >
                    <ChevronRight
                      className={cn(
                        "w-5 h-5 transition-transform duration-200",
                        openSections.differentiation && "rotate-90"
                      )}
                    />
                    Competitor Differentiation Factors
                  </span>
                  {openSections.differentiation && (
                    <DebouncedTextArea
                      value={section.relevant_differentiation_factors}
                      onChange={(value) =>
                        handleSectionChange(
                          index,
                          "relevant_differentiation_factors",
                          value
                        )
                      }
                      placeholder="These are the competitor differentiation factors relevant to the section..."
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default ProposalSidepane;
