import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
// import SubheadingCards from "./SubheadingCards";
import { BidContext, Section } from "../../BidWritingStateManagerView";
import QuestionTypeDropdown from "@/views/BidOutline/components/QuestionTypeDropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils";
import { ChevronRight, FileIcon, X, Plus } from "lucide-react";
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
import GenerateSectonButton from "@/components/GenerateSectionButton";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

interface HighlightedDocument {
  name: string;
  folder: string;
  unique_id?: string;
  rawtext: string;
}

// Interface for file metadata
interface FileWithMetadata {
  filename: string;
  folder: string;
  unique_id?: string;
  rawtext?: string;
}

interface ProposalSidepaneProps {
  section: Section;
  index: number;
  isLoading: boolean;
  isPreviewLoading: boolean;
  handleEditClick: (section: Section, index: number) => void;
  handleSectionChange: (
    index: number,
    field: keyof Section,
    value: any
  ) => Promise<boolean> | boolean;
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
}
const ProposalSidepane: React.FC<ProposalSidepaneProps> = ({
  section,
  index,
  handleSectionChange,
  handleDeleteSubheading
}) => {
  const { sharedState } = useContext(BidContext);

  const [openSections, setOpenSections] = React.useState({
    compliance: true,
    winThemes: true,
    painPoints: true,
    differentiation: true,
    highlightedDocs: true
  });

  const toggleSection = (sectionName: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

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

  // Update the handleSaveSelectedFiles function
  const handleSaveSelectedFiles = async (
    selectedFilesWithMetadata: FileWithMetadata[]
  ) => {
    console.log("Received files with metadata:", selectedFilesWithMetadata);

    if (!selectedFilesWithMetadata || selectedFilesWithMetadata.length === 0) {
      console.log("No files selected, keeping existing documents");
      return;
    }

    // Convert to HighlightedDocument objects with the correct rawtext
    const documentObjects = await Promise.all(
      selectedFilesWithMetadata.map(async (file: FileWithMetadata) => {
        // If existing document has rawtext, use it; otherwise, fetch the content
        const rawtext = await getFileContent(file.filename, file.folder);

        return {
          name: file.filename,
          folder: file.folder,
          rawtext: rawtext
        };
      })
    );

    // Update section through parent's change handler directly without setting local state
    handleSectionChange(index, "highlightedDocuments", documentObjects);
  };

  // Update the handleRemoveDocument function
  const handleRemoveDocument = (document: HighlightedDocument) => {
    // Filter the document from the section's highlightedDocuments
    const updatedDocs = section.highlightedDocuments.filter(
      (doc) => doc.name !== document.name
    );

    // Update section through parent's change handler
    handleSectionChange(index, "highlightedDocuments", updatedDocs);
  };

  // Update the handleSaveSelectedTenderFiles function
  const handleSaveSelectedTenderFiles = async (
    selectedFilesWithMetadata: FileWithMetadata[]
  ) => {
    console.log(
      "Received tender files with metadata:",
      selectedFilesWithMetadata
    );

    if (!selectedFilesWithMetadata || selectedFilesWithMetadata.length === 0) {
      console.log("No tender files selected, keeping existing documents");
      return;
    }

    // Convert to HighlightedDocument objects with the correct rawtext
    const documentObjects = await Promise.all(
      selectedFilesWithMetadata.map(async (file: FileWithMetadata) => {
        // If existing document has rawtext, use it; otherwise, fetch the content
        const rawtext = await getFileContent(file.filename, file.folder);

        return {
          name: file.filename,
          folder: file.folder,
          rawtext: rawtext
        };
      })
    );

    // Update section through parent's change handler directly
    handleSectionChange(index, "highlightedTenderDocuments", documentObjects);
  };

  // Update the handleRemoveTenderDocument function
  const handleRemoveTenderDocument = (document: HighlightedDocument) => {
    // Filter the document from the section's highlightedTenderDocuments
    const updatedDocs = section.highlightedTenderDocuments.filter(
      (doc) => doc.name !== document.name
    );

    // Update section through parent's change handler
    handleSectionChange(index, "highlightedTenderDocuments", updatedDocs);
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

  // Function to parse bullet points into an array
  const parseBulletPoints = (text: string): string[] => {
    if (!text) return [];
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          line.startsWith("-") || line.startsWith("•") || line.startsWith("*")
      )
      .map((line) => line.substring(1).trim())
      .filter(Boolean);
  };

  // Function to parse compliance requirements from markdown table
  const parseComplianceTable = (text: string): string[] => {
    if (!text) return [];

    // Split the table into lines
    const lines = text.split("\n");
    // Filter out header, separator, and empty lines
    const dataRows = lines.filter(
      (line) =>
        line.trim() &&
        !line.includes("---") &&
        !line.includes("| ID") &&
        !line.includes("Category")
    );

    // Extract requirement descriptions from the 3rd column (index 2)
    return dataRows
      .map((row) => {
        const columns = row.split("|").map((col) => col.trim());
        // The requirement description is in the 3rd column (index 2 after splitting)
        return columns.length >= 4 ? columns[3] : "";
      })
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

  // Get compliance requirements - try to parse from table first, then fallback to bullet points
  const complianceBullets = useMemo(() => {
    const requirements = section?.compliance_requirements || "";

    // Check if it's in table format (contains '|')
    if (requirements.includes("|")) {
      return parseComplianceTable(requirements);
    }

    // Fallback to bullet points
    return parseBulletPoints(requirements);
  }, [section?.compliance_requirements]);

  // New state for the dropdown selections
  const [selectedPainPoint, setSelectedPainPoint] = useState<string>("");
  const [selectedWinTheme, setSelectedWinTheme] = useState<string>("");
  const [selectedCompliance, setSelectedCompliance] = useState<string>("");

  // New state for showing/hiding dropdowns
  const [showWinThemeSelect, setShowWinThemeSelect] = useState<boolean>(false);
  const [showPainPointSelect, setShowPainPointSelect] =
    useState<boolean>(false);
  const [showComplianceSelect, setShowComplianceSelect] =
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

  // Function to remove a compliance requirement
  const handleRemoveCompliance = (requirementToRemove: string) => {
    // Get current requirements
    const currentRequirements = section?.compliance_requirements || "";

    // Check if it's in table format
    if (currentRequirements.includes("|")) {
      // For table format, filter out the row containing the requirement
      const lines = currentRequirements.split("\n");
      const updatedLines = lines.filter(
        (line) => !line.includes(requirementToRemove)
      );
      const updatedRequirements = updatedLines.join("\n");
      handleSectionChange(
        index,
        "compliance_requirements",
        updatedRequirements
      );
    } else {
      // Standard bullet point format
      const updatedRequirements = currentRequirements
        .split("\n")
        .filter((line) => {
          const trimmed = line.trim();
          return !(
            trimmed === `- ${requirementToRemove}` ||
            trimmed === `• ${requirementToRemove}`
          );
        })
        .join("\n");
      handleSectionChange(
        index,
        "compliance_requirements",
        updatedRequirements
      );
    }
  };

  // Function to add a compliance requirement
  const handleAddCompliance = () => {
    if (showComplianceSelect) {
      if (!selectedCompliance) {
        setShowComplianceSelect(false);
        return;
      }

      // Get current requirements
      const currentRequirements = section?.compliance_requirements || "";

      // Check if it's in table format
      if (currentRequirements.includes("|")) {
        // Find the next available ID
        const existingIds = parseComplianceTable(currentRequirements).map(
          (_, idx) => idx + 1
        );
        const nextId = Math.max(...existingIds, 0) + 1;

        // Add a new row to the table with the compliance requirement
        const newRow = `| ${nextId}   | Service Delivery Requirements     | ${selectedCompliance} | Technical Response | Technical Response       |`;

        // Add the new row to the table, preserving the header
        if (currentRequirements.includes("| ID  |")) {
          // Table already exists, add a new row
          const lines = currentRequirements.split("\n");
          const lastLineIndex = lines.length - 1;
          lines.splice(lastLineIndex + 1, 0, newRow);
          const updatedRequirements = lines.join("\n");
          handleSectionChange(
            index,
            "compliance_requirements",
            updatedRequirements
          );
        } else {
          // Create a new table
          const tableHeader =
            "| ID  | Category | Requirement Description | Source | Response Section |\n|-----|----------|-------------------------|--------|-------------------|";
          const updatedRequirements = `${tableHeader}\n${newRow}`;
          handleSectionChange(
            index,
            "compliance_requirements",
            updatedRequirements
          );
        }
      } else {
        // Standard bullet point format
        // Check if requirement already exists
        const requirementExists = currentRequirements
          .split("\n")
          .some((line) => {
            const trimmed = line.trim();
            return (
              trimmed === `- ${selectedCompliance}` ||
              trimmed === `• ${selectedCompliance}`
            );
          });

        if (requirementExists) {
          toast.warning("This compliance requirement is already added");
          return;
        }

        // Add the new requirement as a bullet point
        const newLine = currentRequirements ? "\n" : "";
        const updatedRequirements = `${currentRequirements}${newLine}- ${selectedCompliance}`;
        handleSectionChange(
          index,
          "compliance_requirements",
          updatedRequirements
        );
      }

      setSelectedCompliance("");
      setShowComplianceSelect(false);
    } else {
      setShowComplianceSelect(true);
    }
  };

  // Parse compliance requirements from shared state for dropdown options
  const complianceOptions = useMemo(() => {
    if (!sharedState.compliance_requirements) return [];

    if (sharedState.compliance_requirements.includes("|")) {
      return parseComplianceTable(sharedState.compliance_requirements);
    }

    return parseBulletPoints(sharedState.compliance_requirements);
  }, [sharedState.compliance_requirements]);

  // New state for the differentiation factor
  const [selectedDifferentiation, setSelectedDifferentiation] =
    useState<string>("");
  const [showDifferentiationSelect, setShowDifferentiationSelect] =
    useState<boolean>(false);

  // Function to add a differentiation factor
  const handleAddDifferentiation = () => {
    if (showDifferentiationSelect) {
      if (!selectedDifferentiation) {
        setShowDifferentiationSelect(false);
        return;
      }

      // Get current factors
      const currentFactors = section?.relevant_differentiation_factors || "";
      // Check if factor already exists
      const factorExists = currentFactors.split("\n").some((line) => {
        const trimmed = line.trim();
        return (
          trimmed === `- ${selectedDifferentiation}` ||
          trimmed === `• ${selectedDifferentiation}`
        );
      });

      if (factorExists) {
        toast.warning("This differentiation factor is already added");
        return;
      }

      // Add the new factor
      const newLine = currentFactors ? "\n" : "";
      const updatedFactors = `${currentFactors}${newLine}- ${selectedDifferentiation}`;

      // Update section through parent's change handler
      handleSectionChange(
        index,
        "relevant_differentiation_factors",
        updatedFactors
      );
      setSelectedDifferentiation("");
      setShowDifferentiationSelect(false);
    } else {
      setShowDifferentiationSelect(true);
    }
  };

  // Function to remove a differentiation factor
  const handleRemoveDifferentiation = (factorToRemove: string) => {
    // Get current factors
    const currentFactors = section?.relevant_differentiation_factors || "";
    // Filter out the factor to remove and reconstruct the string
    const updatedFactors = currentFactors
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        return !(
          trimmed === `- ${factorToRemove}` || trimmed === `• ${factorToRemove}`
        );
      })
      .join("\n");

    // Update section through parent's change handler
    handleSectionChange(
      index,
      "relevant_differentiation_factors",
      updatedFactors
    );
  };

  const [headingWidth, setHeadingWidth] = useState<number>(0);
  const textMeasureRef = useRef<HTMLSpanElement>(null);

  // Update width based on heading content
  useEffect(() => {
    if (section?.heading && textMeasureRef.current) {
      // Set the text content of the hidden span to match the input value
      textMeasureRef.current.textContent = section.heading;
      // Get the width of the text plus some padding
      const textWidth = textMeasureRef.current.getBoundingClientRect().width;
      // Add some buffer to prevent text clipping
      const bufferWidth = 20;
      const calculatedWidth = Math.max(
        100,
        Math.min(600, textWidth + bufferWidth)
      );
      setHeadingWidth(calculatedWidth);
    } else {
      setHeadingWidth(150); // Default width for empty heading
    }
  }, [section?.heading]);

  if (!section) return null;

  return (
    <div className={cn("w-full h-full bg-white rounded-md max-w-4xl mx-auto")}>
      <ScrollArea className="h-full">
        <div className="flex flex-col h-full gap-2">
          <div className="px-4 space-y-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <SelectFilePopup
                    onSaveSelectedFiles={handleSaveSelectedFiles}
                    initialSelectedFiles={
                      (section?.highlightedDocuments?.map((doc) => doc.name) ||
                        []) as string[]
                    }
                    onSaveSelectedTenderFiles={handleSaveSelectedTenderFiles}
                    initialTenderSelectedFiles={
                      (section?.highlightedTenderDocuments?.map(
                        (doc) => doc.name
                      ) || []) as string[]
                    }
                    bid_id={sharedState.object_id}
                  />
                </div>
                <div className="flex items-center">
                  <QuestionTypeDropdown
                    value={section.choice}
                    onChange={(value) =>
                      handleSectionChange(index, "choice", value)
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                <GenerateSectonButton section={section} />
              </div>
            </div>

            {section?.highlightedDocuments?.length > 0 && (
              <div className="space-y-2 min-h-10">
                <span className="text-xs font-medium text-gray-500">
                  Content Library Documents:
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {section.highlightedDocuments.map((doc, idx) => (
                    <Badge
                      key={idx}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 border text-sm",
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

            {section?.highlightedTenderDocuments?.length > 0 && (
              <div className="mt-2 mb-1">
                <span className="text-xs font-medium text-gray-500">
                  Tender Documents:
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {section.highlightedTenderDocuments.map((doc, idx) => (
                    <Badge
                      key={`tender-${idx}`}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 border text-sm",
                        loadingDocuments[doc.name]
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : doc.rawtext
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-indigo-50 text-indigo-700 border-indigo-200"
                      )}
                    >
                      <FileIcon className="h-3 w-3" />
                      <span className="max-w-xs truncate">{doc.name}</span>
                      {loadingDocuments[doc.name] && (
                        <span className="ml-1 text-xs">(loading...)</span>
                      )}
                      <Button
                        onClick={() => handleRemoveTenderDocument(doc)}
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
            {section.writingplan && section.writingplan.trim() ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-semibold">Writing Plan</span>
                </div>
                <MDXEditor
                  markdown={section.writingplan || ""}
                  onChange={(value) =>
                    handleSectionChange(index, "writingplan", value)
                  }
                  className="border rounded-md"
                  plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin()
                  ]}
                />
              </div>
            ) : null}
            {/* <SubheadingCards
                section={section}
                index={index}
                handleSectionChange={handleSectionChange}
                handleDeleteSubheading={handleDeleteSubheading}
              /> */}
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
                  <>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {complianceBullets.map((requirement, idx) => (
                        <Badge
                          key={idx}
                          className="bg-status-success_light hover:bg-status-success text-status-success hover:text-white border-status-success rounded-xl flex items-center gap-1 min-h-8 text-sm w-full"
                        >
                          {requirement}
                          <Button
                            onClick={() => handleRemoveCompliance(requirement)}
                            variant="ghost"
                            size="icon"
                            className="ml-1 h-4 w-4 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      <div className="flex items-center gap-2">
                        {showComplianceSelect ? (
                          <>
                            <Select
                              value={selectedCompliance}
                              onValueChange={setSelectedCompliance}
                            >
                              <SelectTrigger className="min-w-64 max-w-xl h-8 bg-white text-sm">
                                <SelectValue placeholder="Enter compliance requirement" />
                              </SelectTrigger>
                              <SelectContent>
                                {complianceOptions.map((requirement, idx) => (
                                  <SelectItem
                                    key={idx}
                                    value={requirement}
                                    className="max-w-xl"
                                  >
                                    {requirement}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleAddCompliance}
                              className="flex items-center rounded-lg p-2"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddCompliance}
                            className="flex items-center rounded-lg p-2"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* <DebouncedTextArea
                        value={section.compliance_requirements}
                        onChange={(value) =>
                          handleSectionChange(
                            index,
                            "compliance_requirements",
                            value
                          )
                        }
                        placeholder="These are the compliance requirements relevant to the section..."
                      /> */}
                  </>
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
                          className="bg-status-research_light hover:bg-status-research text-status-research hover:text-white border-status-research rounded-xl flex items-center gap-1 min-h-8 text-sm w-full"
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
                      <div className="flex items-center gap-2">
                        {showWinThemeSelect ? (
                          <>
                            <Select
                              value={selectedWinTheme}
                              onValueChange={setSelectedWinTheme}
                            >
                              <SelectTrigger className="min-w-64 max-w-xl h-8 bg-white text-sm">
                                <SelectValue placeholder="Select a win theme" />
                              </SelectTrigger>
                              <SelectContent>
                                {sharedState.win_themes.map((theme, idx) => (
                                  <SelectItem
                                    key={idx}
                                    value={theme}
                                    className="max-w-xl"
                                  >
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
                          className="bg-status-review_light hover:bg-status-review text-status-review hover:text-white border-status-review rounded-xl flex items-center gap-1 min-h-8 text-sm w-full"
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
                      <div className="flex items-center gap-2">
                        {showPainPointSelect ? (
                          <>
                            <Select
                              value={selectedPainPoint}
                              onValueChange={setSelectedPainPoint}
                            >
                              <SelectTrigger className="min-w-64 max-w-xl h-8 bg-white text-sm">
                                <SelectValue placeholder="Select a pain point" />
                              </SelectTrigger>
                              <SelectContent>
                                {sharedState.customer_pain_points.map(
                                  (point, idx) => (
                                    <SelectItem
                                      key={idx}
                                      value={point}
                                      className="max-w-xl"
                                    >
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
                  <>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {parseBulletPoints(
                        section?.relevant_differentiation_factors || ""
                      ).map((factor, idx) => (
                        <Badge
                          key={idx}
                          className="bg-status-planning_light hover:bg-status-planning text-status-planning hover:text-white border-status-planning rounded-xl flex items-center gap-1 min-h-8 text-sm w-full"
                        >
                          {factor}
                          <Button
                            onClick={() => handleRemoveDifferentiation(factor)}
                            variant="ghost"
                            size="icon"
                            className="ml-1 h-4 w-4 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      <div className="flex items-center gap-2">
                        {showDifferentiationSelect ? (
                          <>
                            <Select
                              value={selectedDifferentiation}
                              onValueChange={setSelectedDifferentiation}
                            >
                              <SelectTrigger className="min-w-64 max-w-xl h-8 bg-white text-sm">
                                <SelectValue placeholder="Enter differentiation factor" />
                              </SelectTrigger>
                              <SelectContent>
                                {sharedState.differentiating_factors?.map(
                                  (factor, idx) => (
                                    <SelectItem
                                      key={idx}
                                      value={factor}
                                      className="max-w-xl"
                                    >
                                      {factor}
                                    </SelectItem>
                                  )
                                ) || []}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleAddDifferentiation}
                              className="flex items-center rounded-lg p-2"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddDifferentiation}
                            className="flex items-center rounded-lg p-2"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProposalSidepane;
