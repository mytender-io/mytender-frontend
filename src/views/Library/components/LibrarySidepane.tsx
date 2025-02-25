import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { useState } from "react";
import SymbolEqualIcon from "@/components/icons/SymbolEqualIcon";
import { cn } from "@/utils";

const LibrarySidepane = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div
      className={cn(
        "relative border-gray-line transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed
          ? "w-2 border-l-0 shadow-none"
          : "w-[360px] border-1 shadow-lg"
      )}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-2 top-1/2 -translate-y-1/2 bg-gray-line py-2 hover:bg-orange text-gray-hint_text hover:text-white transition-all z-50"
      >
        <SymbolEqualIcon className="rotate-90" />
      </button>
      <div
        className={cn(
          "relative px-4 py-6 border-gray-line",
          isCollapsed ? "border-b-0" : "border-b"
        )}
      >
        <h3
          className={cn(
            "text-xl font-semibold transition-opacity duration-200",
            isCollapsed ? "opacity-0" : "opacity-100"
          )}
        >
          Company Data
        </h3>
      </div>
      <div
        className={cn(
          "transition-opacity duration-200 flex-1 overflow-y-auto",
          isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
        )}
      >
        <Accordion type="multiple" className="text-gray-hint_text">
          <AccordionItem
            value="upload"
            className="p-3 border-dashed border-gray-line"
          >
            <AccordionTrigger className="text-base font-bold bg-transparent">
              What do I upload?
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3">
              <p>
                We recommend you upload everything that a new intern that just
                started at your company would need to create a bid response.
              </p>
              <p>
                This includes all the relevant company details asked in PQQs and
                a (recent) winning bid you have written for every service you
                bid on.
              </p>
              <p>
                The sweet spot is around 3 bids, but 1 will get you off the
                mark!
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="how-used"
            className="p-3 border-dashed border-gray-line"
          >
            <AccordionTrigger className="text-base font-bold bg-transparent">
              How is this information used?
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3">
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
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="storage"
            className="p-3 border-dashed border-gray-line"
          >
            <AccordionTrigger className="text-base font-bold bg-transparent">
              How do we safely store your data?
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3">
              <p>
                Security is key and a pillar of our philosophy at mytender.io.
              </p>
              <p>
                The key point is that your data is in a completely separate area
                and database from any other users of our platform and none of
                your data is used to train any of our own or the models we use.
              </p>
              <p>We are also currently going through an ISO 27001 audit.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="quality" className="p-3 border-none">
            <AccordionTrigger className="text-base font-bold bg-transparent">
              How much does the quality of my data matter?
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3">
              <p>
                A great question! Here's a formula we created to help understand
                its impact:
              </p>
              <p>
                Bid Context Quality = Data Quality + Relevance to Tender Context
                + Integration into the narrative
              </p>
              <p>
                So whilst we often hear people think it is solely reliant on the
                quality of the content uploaded, we believe it is only one
                aspect of the overall equation that supports the contextual
                support of the overall bid.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default LibrarySidepane;
