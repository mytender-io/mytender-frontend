import { useState, useContext, useEffect, useRef } from "react";
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

const CustomTable = ({ content }: { content: string }) => {
  const parseTable = (text: string) => {
    const lines = text.split("\n").filter((line: string) => line.trim());
    const headers = lines[0]
      .split("|")
      .map((cell: string) => cell.trim())
      .filter(Boolean);
    const dataRows = lines
      .slice(2)
      .map((line) =>
        line
          .split("|")
          .map((cell: string) => cell.trim())
          .filter(Boolean)
      )
      .filter((row: string[]) => row.length > 0);
    return { headers, rows: dataRows };
  };

  const { headers, rows } = parseTable(content);

  return (
    <div className={cn("w-full my-4 rounded-md border")}>
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header: string, index: number) => (
              <TableHead key={index}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row: string[], rowIndex: number) => (
            <TableRow key={rowIndex}>
              {row.map((cell: string, cellIndex: number) => (
                <TableCell key={cellIndex}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const TenderAnalysis = () => {
  const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);
  const [loadingTab, setLoadingTab] = useState(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const { sharedState, setSharedState } = useContext(BidContext);
  const getAuth = useAuthUser();
  const auth = getAuth();
  const mounted = useRef(false);

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
      prompt: "generate_derive_insights",
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
    if (loadingTab !== null) {
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

    console.log(formData);

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
    if (loadingTab !== null) {
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

    setLoadingTab(index);

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
      setLoadingTab(null);
    }
  };

  const handleCompliance = async (index) => {
    if (!object_id) {
      toast.warning("Please save the bid first.");
      return;
    }

    const tab = tabs[index];
    setLoadingTab(index);

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
        setLoadingTab(null);
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
    setLoadingTab(index);
    setCurrentTabIndex(index);

    // Use special handler for compliance tab regeneration
    if (tab.prompt === "generate_compliance") {
      handleCompliance(index);
      return;
    }

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

      if (mounted.current) {
        const generatedContent =
          result.data.requirements || result.data.analysis;
        setTabContent((prev) => ({ ...prev, [index]: generatedContent }));
        setSharedState((prev) => ({
          ...prev,
          [tab.stateKey]: generatedContent
        }));

        if (result.data.summary && tab.summaryKey) {
          setSharedState((prev) => ({
            ...prev,
            [tab.summaryKey]: result.data.summary
          }));
        }

        // Pass the tab object to assign_insights_to_questions
        await assign_insights_to_questions(tab.summaryKey, tab);
        toast.success("Regenerated successfully!");
      }
    } catch (err) {
      if (mounted.current) {
        const errorMsg =
          err.response?.status === 404
            ? "No documents found in the tender library. Please upload documents before generating"
            : "An error occurred while regenerating. Please try again.";
        if (err.response?.status === 404) toast.warning(errorMsg);
        else toast.error(errorMsg);
      }
    } finally {
      if (mounted.current) {
        setLoadingTab(null);
      }
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
      if (section.includes("|")) {
        const parts = section.split(
          /(\n.*\|.*\n[\s|-]+\|.*[\s\S]*?)(?=\n\n|\n(?=\d+\.|#)|$)/
        );

        return parts.map((part, partIndex) => {
          if (part.includes("|") && part.includes("-|-")) {
            return <CustomTable key={`${index}-${partIndex}`} content={part} />;
          }
          return (
            <div key={`${index}-${partIndex}`}>
              {/* Increased margin bottom */}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => <p {...props} />,
                  h1: ({ node, ...props }) => (
                    <h1
                      style={{
                        lineHeight: "2"
                      }}
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      style={{
                        lineHeight: "2"
                      }}
                      {...props}
                    />
                  ),
                  // Add more spacing between list items
                  li: ({ node, ...props }) => (
                    <li style={{ lineHeight: "2" }} {...props} />
                  ),
                  // Add spacing around lists
                  ul: ({ node, ...props }) => <ul {...props} />,
                  ol: ({ node, ...props }) => <ol {...props} />
                }}
              >
                {part}
              </ReactMarkdown>
            </div>
          );
        });
      }

      return (
        <div key={index}>
          {/* Increased margin bottom */}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => <p {...props} />,
              h1: ({ node, ...props }) => (
                <h1
                  style={{
                    lineHeight: "2"
                  }}
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  style={{
                    lineHeight: "2"
                  }}
                  {...props}
                />
              ),
              li: ({ node, ...props }) => (
                <li style={{ lineHeight: "2" }} {...props} />
              ),
              ul: ({ node, ...props }) => <ul {...props} />,
              ol: ({ node, ...props }) => <ol {...props} />
            }}
          >
            {section}
          </ReactMarkdown>
        </div>
      );
    });
  };

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
                  disabled={loadingTab !== null && loadingTab !== index}
                >
                  {loadingTab === index && (
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
                      onClick={(e) => handleRegenerateClick(index, e)}
                      variant="ghost"
                      size="icon"
                      disabled={loadingTab !== null}
                      className={cn(
                        "bg-gray-line hover:bg-orange-100 hover:text-orange h-6 w-6 min-w-6",
                        currentTabIndex === index &&
                          (loadingTab !== index
                            ? "bg-orange-100"
                            : "bg-transparent"),
                        loadingTab === index && "animate-spin"
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
                  { editMode !== index && (
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
