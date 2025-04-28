import { useState, useContext, useEffect, useRef, useCallback } from "react";
import axios from "axios";
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "react-toastify";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import TenderLibraryChatDialog from "@/views/BidPlanner/components/TenderLibraryChat";
import InterrogateTenderDialog from "./InterrogateTender";
import AddCompetitors from "./AddCompetitors";
import { useLoading } from "@/context/LoadingContext";
import { useGeneratingTenderInsightContext } from "@/context/GeneratingTenderInsightContext";

const LoadingState = () => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
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
    { icon: Sparkles, text: "Polishing final output..." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1265.625);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("w-80")}>
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

const TenderAnalysis = () => {
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

  const tabs = [
    {
      name: "Summarise Tender",
      Icon: FileText,
      prompt: "generate_summarise_tender",
      stateKey: "tender_summary"
    },
    {
      name: "Win Themes",
      Icon: Scale,
      prompt: "generate_evaluation_criteria",
      stateKey: "evaluation_criteria",
      summaryKey: "win_themes",
      extract_insights_prompt: "extract_section_evaluation_criteria"
    },
    {
      name: "Pain Points",
      Icon: Lightbulb,
      prompt: "generate_customer_painpoints",
      stateKey: "derive_insights",
      summaryKey: "customer_pain_points",
      extract_insights_prompt: "extract_section_derive_insights"
    },
    {
      name: "Differentiation Factors",
      Icon: Star,
      prompt: "generate_differentiation_opportunities",
      stateKey: "differentiation_opportunities",
      summaryKey: "differentiating_factors",
      extract_insights_prompt: "extract_differentiation_factors"
    },
    {
      name: "Compliance Requirements",
      Icon: ClipboardCheck,
      prompt: "generate_compliance",
      stateKey: "compliance_requirements",
      extract_insights_prompt: "extract_compliance_requirements"
    }
  ];

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

  const handleTabChange = (_, newValue: number) => {
    if (loadingBidTab !== null) {
      toast.warning("Please wait until the current generation completes.");
      return;
    }

    setCurrentTabIndex(newValue); // Only handle the tab switch
  };

  const assign_insights_to_questions = async (bid_intel_type, tab) => {
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
    formData.append("bid_intel_type", bid_intel_type);
    formData.append("extract_insights_prompt", tab.extract_insights_prompt);

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

  const handleTabClick = async (index) => {
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
      setSharedState((prev) => ({ ...prev, [tab.stateKey]: generatedContent }));

      // Only update summary if it exists in response and we have a summaryKey
      if (result.data.summary && tab.summaryKey) {
        setSharedState((prev) => ({
          ...prev,
          [tab.summaryKey]: result.data.summary
        }));
      }

      // Pass the tab object to assign_insights_to_questions
      await assign_insights_to_questions(tab.summaryKey, tab);
      toast.success("Generated successfully!");
    } catch (err) {
      console.log(err);
      const errorMsg =
        err.response?.status === 404
          ? "No documents found in the tender library. Please upload documents before generating"
          : "An error occurred while generating. Please try again.";
      if (err.response?.status === 404) toast.warning(errorMsg);
      else toast.error(errorMsg);
    } finally {
      setLoadingBidTab(null);
    }
  };

  const handleCompliance = async (index) => {
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
        const generatedContent = result.data.requirements;
        console.log(generatedContent);
        setTabContent((prev) => ({ ...prev, [index]: generatedContent }));
        setSharedState((prev) => ({
          ...prev,
          [tab.stateKey]: generatedContent
        }));

        toast.success("Compliance requirements generated successfully!");
      }
    } catch (err) {
      if (mounted.current) {
        const errorMsg =
          err.response?.status === 404
            ? "No documents found in the tender library. Please upload documents before generating"
            : "An error occurred while generating compliance requirements. Please try again.";
        if (err.response?.status === 404) toast.warning(errorMsg);
        else toast.error(errorMsg);
      }
    } finally {
      if (mounted.current) {
        setLoadingBidTab(null);
      }
    }
  };

  const handleRegenerateClick = async (index, event) => {
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

  const handleEditClick = (index: number, content: string) => {
    setEditMode(index);
    setEditContent(content);
  };

  const handleSaveEdit = async (index: number) => {
    try {
      const tab = tabs[index];
      setTabContent((prev) => ({ ...prev, [index]: editContent }));
      setSharedState((prev) => ({
        ...prev,
        [tab.stateKey]: editContent
      }));
      setEditMode(null);
      toast.success("Content updated successfully!");
    } catch (err) {
      toast.error("Failed to save changes");
    }
  };

  const renderContent = (content: string, index: number) => {
    if (editMode === index) {
      return (
        <div className="flex flex-col gap-4 h-full">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full flex-1 p-4 border rounded-md font-mono outline-none"
          />
          <div className="flex gap-2">
            <Button onClick={() => handleSaveEdit(index)}>Save</Button>
            <Button variant="outline" onClick={() => setEditMode(null)}>
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    const sections = content.split(/(?=\n\d+\.|#)/);

    return sections.map((section, index) => {
      return (
        <div key={index} className="pb-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => <p className="mb-4" {...props} />,
              h1: ({ node, ...props }) => (
                <h1
                  className="text-2xl font-bold mb-4 mt-6"
                  style={{
                    lineHeight: "1.5"
                  }}
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-xl font-bold mb-3 mt-5"
                  style={{
                    lineHeight: "1.5"
                  }}
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="text-lg font-bold mb-3 mt-4"
                  style={{
                    lineHeight: "1.5"
                  }}
                  {...props}
                />
              ),
              h4: ({ node, ...props }) => (
                <h4 className="text-base font-bold mb-2 mt-4" {...props} />
              ),
              // Add more spacing between list items
              li: ({ node, ...props }) => (
                <li className="my-1" style={{ lineHeight: "1.6" }} {...props} />
              ),
              // Add spacing and styling for lists
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-6 mb-4 mt-2" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-6 mb-4 mt-2" {...props} />
              ),
              // Style tables properly
              table: ({ node, ...props }) => (
                <table
                  className="w-full border-collapse mb-6 border border-gray-300"
                  {...props}
                />
              ),
              thead: ({ node, ...props }) => (
                <thead className="bg-gray-100" {...props} />
              ),
              tbody: ({ node, ...props }) => <tbody {...props} />,
              tr: ({ node, ...props }) => (
                <tr className="border-b border-gray-300" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th
                  className="border border-gray-300 px-4 py-2 text-left font-semibold"
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-gray-300 px-4 py-2" {...props} />
              ),
              // Style blockquotes
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="pl-4 border-l-4 border-gray-300 italic my-4"
                  {...props}
                />
              ),
              // Style code blocks
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code
                    className="bg-gray-100 px-1 rounded font-mono text-sm"
                    {...props}
                  />
                ) : (
                  <code
                    className="block bg-gray-100 p-4 rounded font-mono text-sm my-4 overflow-auto"
                    {...props}
                  />
                ),
              // Style horizontal rules
              hr: ({ node, ...props }) => (
                <hr className="my-6 border-t border-gray-300" {...props} />
              )
            }}
          >
            {section}
          </ReactMarkdown>
        </div>
      );
    });
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

        const generatedContent =
          tenderInsight.data.requirements || tenderInsight.data.analysis;

        setTabContent((prev) => ({
          ...prev,
          [loadingBidTab]: generatedContent
        }));
        setSharedState((prev) => ({
          ...prev,
          [tab.stateKey]: generatedContent
        }));

        if (tenderInsight.data.summary && tab.summaryKey) {
          setSharedState((prev) => ({
            ...prev,
            [tab.summaryKey]: tenderInsight.data.summary
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
      <div className="bg-gray-100 border border-gray-line rounded-md p-2 mb-4">
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

          {/* We use the `open` prop to control the dialog state */}
          <TenderLibraryChatDialog
            bid_id={object_id}
            open={chatDialogOpen}
            onOpenChange={setChatDialogOpen}
          />

          <InterrogateTenderDialog
            bid_id={object_id}
            triggerComponent={
              <Button>
                <Search className="h-5 w-5 text-white" />
                Query Docs
              </Button>
            }
          />
        </div>
      </div>
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
                  {loadingBidTab === index && (
                    <div
                      className={cn(
                        "absolute top-14 left-0 z-10 bg-white rounded-lg shadow-2xl"
                      )}
                    >
                      <LoadingState />
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
                      disabled={loadingBidTab !== null}
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
          <div className={cn("h-[calc(100vh-10rem)] overflow-y-auto")}>
            {tabs.map((tab, index) => (
              <TabsContent
                key={index}
                value={index.toString()}
                className="h-full pt-0 mt-0"
              >
                <div className={cn("relative px-8 py-4 h-full")}>
                  {tab.stateKey === "differentiation_opportunities" && (
                    <AddCompetitors
                      setTabContent={setTabContent}
                      setSharedState={setSharedState}
                    />
                  )}
                  {editMode !== index && (
                    <div className="text-right">
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
                  )}
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
