import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LibraryLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Wrap children with padding container that responds to sidepane state
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        className: `${child.props.className || ''} ${isOpen ? 'sidepane-open' : ''}`
      });
    }
    return child;
  });

  return (
    <div className="flex min-h-screen w-full relative">
      <div className="flex-1">
        {childrenWithProps}
      </div>
      <LibrarySidepane 
        isOpen={isOpen} 
        onToggle={() => setIsOpen(!isOpen)} 
      />
    </div>
  );
};

const LibrarySidepane = ({ isOpen, onToggle }) => {
  return (
    <div className={`fixed right-0 top-0 h-screen bg-white shadow-lg transition-[width] duration-300 ease-in-out z-50 
      ${isOpen ? 'w-[320px]' : 'w-5'}`}>
      <button 
        onClick={onToggle}
        className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center 
        hover:bg-gray-50 transition-colors duration-200 focus:outline-none"
      >
        {isOpen ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>
      
      <div className={`w-full h-full overflow-y-auto transition-opacity duration-300 px-5 py-4
        ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="text-3xl font-black mb-6">Company Data</h3>
        
        <div className="flex flex-col gap-4">
          <AccordionItem title="What do I upload?">
            <p className="mb-3 text-lg text-gray-600">
              We recommend you upload everything that a new intern that just started at your company would need to create a bid response.
            </p>
            <p className="mb-3 text-lg text-gray-600">
              This includes all the relevant company details asked in PQQs and a (recent) winning bid you have written for every service you bid on.
            </p>
            <p className="text-lg text-gray-600">
              The sweet spot is around 3 bids, but 1 will get you off the mark!
            </p>
          </AccordionItem>

          <AccordionItem title="How is this information used?">
            <p className="mb-3 text-lg text-gray-600">
              When you put a question through our system, it firstly considers the question, inputs and information from the tender.
            </p>
            <p className="text-lg text-gray-600">
              It looks through the company library to search for the most relevant and contextually accurate piece of information to help evidence your bid - all without you having to spend hours searching through outdated bid libraries.
            </p>
          </AccordionItem>

          <AccordionItem title="How do we safely store your data?">
            <p className="mb-3 text-lg text-gray-600">
              Security is key and a pillar of our philosophy at mytender.io.
            </p>
            <p className="mb-3 text-lg text-gray-600">
              The key point is that your data is in a completely separate area and database from any other users of our platform and none of your data is used to train any of our own or the models we use.
            </p>
            <p className="text-lg text-gray-600">
              We are also currently going through an ISO 27001 audit.
            </p>
          </AccordionItem>

          <AccordionItem title="How much does the quality of my data matter?">
            <p className="mb-3 text-lg text-gray-600">
              A great question! Here's a formula we created to help understand its impact:
            </p>
            <p className="mb-3 text-lg text-gray-600">
              Bid Context Quality = Data Quality + Relevance to Tender Context + Integration into the narrative
            </p>
            <p className="text-lg text-gray-600">
              So whilst we often hear people think it is solely reliant on the quality of the content uploaded, we believe it is only one aspect of the overall equation that supports the contextual support of the overall bid.
            </p>
          </AccordionItem>
        </div>
      </div>
    </div>
  );
};


const AccordionItem = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="border-b border-gray-200 pb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left transition-colors duration-200 pt-3 relative pr-8"
      >
        <span className="font-semibold text-gray-800 text-xl">{title}</span>
        <ChevronRight 
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200
            ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>
      <div className={`transition-all duration-200 ease-out overflow-hidden ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
        <div className="pt-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export { LibraryLayout, LibrarySidepane };