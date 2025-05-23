import { useState, useEffect, useContext } from "react";
import ProposalPlan from "@/views/BidOutline/ProposalPlan";
import ProposalPreview from "@/views/ProposalPreview/ProposalPreview";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CollapsibleHeader from "./CollapsibleHeader";
import { BidContext, Section } from "@/views/BidWritingStateManagerView";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StatusMenu from "@/buttons/StatusMenu";
import { toast } from "react-toastify";

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
  const { sharedState, setSharedState } = useContext(BidContext);
  const { outline } = sharedState;

  const totalSections = outline.length;

  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(
    null
  );
  const [activeView, setActiveView] = useState<"plan" | "write">("plan");
  const [activeSection, setActiveSection] = useState<Section | null>(null);

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
      setActiveSection(outline[index]);
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

  const handleSectionChange = async (
    index: number,
    field: keyof Section,
    value: any
  ) => {
    console.log("handleSectionChange", index, field, value);
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

      return true; // Indicate successful update
    } catch (error) {
      console.error("Error updating section:", error);
      toast.error("Failed to update section");
      return false;
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Tabs for switching between Plan and Write views */}
      <Tabs
        defaultValue={activeView}
        value={activeView}
        onValueChange={(value) => {
          setActiveView(value as "plan" | "write");
          handleTabClick(
            value === "plan" ? "/proposal-planner" : "/proposal-preview"
          );
        }}
        className="flex flex-col flex-1 overflow-hidden px-0"
      >
        {/* Collapsible Header */}
        <CollapsibleHeader>
          <TabsList className="w-full max-w-md mx-auto mb-2">
            <TabsTrigger value="plan" className="flex-1">
              Plan
            </TabsTrigger>
            <TabsTrigger value="write" className="flex-1">
              Write
            </TabsTrigger>
          </TabsList>
          <span className="text-gray-hint_text">
            Please detail how you would implement a positive impact on the
            surrounding local community for the contract?
          </span>
          {activeSection && activeSectionIndex !== null && (
            <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1">
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
              <StatusMenu
                value={activeSection.status}
                onChange={(value) =>
                  handleSectionChange(activeSectionIndex, "status", value)
                }
              />
            </div>
          )}
        </CollapsibleHeader>

        {/* Content area for the selected view */}
        <div className="flex-1 overflow-hidden flex flex-col px-6 py-4">
          <TabsContent
            value="plan"
            className="mt-0 flex-1 overflow-auto h-full"
          >
            <ProposalPlan
              openTask={openTask}
              taskToOpen={taskToOpen}
              sectionIndex={sectionIndex}
              handleRegenerateClick={handleRegenerateClick}
              handleTabClick={handleTabClick}
              activeSectionId={activeSectionId}
            />
          </TabsContent>
          <TabsContent
            value="write"
            className="mt-0 flex-1 overflow-auto h-full"
          >
            <ProposalPreview
              yPosition={yPosition}
              activeSectionId={activeSectionId}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ProposalWorkspace;
