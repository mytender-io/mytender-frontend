import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faChevronUp,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import DebouncedTextArea from "./DeboucedTextArea";
import "./SlidingSidepane.css";
import { Contributor, Section } from "../views/BidWritingStateManagerView";
import StatusMenu from "../buttons/StatusMenu";
import ReviewerDropdown from "./dropdowns/ReviewerDropdown";
import QuestionTypeDropdown from "./dropdowns/QuestionTypeDropdown";
import SubheadingCards from "./SubheadingCards";
import RegenerateButton from "@/buttons/RegenerateButton";

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
  renderChoices: () => React.ReactNode;
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!section) return null;

  const hasSubheadings = section.subheadings && section.subheadings.length > 0;

  return (
    <>
      <div
        className={`sidepane-backdrop ${isOpen ? "visible" : ""}`}
        onClick={onClose}
      />
      <div className={`sidepane ${isOpen ? "open" : ""}`}>
        <div className="sidepane-content-wrapper">
          <div className="sidepane-header">
            <DebouncedTextArea
              value={section.heading}
              onChange={(value) => {
                handleSectionChange(index, "heading", value);
              }}
              className="section-heading-input"
            />
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="sidepane-content">
            <div className="proposal-header mb-3">
              <div className="navigation-container">
                <div>
                  <button
                    className="nav-button pr-2"
                    onClick={() => onNavigate("prev")}
                    disabled={index === 0}
                    title="Previous section"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <span className="section-counter">
                    Question {index + 1} of {totalSections}
                  </span>
                  <button
                    className="nav-button pl-2"
                    onClick={() => onNavigate("next")}
                    disabled={index === totalSections - 1}
                    title="Next section"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </div>
              <StatusMenu
                value={section.status}
                onChange={(value) => {
                  handleSectionChange(index, "status", value);
                }}
              />
            </div>
            <div className="sidepane-section">
              <div className="proposal-header mb-3">
                <div>
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
                <input
                  type="number"
                  value={section.word_count || 0}
                  min="0"
                  step="50"
                  className="form-control d-inline-block word-count-input"
                  style={{
                    width: "6.875rem",
                    textAlign: "center"
                  }}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      handleSectionChange(index, "word_count", value);
                    }
                  }}
                />
              </div>
            </div>
            <div className="sidepane-section">
              <div className="proposal-header mb-2">
                <div>Question</div>
              </div>
              <DebouncedTextArea
                value={section.question}
                onChange={(value) =>
                  handleSectionChange(index, "question", value)
                }
                placeholder="What is your management policy?"
                className="writingplan-text-area"
              />
            </div>
            {hasSubheadings && (
              <div className="sidepane-section">
                <div className="proposal-header mb-2">
                  <div>Writing Plan</div>
                  <div className="flex items-center">
                    <button
                      className="bg-white rounded-lg p-2 me-2 shadow-sm hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        /* Add your click handler here */
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        className="text-gray-500 h-5 w-5"
                      />
                    </button>
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

            <button
              className="flex items-center w-full py-2 mt-4 mb-4 rounded-md"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span className="mr-2">Advanced</span>
              <FontAwesomeIcon
                icon={showAdvanced ? faChevronUp : faChevronDown}
              />
            </button>

            {showAdvanced && (
              <>
                <div className="sidepane-section">
                  <div className="proposal-header mb-2">
                    Compliance Requirements
                  </div>
                  <DebouncedTextArea
                    value={section.compliance_requirements}
                    onChange={(value) =>
                      handleSectionChange(
                        index,
                        "compliance_requirements",
                        value
                      )
                    }
                    placeholder="These are the compliance requirments relevant to the section..."
                    className="compliance-text-area"
                  />
                </div>
                <div className="sidepane-section">
                  <div className="proposal-header mb-2">
                    Relevant Win Themes
                  </div>
                  <DebouncedTextArea
                    value={section.relevant_evaluation_criteria}
                    onChange={(value) =>
                      handleSectionChange(
                        index,
                        "relevant_evaluation_criteria",
                        value
                      )
                    }
                    placeholder="These are the win themes relevant to the section..."
                    className="compliance-text-area"
                  />
                </div>
                <div className="sidepane-section">
                  <div className="proposal-header mb-2">
                    Relevant Customer Pain Points
                  </div>
                  <DebouncedTextArea
                    value={section.relevant_derived_insights}
                    onChange={(value) =>
                      handleSectionChange(
                        index,
                        "relevant_derived_insights",
                        value
                      )
                    }
                    placeholder="These are the customer pain points relevant to the section..."
                    className="compliance-text-area"
                  />
                </div>
                <div className="sidepane-section">
                  <div className="proposal-header mb-2">
                    Competitor Differentiation Factors
                  </div>
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
                    className="compliance-text-area"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProposalSidepane;
