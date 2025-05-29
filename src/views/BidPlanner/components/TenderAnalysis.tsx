import { useState, useContext, useEffect, useRef } from "react";
import axios, { AxiosError } from "axios";
import { API_URL, HTTP_PREFIX } from "../../../helper/Constants";
import { BidContext } from "../../BidWritingStateManagerView";
import { useAuthUser } from "react-auth-kit";
import {
  FileText,
  Scale,
  Lightbulb,
  Star,
  RefreshCw,
  Search,
  Brain,
  Sparkles,
  Target,
  Filter,
  Crosshair,
  Gauge,
  ChartBar,
  CheckCircle2,
  Telescope,
  ClipboardCheck,
  FileSearch
} from "lucide-react";
import { MarkdownRenderer } from "@/components/Markdown";
import { toast } from "react-toastify";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import TenderLibraryChatDialog from "@/views/BidPlanner/components/TenderLibraryChat";
import InterrogateTenderDialog from "./InterrogateTender";
import AddCompetitors from "./AddCompetitors";
import { useGeneratingTenderInsightContext } from "@/context/GeneratingTenderInsightContext";
import { TabData, tenderTabs, getTabIndexByStateKey } from "../../../utils/tenderTabsConfig";

interface TenderInsightData {
  requirements?: string;
  analysis?: string;
  summary?: string;
}

// Define a type for the loading step
interface LoadingStep {
  icon: React.ElementType;
  text: string;
}

// Define loading steps for each category
const summariseTenderSteps: LoadingStep[] = [
  { icon: Search, text: "Scanning tender document structure..." },
  { icon: Filter, text: "Identifying key sections and clauses..." },
  { icon: FileText, text: "Extracting core requirements and objectives..." },
  { icon: Gauge, text: "Analyzing document length and complexity..." },
  { icon: Brain, text: "Parsing main topics and themes..." },
  { icon: Sparkles, text: "Generating initial summary draft..." },
  {
    icon: FileSearch,
    text: "Cross-referencing information for consistency..."
  },
  { icon: Lightbulb, text: "Refining summary for clarity and conciseness..." },
  { icon: Target, text: "Highlighting critical action points..." },

  { icon: Sparkles, text: "Structuring summary with key headings..." },
  { icon: FileSearch, text: "Verifying numerical data and figures..." },
  { icon: Lightbulb, text: "Ensuring summary captures client's tone..." },
  { icon: Target, text: "Isolating implicit needs and expectations..." },
  { icon: CheckCircle2, text: "Preparing executive summary version..." }
];

const winThemesSteps: LoadingStep[] = [
  { icon: Scale, text: "Analyzing evaluation criteria..." },
  { icon: Target, text: "Identifying key client success metrics..." },
  { icon: Telescope, text: "Researching client's strategic priorities..." },
  { icon: Crosshair, text: "Mapping our strengths to client needs..." },
  { icon: Brain, text: "Brainstorming compelling value propositions..." },
  { icon: Star, text: "Defining unique selling points (USPs)..." },
  { icon: Lightbulb, text: "Crafting core messaging for win themes..." },
  {
    icon: ClipboardCheck,
    text: "Aligning win themes with tender requirements..."
  },
  { icon: Star, text: "Articulating benefits of our USPs..." },
  { icon: Lightbulb, text: "Testing theme resonance and impact..." },
  { icon: ClipboardCheck, text: "Ensuring themes address all key criteria..." },
  { icon: ChartBar, text: "Quantifying benefits and ROI for client..." },
  { icon: CheckCircle2, text: "Embedding win themes throughout proposal..." }
];

const painPointsSteps: LoadingStep[] = [
  { icon: FileSearch, text: "Reviewing client background information..." },
  { icon: Telescope, text: "Analyzing market context for client pressures..." },
  { icon: Brain, text: "Mapping challenges to potential solutions..." },
  { icon: Target, text: "Prioritizing most critical client issues..." },
  { icon: Lightbulb, text: "Empathizing with client perspective..." },
  { icon: ChartBar, text: "Gathering insights on problem severity..." },
  {
    icon: CheckCircle2,
    text: "Consolidating list of key client pain points..."
  },
  {
    icon: Telescope,
    text: "Assessing industry trends affecting the client..."
  },
  { icon: Brain, text: "Validating solutions against client constraints..." },
  { icon: Gauge, text: "Quantifying the cost of inaction for client..." },
  { icon: Target, text: "Focusing on pain points we can uniquely solve..." },
  { icon: Lightbulb, text: "Articulating pain points in client's language..." },
  {
    icon: ChartBar,
    text: "Corroborating pain points with multiple sources..."
  }
];

const differentiationFactorsSteps: LoadingStep[] = [
  { icon: ChartBar, text: "Analyzing competitive landscape overview..." },
  { icon: Scale, text: "Benchmarking our capabilities against rivals..." },
  { icon: Search, text: "Pinpointing gaps in competitor offerings..." },
  { icon: Lightbulb, text: "Showcasing our innovative approaches..." },
  { icon: Star, text: "Emphasizing superior service or quality..." },
  { icon: FileText, text: "Leveraging past successes and testimonials..." },
  { icon: Brain, text: "Defining clear differentiating messages..." },
  {
    icon: CheckCircle2,
    text: "Preparing strategy to outperform competition..."
  },
  { icon: ChartBar, text: "Mapping competitor positioning and strategies..." },
  { icon: Telescope, text: "Researching competitor client feedback..." },
  { icon: Scale, text: "Identifying our relative market position..." },
  { icon: Search, text: "Exploring unmet client needs in the market..." },
  {
    icon: Sparkles,
    text: "Detailing our intellectual property and patents..."
  },

  { icon: Star, text: "Providing evidence of customer satisfaction..." }
];

const complianceRequirementsSteps: LoadingStep[] = [
  { icon: FileSearch, text: "Scanning for mandatory requirements sections..." },
  { icon: Filter, text: "Extracting all compliance-related clauses..." },
  { icon: ClipboardCheck, text: "Creating detailed compliance checklist..." },
  { icon: FileText, text: "Verifying document submission formats..." },
  { icon: Scale, text: "Checking for legal and regulatory obligations..." },
  { icon: Brain, text: "Cross-referencing against internal policies..." },
  { icon: Crosshair, text: "Identifying potential compliance risks..." },
  { icon: Target, text: "Confirming all necessary certifications..." },
  { icon: Sparkles, text: "Preparing compliance matrix..." },
  {
    icon: CheckCircle2,
    text: "Final review of all compliance documentation..."
  }
];

const genericLoadingSteps: LoadingStep[] = [
  { icon: Search, text: "Scanning tender documents..." },
  { icon: Filter, text: "Filtering relevant sections..." },
  { icon: FileText, text: "Extracting key requirements..." },
  { icon: Target, text: "Identifying evaluation criteria..." },
  { icon: Brain, text: "Processing requirements..." },
  { icon: Crosshair, text: "Detecting critical success factors..." },
  { icon: ChartBar, text: "Analysing competitive landscape..." },
  { icon: Gauge, text: "Evaluating market positioning..." },
  { icon: Telescope, text: "Exploring strategic opportunities..." },
  { icon: Lightbulb, text: "Generating innovative insights..." },
  { icon: CheckCircle2, text: "Finalizing recommendations..." },
  { icon: Sparkles, text: "Polishing final output..." },
  { icon: Search, text: "Deep scanning annexes and addenda..." },
  { icon: Filter, text: "Prioritizing high-value sections..." },
  { icon: FileText, text: "Deconstructing complex requirements..." },
  { icon: Target, text: "Aligning criteria with solution capabilities..." },
  { icon: Brain, text: "Synthesizing diverse data inputs..." },
  { icon: Crosshair, text: "Mapping success factors to bid strategy..." },
  { icon: ChartBar, text: "Projecting potential bid outcomes..." },
  { icon: Gauge, text: "Calibrating strategic fit with tender..." },
  { icon: Telescope, text: "Uncovering latent needs and possibilities..." },
  { icon: Lightbulb, text: "Structuring insights for clarity..." },
  { icon: CheckCircle2, text: "Validating recommendations with data..." },
  { icon: Sparkles, text: "Ensuring compelling narrative flow..." }
];

export type LoadingCategory =
  | "Summarise Tender"
  | "Win Themes"
  | "Pain Points"
  | "Differentiation Factors"
  | "Compliance Requirements"
  | "Generic";

interface LoadingStateProps {
  loadingCategory: LoadingCategory;
}

const LoadingState = ({ loadingCategory }: LoadingStateProps) => {
  const [activeStep, setActiveStep] = useState(0);

  const getStepsForCategory = (category: LoadingCategory): LoadingStep[] => {
    switch (category) {
      case "Summarise Tender":
        return summariseTenderSteps;
      case "Win Themes":
        return winThemesSteps;
      case "Pain Points":
        return painPointsSteps;
      case "Differentiation Factors":
        return differentiationFactorsSteps;
      case "Compliance Requirements":
        return complianceRequirementsSteps;
      default:
        return genericLoadingSteps; // Fallback to generic steps
    }
  };

  const steps = getStepsForCategory(loadingCategory);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500); // User updated this value
    return () => clearInterval(interval);
  }, [steps]); // Add steps to dependency array to re-init if category changes while loading (though unlikely)

  return (
    <div className={cn("w-96")}>
      <div className={cn("flex flex-col space-y-3")}>
        <div className="p-2">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center space-x-4 p-2 rounded-lg transition-all duration-300",
                  index === activeStep
                    ? "opacity-100 bg-orange-50"
                    : "opacity-30"
                )}
              >
                <StepIcon
                  className={cn(
                    "w-5 h-5 text-orange",
                    index === activeStep && "animate-pulse"
                  )}
                />
                <span className={cn("text-gray-800 font-medium text-sm")}>
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const TenderAnalysis = ({
  activeSubTab,
  setActiveSubTab
}: {
  activeSubTab: string;
  setActiveSubTab: (subTab: string) => void;
}) => {
  const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);
  // const [loadingBidTab, setLoadingBidTab] = useState(null);
  const {
    loadingBidTab,
    setLoadingBidTab,
    generate_tender_insights,
    tenderInsight,
    setTenderInsight,
    generatingInsightError
  } = useGeneratingTenderInsightContext();
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const { sharedState, setSharedState } = useContext(BidContext);
  const getAuth = useAuthUser();
  const auth = getAuth();
  const mounted = useRef(false);
  const regenerateBtnRef = useRef<HTMLButtonElement | null>(null);

  // Add a type for the shared state keys to satisfy the compiler for computed property names
  type SharedStateKeys = keyof typeof sharedState;

  const [editMode, setEditMode] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  const {
    object_id,
    tender_summary,
    evaluation_criteria,
    derive_insights,
    differentiation_opportunities,
    compliance_requirements
  } = sharedState;

  const [tabContent, setTabContent] = useState({
    0: tender_summary || "",
    1: evaluation_criteria || "",
    2: derive_insights || "",
    3: differentiation_opportunities || "",
    4: compliance_requirements || ""
  });

  // Use the shared tabs configuration
  const tabs = tenderTabs;

  // Set initial tab based on activeSubTab prop
  useEffect(() => {
    if (activeSubTab) {
      const tabIndex = getTabIndexByStateKey(activeSubTab);
      if (loadingBidTab === null) {
        setCurrentTabIndex(tabIndex);
      }
    }
  }, [activeSubTab, loadingBidTab]);

  useEffect(() => {
    mounted.current = true;
    setTabContent({
      0: tender_summary || "",
      1: evaluation_criteria || "",
      2: derive_insights || "",
      3: differentiation_opportunities || "",
      4: compliance_requirements || ""
    });
    return () => {
      mounted.current = false;
    };
  }, [
    tender_summary,
    evaluation_criteria,
    derive_insights,
    differentiation_opportunities,
    compliance_requirements
  ]);

  const handleTabChange = (_event: unknown, newValue: number) => {
    if (loadingBidTab !== null) {
      toast.warning("Please wait until the current generation completes.");
      return;
    }

    setCurrentTabIndex(newValue); // Only handle the tab switch
    setActiveSubTab(tabs[newValue].stateKey);
  };

  const assign_insights_to_questions = async (
    bid_intel_type: string | undefined,
    tab: TabData
  ) => {
    // Return early if no extract_insights_prompt exists on the tab
    if (!tab.extract_insights_prompt) {
      return;
    }

    if (!object_id) {
      toast.warning("Please save the bid first.");
      return;
    }

    const formData = new FormData();
    formData.append("bid_id", object_id);
    if (bid_intel_type) {
      formData.append("bid_intel_type", bid_intel_type);
    }
    // Ensure extract_insights_prompt is a string before appending
    if (tab.extract_insights_prompt) {
      formData.append("extract_insights_prompt", tab.extract_insights_prompt);
    }

    const result = await axios.post(
      `http${HTTP_PREFIX}://${API_URL}/assign_insights_to_outline_questions`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    setSharedState((prev) => ({
      ...prev,
      outline: result.data
    }));
  };

  const handleTabClick = async (index: number) => {
    if (loadingBidTab !== null) {
      toast.warning("Please wait until the current generation completes.");
      return;
    }
    setCurrentTabIndex(index);
    console.log("tab click");

    if (tabContent[index as keyof typeof tabContent]?.trim()) return; // Only return if there's actual content
    if (!object_id) {
      toast.warning("Please save the bid first.");
      return;
    }

    const tab = tabs[index];

    // Use special handler for compliance tab
    if (tab.prompt === "generate_compliance") {
      handleCompliance(index);
      return;
    }

    setLoadingBidTab(index);

    try {
      const formData = new FormData();
      formData.append("bid_id", object_id);
      formData.append("prompt", tab.prompt);

      const endpoint =
        tab.prompt === "generate_differentiation_opportunities"
          ? `generate_differentiation_opportunities`
          : `generate_tender_insights`;

      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/${endpoint}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const generatedContent = result.data.requirements || result.data.analysis;
      setTabContent((prev) => ({ ...prev, [index]: generatedContent }));
      setSharedState((prev) => ({
        ...prev,
        [tab.stateKey as SharedStateKeys]: generatedContent
      }));

      // Only update summary if it exists in response and we have a summaryKey
      if (result.data.summary && tab.summaryKey) {
        setSharedState((prev) => ({
          ...prev,
          [tab.summaryKey as SharedStateKeys]: result.data.summary
        }));
      }

      // Pass the tab object to assign_insights_to_questions
      await assign_insights_to_questions(tab.summaryKey, tab);
      toast.success("Generated successfully!");
    } catch (error) {
      console.log(error);
      let errorMsg = "An error occurred while generating. Please try again.";
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          errorMsg =
            "No documents found in the tender library. Please upload documents before generating";
          toast.warning(errorMsg);
        } else {
          toast.error(errorMsg);
        }
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoadingBidTab(null);
    }
  };

  const handleCompliance = async (index: number) => {
    if (!object_id) {
      toast.warning("Please save the bid first.");
      return;
    }

    const tab = tabs[index];
    setLoadingBidTab(index);

    try {
      const formData = new FormData();
      formData.append("bid_id", object_id);

      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/generate_compliance_requirements`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (mounted.current) {
        console.log(result.data);
        const generatedContent = result.data;
        console.log(generatedContent);
        setTabContent((prev) => ({ ...prev, [index]: generatedContent }));
        setSharedState((prev) => ({
          ...prev,
          [tab.stateKey as SharedStateKeys]: generatedContent
        }));

        toast.success("Compliance requirements generated successfully!");
      }
    } catch (error) {
      if (mounted.current) {
        let errorMsg =
          "An error occurred while generating compliance requirements. Please try again.";
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 404) {
            errorMsg =
              "No documents found in the tender library. Please upload documents before generating";
            toast.warning(errorMsg);
          } else {
            toast.error(errorMsg);
          }
        } else {
          toast.error(errorMsg);
        }
      }
    } finally {
      if (mounted.current) {
        setLoadingBidTab(null);
      }
    }
  };

  const handleRegenerateClick = async (
    index: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    if (!object_id) {
      toast.warning("Please save the bid first.");
      return;
    }

    const tab = tabs[index];
    setLoadingBidTab(index);
    setCurrentTabIndex(index);

    if (tab.prompt === "generate_compliance") {
      handleCompliance(index);
      return;
    }

    const formData = new FormData();
    formData.append("bid_id", object_id);
    formData.append("prompt", tab.prompt);

    const endpoint =
      tab.prompt === "generate_differentiation_opportunities"
        ? `generate_differentiation_opportunities`
        : `generate_tender_insights`;

    await generate_tender_insights(endpoint, formData, mounted);

    if (generatingInsightError) {
      setLoadingBidTab(null);
      toast.error(generatingInsightError);
    }
  };

  // const handleEditClick = (index: number, content: string) => {
  //   setEditMode(index);
  //   setEditContent(content);
  // };

  // const handleSaveEdit = async (index: number) => {
  //   try {
  //     const tab = tabs[index];
  //     setTabContent((prev) => ({ ...prev, [index]: editContent }));
  //     setSharedState((prev) => ({
  //       ...prev,
  //       [tab.stateKey as SharedStateKeys]: editContent
  //     }));
  //     setEditMode(null);
  //     toast.success("Content updated successfully!");
  //   } catch (err) {
  //     toast.error("Failed to save changes");
  //   }
  // };

  const renderContent = (content: string, index: number) => {
    // if (editMode === index) {
    //   return (
    //     <div className="flex flex-col gap-4 h-full">
    //       <textarea
    //         value={editContent}
    //         onChange={(e) => setEditContent(e.target.value)}
    //         className="w-full flex-1 p-4 border rounded-md font-mono outline-none"
    //       />
    //       <div className="flex gap-2">
    //         <Button onClick={() => handleSaveEdit(index)}>Save</Button>
    //         <Button variant="outline" onClick={() => setEditMode(null)}>
    //           Cancel
    //         </Button>
    //       </div>
    //     </div>
    //   );
    // }

    return (
      <div key={index} className="pb-4">
        <MarkdownRenderer content={content} />
      </div>
    );
  };

  useEffect(() => {
    const handleTenderInsight = async () => {
      if (generatingInsightError) {
        setLoadingBidTab(null);
        toast.error(generatingInsightError);
      }

      if (
        mounted.current &&
        tenderInsight &&
        loadingBidTab !== null &&
        object_id
      ) {
        const tab = tabs[loadingBidTab];
        const insightData = tenderInsight.data as TenderInsightData;

        const generatedContent =
          insightData.requirements || insightData.analysis;

        setTabContent((prev) => ({
          ...prev,
          [loadingBidTab]: generatedContent
        }));
        setSharedState((prev) => ({
          ...prev,
          [tab.stateKey as SharedStateKeys]: generatedContent
        }));

        if (insightData.summary && tab.summaryKey) {
          setSharedState((prev) => ({
            ...prev,
            [tab.summaryKey as SharedStateKeys]: insightData.summary
          }));
        }

        await assign_insights_to_questions(tab.summaryKey, tab);
        toast.success("Regenerated successfully!");
        setLoadingBidTab(null);
        setTenderInsight(null);
      }
    };

    handleTenderInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenderInsight, loadingBidTab, object_id, generatingInsightError]);

  useEffect(() => {
    if (loadingBidTab) {
      setCurrentTabIndex(loadingBidTab);
    }
  }, [loadingBidTab, currentTabIndex]);

  return (
    <div>
      {/* <div className="bg-gray-100 border border-gray-line rounded-md p-2 mb-4">
        <div className="flex w-full items-center gap-2">
          <Button
            onClick={() => setChatDialogOpen(true)}
            variant="outline"
            className="w-full justify-start border-gray-spacer_light hover:bg-background hover:text-current"
          >
            <div className="flex items-center space-x-3">
              <FileSearch className="h-5 w-5 text-gray" />
              <span className="text-gray-hint_text font-medium">
                Ask questions about the tender...
              </span>
            </div>
          </Button>

          {object_id && (
            <TenderLibraryChatDialog
              bid_id={object_id}
              open={chatDialogOpen}
              onOpenChange={setChatDialogOpen}
            />
          )}

          {object_id && (
            <InterrogateTenderDialog
              bid_id={object_id}
              triggerComponent={
                <Button>
                  <Search className="h-5 w-5 text-white" />
                  Query Docs
                </Button>
              }
            />
          )}
        </div>
      </div> */}
      <div className={cn("h-full border border-gray-line rounded-md mb-4")}>
        <Tabs
          value={currentTabIndex.toString()}
          onValueChange={(value) => handleTabChange(null, parseInt(value))}
          className={cn("flex flex-col w-full h-full")}
        >
          <TabsList
            className={cn(
              "w-full justify-start border-b border-gray-line h-auto py-0 px-0 rounded-none grid grid-cols-5"
            )}
          >
            {tabs.map((tab, index) => {
              const TabIcon = tab.Icon;
              return (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  onClick={() => handleTabClick(index)}
                  className={cn(
                    "relative flex items-center justify-center gap-2 px-6 py-3 data-[state=active]:text-orange bg-transparent w-full min-w-0",
                    "min-w-0"
                  )}
                  disabled={loadingBidTab !== null && loadingBidTab !== index}
                >
                  {loadingBidTab === index && object_id && (
                    <div
                      className={cn(
                        "absolute top-14 left-0 z-10 bg-white rounded-lg shadow-2xl"
                      )}
                    >
                      <LoadingState
                        loadingCategory={tab.name as LoadingCategory}
                      />
                    </div>
                  )}
                  <TabIcon
                    size={16}
                    className={cn(
                      "transition-colors",
                      currentTabIndex === index
                        ? "text-orange"
                        : "text-gray-600 hover:text-orange"
                    )}
                  />
                  <span className={cn("font-medium")}>{tab.name}</span>
                  {tabContent[index as keyof typeof tabContent] && (
                    <Button
                      ref={regenerateBtnRef}
                      onClick={(e) => handleRegenerateClick(index, e)}
                      variant="ghost"
                      size="icon"
                      disabled={loadingBidTab !== null || !object_id}
                      className={cn(
                        "bg-gray-line hover:bg-orange-100 hover:text-orange h-6 w-6 min-w-6",
                        currentTabIndex === index &&
                          (loadingBidTab !== index
                            ? "bg-orange-100"
                            : "bg-transparent"),
                        loadingBidTab === index && "animate-spin"
                      )}
                    >
                      <RefreshCw size={14} />
                    </Button>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <div>
            {tabs.map((tab, index) => (
              <TabsContent
                key={index}
                value={index.toString()}
                className="h-full pt-0 mt-0"
              >
                <div className={cn("relative px-8 py-4 h-full")}>
                  {tab.stateKey === "differentiation_opportunities" &&
                    object_id && (
                      <AddCompetitors
                        setTabContent={setTabContent}
                        setSharedState={setSharedState}
                      />
                    )}
                  {/* {editMode !== index && (
                    <div className="text-right mb-4">
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleEditClick(
                            index,
                            tabContent[index as keyof typeof tabContent] || ""
                          )
                        }
                      >
                        <FileText className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  )} */}
                  {renderContent(
                    tabContent[index as keyof typeof tabContent] || "",
                    index
                  )}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default TenderAnalysis;
