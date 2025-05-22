import { useState, useEffect } from "react";
import ProposalPlan from "@/views/BidOutline/ProposalPlan";
import ProposalPreview from "@/views/ProposalPreview/ProposalPreview";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/utils";
import CollapsibleHeader from "./CollapsibleHeader";

interface ProposalWorkspaceProps {
  openTask: (taskId: string | null, sectionIndex: string | null) => void;
  taskToOpen: string | null;
  sectionIndex: string | null;
  handleRegenerateClick: () => void;
  handleTabClick: (path: string) => void;
  activeSubTab: string;
  yPosition: number;
  activeTab?: string;
}

const ProposalWorkspace = ({
  openTask,
  taskToOpen,
  sectionIndex,
  handleRegenerateClick,
  handleTabClick,
  activeSubTab,
  yPosition,
  activeTab
}: ProposalWorkspaceProps) => {
  const [activeView, setActiveView] = useState<"plan" | "write">("plan");

  // Initialize the active view based on the activeTab prop
  useEffect(() => {
    if (activeTab === "/proposal-preview") {
      setActiveView("write");
    } else if (activeTab === "/proposal-planner") {
      setActiveView("plan");
    }
  }, [activeTab]);

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
          <TabsList className="w-full max-w-md mx-auto">
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
              activeSubTab={activeSubTab}
            />
          </TabsContent>
          <TabsContent
            value="write"
            className="mt-0 flex-1 overflow-auto h-full"
          >
            <ProposalPreview yPosition={yPosition} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ProposalWorkspace;
