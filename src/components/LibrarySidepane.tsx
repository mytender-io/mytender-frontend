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
  children?: React.ReactNode; // Add this to accept children props
}

// Main Layout Component
const LibraryLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="library-layout">
      <div className={`library-main-content ${isOpen ? 'sidebar-open' : ''}`}>
        {children}
      </div>
      <LibrarySidepane 
        isOpen={isOpen} 
        onToggle={() => setIsOpen(!isOpen)} 
      />
    </div>
  );
};

const LibrarySidepane: React.FC<LibrarySidepaneProps> = ({
  isOpen,
  onToggle
}) => {
  return (
    <div className={`library-sidepane ${isOpen ? "open" : ""}`}>
      <button onClick={onToggle} className="toggle-button">
        <FontAwesomeIcon
          icon={isOpen ? faChevronRight : faChevronLeft}
          className="toggle-icon"
        />
      </button>
      <div className={`library-sidepane-content ${isOpen ? "visible" : ""}`}>
        <h3 className="content-title">Company Data</h3>
        <div className="accordion-container">
          <AccordionItem title="What do I upload?">
            <p>
              We recommend you upload everything that a new intern that just
              started at your company would need to create a bid response.
            </p>
            <p>
              This includes all the relevant company details asked in PQQs and a
              (recent) winning bid you have written for every service you bid
              on.
            </p>
            <p>
              The sweet spot is around 3 bids, but 1 will get you off the mark!
            </p>
          </AccordionItem>

          <AccordionItem title="How is this information used?">
            <p>
              When you put a question through our system, it firstly considers
              the question, inputs and information from the tender.
            </p>
            <p>
              It looks through the company library to search for the most
              relevant and contextually accurate piece of information to help
              evidence your bid - all without you having to spend hours
              searching through outdated bid libraries.
            </p>
          </AccordionItem>

          <AccordionItem title="How do we safely store your data?">
            <p>
              Security is key and a pillar of our philosophy at mytender.io.
            </p>
            <p>
              The key point is that your data is in a completely separate area
              and database from any other users of our platform and none of your
              data is used to train any of our own or the models we use.
            </p>
            <p>We are also currently going through an ISO 27001 audit.</p>
          </AccordionItem>

          <AccordionItem title="How much does the quality of my data matter?">
            <p>
              A great question! Here's a formula we created to help understand
              its impact:
            </p>
            <p>
              Bid Context Quality = Data Quality + Relevance to Tender Context +
              Integration into the narrative
            </p>
            <p>
              So whilst we often hear people think it is solely reliant on the
              quality of the content uploaded, we believe it is only one aspect
              of the overall equation that supports the contextual support of
              the overall bid.
            </p>
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

export { LibraryLayout, LibrarySidepane };
