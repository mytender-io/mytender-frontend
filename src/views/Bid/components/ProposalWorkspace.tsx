import { useState, useEffect, useContext } from "react";
import ProposalPlan from "@/views/BidOutline/ProposalPlan";
import ProposalPreview from "@/views/ProposalPreview/ProposalPreview";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CollapsibleHeader from "./CollapsibleHeader";
import { BidContext } from "@/views/BidWritingStateManagerView";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/utils";

interface ProposalWorkspaceProps {
  openTask: (taskId: string | null, sectionIndex: string | null) => void;
  taskToOpen: string | null;
  sectionIndex: string | null;
  handleRegenerateClick: () => void;
  handleTabClick: (path: string) => void;
  activeSectionId: string;
  yPosition: number;
  activeTab?: string;
  handleActiveSectionChange: (sectionId: string) => void;
}

const ProposalWorkspace = ({
  openTask,
  taskToOpen,
  sectionIndex,
  handleRegenerateClick,
  handleTabClick,
  activeSectionId,
  handleActiveSectionChange,
  yPosition,
  activeTab
}: ProposalWorkspaceProps) => {
  const { sharedState } = useContext(BidContext);
  const { outline } = sharedState;

  const totalSections = outline.length;

  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(
    null
  );
  const [activeView, setActiveView] = useState<"plan" | "write">("plan");
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right"
  );

  // Initialize the active view based on the activeTab prop
  useEffect(() => {
    if (activeTab === "/proposal-preview") {
      setActiveView("write");
    } else if (activeTab === "/proposal-planner") {
      setActiveView("plan");
    }
  }, [activeTab]);

  useEffect(() => {
    const index = outline.findIndex(
      (section) => section.section_id === activeSectionId
    );
    if (index !== -1) {
      setActiveSectionIndex(index);
      handleActiveSectionChange(outline[index].section_id);
    }
  }, [activeSectionId, outline]);

  const handleSectionNavigation = (direction: "prev" | "next") => {
    if (activeSectionIndex === null) return;

    const newIndex =
      direction === "prev" ? activeSectionIndex - 1 : activeSectionIndex + 1;

    if (newIndex >= 0 && newIndex < outline.length) {
      setActiveSectionIndex(newIndex);
      handleActiveSectionChange(outline[newIndex].section_id);
    }
  };

  const handleViewChange = (value: string) => {
    // Set the slide direction based on the tab change
    if (value === "write" && activeView === "plan") {
      setSlideDirection("left");
    } else if (value === "plan" && activeView === "write") {
      setSlideDirection("right");
    }

    setActiveView(value as "plan" | "write");
    handleTabClick(
      value === "plan" ? "/proposal-planner" : "/proposal-preview"
    );
  };

  // Animation variants
  const slideVariants = {
    rightEnter: {
      x: 300,
      opacity: 0
    },
    leftEnter: {
      x: -300,
      opacity: 0
    },
    center: {
      x: 0,
      opacity: 1
    },
    rightExit: {
      x: 300,
      opacity: 0
    },
    leftExit: {
      x: -300,
      opacity: 0
    }
  };

  return (
    <div className="flex flex-col h-full w-full pb-4">
      {/* Tabs for switching between Plan and Write views */}
      <Tabs
        defaultValue={activeView}
        value={activeView}
        onValueChange={handleViewChange}
        className="flex flex-col flex-1 overflow-hidden px-0"
      >
        <div
          className={cn(
            "flex flex-col gap-2 items-center px-6 pt-6 pb-2 transition-all duration-500 overflow-hidden"
          )}
        >
          <TabsList className="w-full max-w-md mx-auto h-12">
            <TabsTrigger
              value="plan"
              className="flex-1 h-full data-[state=active]:bg-orange-ultra_light data-[state=active]:text-orange"
            >
              Plan
            </TabsTrigger>
            <TabsTrigger
              value="write"
              className="flex-1 h-full data-[state=active]:bg-orange-ultra_light data-[state=active]:text-orange"
              disabled={!activeSectionId}
            >
              Write
            </TabsTrigger>
          </TabsList>
          {activeSectionIndex !== null && (
            <div className="w-full flex items-center justify-start gap-1 max-w-7xl mx-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSectionNavigation("prev")}
                disabled={activeSectionIndex === 0}
                className="w-fit px-2 gap-1"
              >
                <ChevronLeft />
              </Button>
              <span className="text-gray-hint_text">
                Question {activeSectionIndex + 1} of {totalSections}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSectionNavigation("next")}
                disabled={activeSectionIndex === totalSections - 1}
                className="w-fit px-2 gap-1"
              >
                <ChevronRight />
              </Button>
            </div>
          )}
        </div>

        {/* Content area for the selected view */}
        <div className="flex-1 overflow-hidden flex flex-col px-6 pb-4">
          <TabsContent
            value="plan"
            className="mt-0 flex-1 overflow-auto h-full"
            asChild
          >
            <motion.div
              initial={slideDirection === "right" ? "leftEnter" : "rightEnter"}
              animate="center"
              exit={slideDirection === "right" ? "leftExit" : "rightExit"}
              variants={slideVariants}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 overflow-auto h-full max-w-7xl mx-auto"
            >
              <ProposalPlan
                openTask={openTask}
                taskToOpen={taskToOpen}
                sectionIndex={sectionIndex}
                handleRegenerateClick={handleRegenerateClick}
                handleTabClick={handleTabClick}
                activeSectionId={activeSectionId}
                handleActiveSectionChange={handleActiveSectionChange}
              />
            </motion.div>
          </TabsContent>
          <TabsContent
            value="write"
            className="mt-0 flex-1 overflow-auto h-full"
            asChild
          >
            <motion.div
              initial={slideDirection === "right" ? "leftEnter" : "rightEnter"}
              animate="center"
              exit={slideDirection === "right" ? "leftExit" : "rightExit"}
              variants={slideVariants}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 overflow-auto h-full"
            >
              <ProposalPreview
                yPosition={yPosition}
                activeSectionId={activeSectionId}
              />
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ProposalWorkspace;
