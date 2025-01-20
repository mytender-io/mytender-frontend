import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import "./LibrarySidepane.css";

interface LibrarySidepaneProps {
  isOpen: boolean;
  onToggle: () => void;
}

const LibrarySidepane: React.FC<LibrarySidepaneProps> = ({
  isOpen,
  onToggle
}) => {
  return (
    <div className={`library-sidepane ${isOpen ? "open" : ""}`}>
      {/* Toggle button */}
      <button onClick={onToggle} className="toggle-button">
        <FontAwesomeIcon
          icon={isOpen ? faChevronRight : faChevronLeft}
          className="toggle-icon"
        />
      </button>
      {/* Main content */}
      <div className={`sidepane-content ${isOpen ? "visible" : ""}`}>
        <h3 className="content-title">Company Data</h3>
        {/* Accordion sections */}
        <div className="accordion-container">
          <AccordionItem title="What do I upload?">
            Upload documents, spreadsheets, and other relevant company files
            that you want to manage and organize.
          </AccordionItem>
          <AccordionItem title="How is this information used?">
            This information is securely stored and organized for easy access
            and management within your library.
          </AccordionItem>
          <AccordionItem title="How much does the quality of my data matter?">
            High-quality, well-organized data ensures better searchability and
            usability of your content library.
          </AccordionItem>
        </div>
      </div>
    </div>
  );
};

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(true); // Changed initial state to true
  return (
    <div className="accordion-item">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="accordion-button"
      >
        <div className="accordion-content-wrapper">
          <FontAwesomeIcon
            icon={isExpanded ? faChevronRight : faChevronLeft}
            className={`accordion-icon ${isExpanded ? "expanded" : ""}`}
          />
          <span className="accordion-title">{title}</span>
        </div>
      </button>
      <div className={`accordion-content ${isExpanded ? "expanded" : ""}`}>
        <div className="accordion-body">{children}</div>
      </div>
    </div>
  );
};

export default LibrarySidepane;
