import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import DebouncedTextArea from "./DeboucedTextArea";
import SubheadingCards from "./SubheadingCards";
import RegenerateButton from "./RegenerateButton";
import { Contributor, Section } from "../../BidWritingStateManagerView";
import StatusMenu from "@/buttons/StatusMenu";
import ReviewerDropdown from "@/views/BidOutline/components/ReviewerDropdown";
import QuestionTypeDropdown from "@/views/BidOutline/components/QuestionTypeDropdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils";
import { ChevronRight } from "lucide-react";

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
  const [openSections, setOpenSections] = React.useState({
    compliance: false,
    winThemes: false,
    painPoints: false,
    differentiation: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!section) return null;

  const hasSubheadings = section.subheadings && section.subheadings.length > 0;

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
          "fixed top-0 right-0 w-full max-w-3xl h-full bg-white shadow-lg z-50",
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
                className="flex-1 font-bold resize-none overflow-hidden whitespace-nowrap min-h-[1.75rem] bg-transparent border-none focus:ring-0 shadow-none"
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
                    className="text-gray-600 hover:text-gray-800 disabled:text-gray-300 bg-transparent"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </Button>
                  <span>
                    Question {index + 1} of {totalSections}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onNavigate("next")}
                    disabled={index === totalSections - 1}
                    className="text-gray-600 hover:text-gray-800 disabled:text-gray-300 bg-transparent"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
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
                  <ReviewerDropdown
                    value={section.reviewer}
                    onChange={(value) =>
                      handleSectionChange(index, "reviewer", value)
                    }
                    contributors={contributors}
                  />
                  <QuestionTypeDropdown
                    value={section.choice}
                    onChange={(value) =>
                      handleSectionChange(index, "choice", value)
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  Word count:
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
              </div>
              <div className="space-y-2">
                <span className="text-lg font-semibold">Question</span>
                <DebouncedTextArea
                  value={section.question}
                  onChange={(value) =>
                    handleSectionChange(index, "question", value)
                  }
                  placeholder="What is your management policy?"
                />
              </div>
              {hasSubheadings && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Writing Plan</span>
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="me-2"
                        onClick={() => {
                          /* Add your click handler here */
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                      </Button>
                      <RegenerateButton section={section} index={index} />
                    </div>
                  </div>
                  <SubheadingCards
                    section={section}
                    index={index}
                    handleSectionChange={handleSectionChange}
                    handleDeleteSubheading={handleDeleteSubheading}
                  />
                </div>
              )}
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
                    <Textarea
                      value={section.compliance_requirements}
                      onChange={(e) =>
                        handleSectionChange(
                          index,
                          "compliance_requirements",
                          e.target.value
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
                    <Textarea
                      value={section.relevant_evaluation_criteria}
                      onChange={(e) =>
                        handleSectionChange(
                          index,
                          "relevant_evaluation_criteria",
                          e.target.value
                        )
                      }
                      placeholder="These are the win themes relevant to the section..."
                    />
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
                    <Textarea
                      value={section.relevant_derived_insights}
                      onChange={(e) =>
                        handleSectionChange(
                          index,
                          "relevant_derived_insights",
                          e.target.value
                        )
                      }
                      placeholder="These are the customer pain points relevant to the section..."
                    />
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
                    <Textarea
                      value={section.relevant_differentiation_factors}
                      onChange={(e) =>
                        handleSectionChange(
                          index,
                          "relevant_differentiation_factors",
                          e.target.value
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
