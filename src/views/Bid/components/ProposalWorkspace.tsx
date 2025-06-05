import { useState, useEffect, useContext, useRef } from "react";
import ProposalPlan from "@/views/BidOutline/ProposalPlan";
import ProposalPreview from "@/views/ProposalPreview/ProposalPreview";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BidContext } from "@/views/BidWritingStateManagerView";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  PlusIcon,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/utils";
import GenerateProposalModal from "@/modals/GenerateProposalModal";
import { GenerationProvider } from "@/context/GeneratingSectionContext";
import SelectOrganisationUserButton from "@/buttons/SelectOrganisationUserButton";
import { useUserData } from "@/context/UserDataContext";
import { useAuthUser } from "react-auth-kit";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import { toast } from "react-toastify";
import sendOrganizationEmail from "@/helper/sendOrganisationEmail";
import { Input } from "@/components/ui/input";
import DebouncedTextArea from "@/views/BidOutline/components/DebouncedTextArea";
import StatusMenu from "@/buttons/StatusMenu";

interface ProposalWorkspaceProps {
  openTask: (taskId: string | null, sectionIndex: string | null) => void;
  taskToOpen: string | null;
  sectionIndex: string | null;
  handleRegenerateClick: () => void;
  handleTabClick: (
    path: string,
    isParentTab?: boolean,
    sectionId?: string
  ) => void;
  activeSectionId: string;
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
  activeTab
}: ProposalWorkspaceProps) => {
  const { sharedState, setSharedState } = useContext(BidContext);
  const { outline } = sharedState;
  const { organizationUsers } = useUserData();

  const totalSections = outline.length;

  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(
    null
  );
  const [activeView, setActiveView] = useState<"plan" | "write">("plan");
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right"
  );

  // Add new state for heading width
  const [headingWidth, setHeadingWidth] = useState<number>(0);
  const textMeasureRef = useRef<HTMLSpanElement>(null);

  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  // Initialize the active view based on the activeTab prop
  useEffect(() => {
    if (activeTab === "/proposal-preview") {
      setActiveView("write");
    } else if (activeTab === "/proposal-planner") {
      setActiveView("plan");
    }
  }, [activeTab]);

  useEffect(() => {
    //set active sectionindex to null if there is no active section
    if (activeSectionId === "") {
      setActiveSectionIndex(null);
      return;
    }

    const index = outline.findIndex(
      (section) => section.section_id === activeSectionId
    );
    if (index !== -1) {
      setActiveSectionIndex(index);
      handleActiveSectionChange(outline[index].section_id);
    }
  }, [activeSectionId, outline, handleActiveSectionChange]);

  // Update width based on heading content
  useEffect(() => {
    const activeSection =
      activeSectionIndex !== null ? outline[activeSectionIndex] : null;
    if (activeSection?.heading && textMeasureRef.current) {
      // Set the text content of the hidden span to match the input value
      textMeasureRef.current.textContent = activeSection.heading;
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
  }, [outline, activeSectionIndex]);

  const handleSectionChange = async (
    index: number,
    field: string,
    value: any
  ) => {
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

  // 1. Modified handleAnswererSelect function to include the correct user assignment and priority
  const handleAnswererSelect = async (user: {
    username?: string;
    email?: string;
  }) => {
    if (!activeSectionIndex) return;

    // Extract the username and email from the user object
    const username = user.username || "";
    const email = user.email || "";
    const section = outline[activeSectionIndex];

    // Skip if no email is provided
    if (!email) {
      handleSectionChange(activeSectionIndex, "answerer", username);
      return;
    }

    // Update the section with the new answerer
    const success = await handleSectionChange(
      activeSectionIndex,
      "answerer",
      username
    );

    if (success) {
      // After successfully setting the answerer, create a task for them
      try {
        const taskData = {
          name: `Answer section: ${section.heading}`,
          bid_id: sharedState.object_id,
          index: activeSectionIndex,
          priority: "medium", // Adding priority parameter
          target_user: username // Adding explicit target_user parameter
        };

        // Create the task
        const response = await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/set_user_task`,
          taskData,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`
            }
          }
        );

        if (response.data.success) {
          // Task created successfully, now send email notification
          const bidTitle = sharedState.bidInfo || "Untitled Bid";
          const message = `You have been assigned to answer the section "${section.heading}" in bid "${bidTitle}". You can access this task from your dashboard.`;
          const subject = `New Answer Task: ${section.heading}`;

          // Send the email notification
          await sendOrganizationEmail({
            recipient: email,
            message,
            subject,
            token: tokenRef.current,
            onSuccess: () => {},
            onError: (error) => {}
          });
        } else {
          console.error("Error creating answer task:", response.data.error);
          toast.error("Failed to assign task to answerer");
        }
      } catch (error) {
        console.error("Error creating task for answerer:", error);
        toast.error("Failed to assign task to answerer");
      }
    }
  };

  // 2. Modified handleReviewerSelect function to include the correct user assignment and priority
  const handleReviewerSelect = async (user: {
    username?: string;
    email?: string;
  }) => {
    if (!activeSectionIndex) return;

    // Extract the username and email from the user object
    const username = user.username || "";
    const email = user.email || "";
    const section = outline[activeSectionIndex];

    // Skip if no email is provided
    if (!email) {
      handleSectionChange(activeSectionIndex, "reviewer", username);
      return;
    }

    // Update the section with the new reviewer
    const success = await handleSectionChange(
      activeSectionIndex,
      "reviewer",
      username
    );

    if (success) {
      // After successfully setting the reviewer, create a task for them
      try {
        const taskData = {
          name: `Review section: ${section.heading}`,
          bid_id: sharedState.object_id,
          index: activeSectionIndex,
          priority: "high", // Adding priority parameter with higher priority for reviews
          target_user: username // Adding explicit target_user parameter
        };

        // Create the task
        const response = await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/set_user_task`,
          taskData,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`
            }
          }
        );

        if (response.data.success) {
          // Task created successfully, now send email notification
          const bidTitle = sharedState.bidInfo || "Untitled Bid";
          const message = `You have been assigned to review the section "${section.heading}" in bid "${bidTitle}". You can access this task from your dashboard.`;
          const subject = `New Review Task: ${section.heading}`;

          // Send the email notification
          await sendOrganizationEmail({
            recipient: email,
            message,
            subject,
            token: tokenRef.current,
            onSuccess: () => {},
            onError: (error) => {}
          });
        } else {
          console.error("Error creating reviewer task:", response.data.error);
          toast.error("Failed to assign task to reviewer");
        }
      } catch (error) {
        console.error("Error creating task for reviewer:", error);
        toast.error("Failed to assign task to reviewer");
      }
    }
  };

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

  const switchToNextTab = () => {
    if (activeView === "plan" && activeSectionId) {
      handleViewChange("write");
    }
  };

  const switchToPrevTab = () => {
    if (activeView === "write") {
      handleViewChange("plan");
    }
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

  // Get the current active section
  const activeSection =
    activeSectionIndex !== null ? outline[activeSectionIndex] : null;

  return (
    <GenerationProvider>
      <div className="flex flex-col h-full w-full relative">
        {/* Hidden span to measure text width */}
        <span
          ref={textMeasureRef}
          className="absolute opacity-0 pointer-events-none font-bold md:text-lg whitespace-nowrap"
          aria-hidden="true"
        />

        {/* Tab switching arrows */}
        {activeSectionIndex !== null && (
          <>
            {activeView === "write" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={switchToPrevTab}
                className="absolute left-2 top-1/3 z-10 bg-orange-ultra_light hover:bg-orange-lighter shadow-md h-20 w-8 rounded-r-md [&_svg]:size-6"
                aria-label="Switch to Plan view"
              >
                <ArrowLeft />
              </Button>
            )}
            {activeView === "plan" && activeSectionId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={switchToNextTab}
                className="absolute right-2 top-1/3 z-[999] bg-orange-ultra_light hover:bg-orange-lighter shadow-md h-20 w-8 rounded-l-md [&_svg]:size-6"
                aria-label="Switch to Write view"
              >
                <ArrowRight />
              </Button>
            )}
          </>
        )}
        {activeSectionIndex !== null && (
          <div className="absolute top-1 left-1 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSectionNavigation("prev")}
              disabled={activeSectionIndex === 0}
            >
              <ChevronLeft />
            </Button>
            <span className="text-sm text-gray-hint_text">
              Question {activeSectionIndex + 1} of {totalSections}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSectionNavigation("next")}
              disabled={activeSectionIndex === totalSections - 1}
            >
              <ChevronRight />
            </Button>
          </div>
        )}

        {/* User assignment controls moved to top right */}
        {activeSectionIndex !== null && activeSection && (
          <div
            className={cn(
              "absolute top-1 flex items-center gap-2 z-10",
              activeView === "plan" ? "right-1" : "right-14"
            )}
          >
            {/* Assigned User */}
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">Answerer:</span>
              <SelectOrganisationUserButton
                selectedUser={activeSection.answerer}
                onSelectUser={handleAnswererSelect}
                organizationUsers={organizationUsers}
                isReviewReady={activeSection.review_ready}
              />
            </div>
            {/* Reviewer */}
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">Reviewer:</span>
              <SelectOrganisationUserButton
                selectedUser={activeSection.reviewer}
                onSelectUser={handleReviewerSelect}
                organizationUsers={organizationUsers}
              />
            </div>
          </div>
        )}

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
            {activeSectionIndex !== null ? (
              <div className="w-full">
                <TabsList className="flex justify-center w-fit mx-auto h-12 bg-transparent">
                  <TabsTrigger
                    value="plan"
                    className="flex-1 h-full data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:text-orange px-6 w-fit text-lg"
                  >
                    Plan
                  </TabsTrigger>
                  <TabsTrigger
                    value="write"
                    className="flex-1 h-full data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:text-orange px-6 w-fit text-lg"
                    disabled={!activeSectionId}
                  >
                    Write
                  </TabsTrigger>
                </TabsList>
              </div>
            ) : (
              <div className="flex items-center justify-end flex-shrink-0 gap-2 mb-4 w-full">
                <Button variant="outline" onClick={handleRegenerateClick}>
                  <PlusIcon />
                  New Outline
                </Button>
                <GenerateProposalModal
                  bid_id={sharedState.object_id || ""}
                  handleTabClick={handleTabClick}
                />
              </div>
            )}

            {/* Add heading and question section */}
            {activeSection && activeSectionIndex !== null && (
              <div className="flex flex-col w-full gap-2 mt-2 max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between gap-2 p-1">
                  <div className="flex items-center">
                    <Input
                      value={activeSection.heading}
                      onChange={(e) =>
                        handleSectionChange(
                          activeSectionIndex,
                          "heading",
                          e.target.value
                        )
                      }
                      className="font-bold resize-none overflow-hidden whitespace-nowrap min-h-[1.75rem] bg-transparent border-none focus:ring-0 shadow-none md:text-lg px-0 focus-visible:ring-0"
                      style={{
                        width: headingWidth ? `${headingWidth}px` : "auto"
                      }}
                    />
                    <StatusMenu
                      minimize
                      value={activeSection.status}
                      onChange={(value) => {
                        handleSectionChange(
                          activeSectionIndex,
                          "status",
                          value
                        );
                      }}
                    />
                  </div>
                </div>
                <DebouncedTextArea
                  value={activeSection.question}
                  onChange={(value) =>
                    handleSectionChange(activeSectionIndex, "question", value)
                  }
                  rows={3}
                  className="w-full focus:outline-none focus-visible:ring-0 overflow-y-auto font-medium md:text-base shadow-none border-none p-0 rounded-lg !leading-relaxed min-h-0"
                  placeholder="Add in the question here"
                />
              </div>
            )}
          </div>

          {/* Content area for the selected view */}
          <div className="flex-1 flex flex-col px-6 overflow-y-auto">
            <TabsContent
              value="plan"
              className="mt-0 flex-1 overflow-auto h-full"
              asChild
            >
              <motion.div
                initial={
                  slideDirection === "right" ? "leftEnter" : "rightEnter"
                }
                animate="center"
                exit={slideDirection === "right" ? "leftExit" : "rightExit"}
                variants={slideVariants}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex-1 overflow-auto h-full pb-4"
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
                initial={
                  slideDirection === "right" ? "leftEnter" : "rightEnter"
                }
                animate="center"
                exit={slideDirection === "right" ? "leftExit" : "rightExit"}
                variants={slideVariants}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex-1 overflow-auto h-full"
              >
                <ProposalPreview activeSectionId={activeSectionId} />
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </GenerationProvider>
  );
};

export default ProposalWorkspace;
