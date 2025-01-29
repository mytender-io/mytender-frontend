import React, { useState, useContext, useEffect, useRef } from "react";
import { Box, Tab, Tabs, Paper, Typography, IconButton } from "@mui/material";
import axios from "axios";
import { displayAlert } from "../helper/Alert";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import { BidContext } from "../views/BidWritingStateManagerView";
import { useAuthUser } from "react-auth-kit";
import { useTheme } from "@mui/material/styles";
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
  Telescope
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LoadingState = () => {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme(); // Add this to access theme colors
  const steps = [
    { icon: Search, text: "Scanning tender documents..." },
    { icon: Filter, text: "Filtering relevant sections..." },
    { icon: FileText, text: "Extracting key requirements..." },
    { icon: Target, text: "Identifying evaluation criteria..." },
    { icon: Brain, text: "Processing requirements..." },
    { icon: Crosshair, text: "Detecting critical success factors..." },
    { icon: ChartBar, text: "Analyzing competitive landscape..." },
    { icon: Gauge, text: "Evaluating market positioning..." },
    { icon: Telescope, text: "Exploring strategic opportunities..." },
    { icon: Lightbulb, text: "Generating innovative insights..." },
    { icon: CheckCircle2, text: "Finalizing recommendations..." },
    { icon: Sparkles, text: "Polishing final output..." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 750);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box className="w-80 ml-4 mt-4 mb-4"> {/* Added mb-4 for bottom margin */}
      <Box className="flex flex-col space-y-3">
        <Box className="max-h-[400px] overflow-y-auto pr-2"> {/* Added scrollable container with padding */}
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <Box
                key={index}
                className={`flex items-center space-x-4 p-2 rounded-lg transition-all duration-300 ${
                  index === activeStep
                    ? "opacity-100 translate-x-2 bg-orange-50"
                    : "opacity-30"
                }`}
              >
                <StepIcon
                  className={`w-5 h-5 ${
                    index === activeStep ? "animate-pulse" : ""
                  }`}
                  style={{ 
                    color: theme.palette.primary.main // Use theme color for icons
                  }}
                />
                <Typography className="text-gray-800 font-medium text-sm">
                  {step.text}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};
const CustomTable = ({ content }) => {
  const parseTable = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0]
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);
    const dataRows = lines
      .slice(2)
      .map((line) =>
        line
          .split("|")
          .map((cell) => cell.trim())
          .filter(Boolean)
      )
      .filter((row) => row.length > 0);
    return { headers, rows: dataRows };
  };

  const { headers, rows } = parseTable(content);

  return (
    <Box className="w-full overflow-x-auto my-4 border border-gray-200 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="p-3 text-left font-semibold border-b border-gray-200"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-3 border-t border-gray-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

const TabPanel = ({ children, value, index }) => (
  <Box hidden={value !== index} className="w-full">
    {value === index && children}
  </Box>
);

const TenderAnalysis = ({ canUserEdit }) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [loadingTab, setLoadingTab] = useState(null);
  const { sharedState, setSharedState } = useContext(BidContext);
  const getAuth = useAuthUser();
  const auth = getAuth();
  const mounted = useRef(false);
  const theme = useTheme();

  const {
    object_id,
    tender_summary,
    evaluation_criteria,
    derive_insights,
    differentiation_opportunities
  } = sharedState;

  const [tabContent, setTabContent] = useState({
    0: tender_summary || "",
    1: evaluation_criteria || "",
    2: derive_insights || "",
    3: differentiation_opportunities || ""
  });

  const tabs = [
    {
      name: "Summarise Tender",
      Icon: FileText,
      prompt: "generate_summarise_tender",
      stateKey: "tender_summary"
    },
    {
      name: "Evaluation Criteria",
      Icon: Scale,
      prompt: "generate_evaluation_criteria",
      stateKey: "evaluation_criteria"
    },
    {
      name: "Derive Insights",
      Icon: Lightbulb,
      prompt: "generate_derive_insights",
      stateKey: "derive_insights"
    },
    {
      name: "Differentiation Opportunities",
      Icon: Star,
      prompt: "generate_differentiation_opportunities",
      stateKey: "differentiation_opportunities"
    }
  ];

  // Add refs for the tabs container and tabs
  const tabsRef = useRef(null);
  const [tabRects, setTabRects] = useState([]);

  // Add effect to measure tab positions
  useEffect(() => {
    if (tabsRef.current) {
      const tabElements = tabsRef.current.querySelectorAll('[role="tab"]');
      const rects = Array.from(tabElements).map((tab) =>
        tab.getBoundingClientRect()
      );
      setTabRects(rects);
    }
  }, [currentTabIndex]); // Re-measure

  useEffect(() => {
    mounted.current = true;
    setTabContent({
      0: tender_summary || "",
      1: evaluation_criteria || "",
      2: derive_insights || "",
      3: differentiation_opportunities || ""
    });
    return () => {
      mounted.current = false;
    };
  }, [
    tender_summary,
    evaluation_criteria,
    derive_insights,
    differentiation_opportunities
  ]);

  const handleTabChange = (_, newValue) => {
    if (!canUserEdit) {
      displayAlert("You only have permission to view this bid.", "danger");
      return;
    }
    handleTabClick(newValue);
  };

  const handleTabClick = async (index) => {
    setCurrentTabIndex(index);
    if (tabContent[index]) return;
    if (!object_id) {
      displayAlert("Please save the bid first.", "warning");
      return;
    }

    const tab = tabs[index];
    setLoadingTab(index);

    try {
      const formData = new FormData();
      formData.append("bid_id", object_id);
      formData.append("prompt", tab.prompt);

      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/generate_tender_insights`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const generatedContent = result.data.requirements;
      setTabContent((prev) => ({ ...prev, [index]: generatedContent }));
      setSharedState((prev) => ({ ...prev, [tab.stateKey]: generatedContent }));
      displayAlert("Generated successfully!", "success");
    } catch (err) {
      const errorMsg =
        err.response?.status === 404
          ? "No documents found in the tender library. Please upload documents before generating"
          : "An error occurred while generating. Please try again.";
      displayAlert(
        errorMsg,
        err.response?.status === 404 ? "warning" : "danger"
      );
    } finally {
      setLoadingTab(null);
    }
  };

  const handleRegenerateClick = async (index, event) => {
    event.stopPropagation();
    if (!canUserEdit || !mounted.current) return;
    if (!object_id) {
      displayAlert("Please save the bid first.", "warning");
      return;
    }

    const tab = tabs[index];
    setLoadingTab(index);

    try {
      const formData = new FormData();
      formData.append("bid_id", object_id);
      formData.append("prompt", tab.prompt);

      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/generate_tender_insights`,
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
        setTabContent((prev) => ({ ...prev, [index]: generatedContent }));
        setSharedState((prev) => ({
          ...prev,
          [tab.stateKey]: generatedContent
        }));
        displayAlert("Regenerated successfully!", "success");
      }
    } catch (err) {
      if (mounted.current) {
        const errorMsg =
          err.response?.status === 404
            ? "No documents found in the tender library. Please upload documents before generating"
            : "An error occurred while regenerating. Please try again.";
        displayAlert(
          errorMsg,
          err.response?.status === 404 ? "warning" : "danger"
        );
      }
    } finally {
      if (mounted.current) {
        setLoadingTab(null);
      }
    }
  };

  const renderContent = (content) => {
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
            <Box key={`${index}-${partIndex}`} className="mb-8">
              {" "}
              {/* Increased margin bottom */}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => (
                    <p
                      style={{ lineHeight: "2", marginBottom: "1.5rem" }}
                      {...props}
                    />
                  ),
                  h1: ({ node, ...props }) => (
                    <h1
                      style={{
                        lineHeight: "1.6",
                        marginTop: "2.5rem",
                        marginBottom: "1.5rem"
                      }}
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      style={{
                        lineHeight: "1.6",
                        marginTop: "2rem",
                        marginBottom: "1.5rem"
                      }}
                      {...props}
                    />
                  ),
                  // Add more spacing between list items
                  li: ({ node, ...props }) => (
                    <li
                      style={{ marginBottom: "1rem", lineHeight: "2" }}
                      {...props}
                    />
                  ),
                  // Add spacing around lists
                  ul: ({ node, ...props }) => (
                    <ul
                      style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}
                      {...props}
                    />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}
                      {...props}
                    />
                  )
                }}
              >
                {part}
              </ReactMarkdown>
            </Box>
          );
        });
      }

      return (
        <Box key={index} className="mb-8">
          {" "}
          {/* Increased margin bottom */}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => (
                <p
                  style={{ lineHeight: "2", marginBottom: "1.5rem" }}
                  {...props}
                />
              ),
              h1: ({ node, ...props }) => (
                <h1
                  style={{
                    lineHeight: "1.6",
                    marginTop: "2.5rem",
                    marginBottom: "1.5rem"
                  }}
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  style={{
                    lineHeight: "1.6",
                    marginTop: "2rem",
                    marginBottom: "1.5rem"
                  }}
                  {...props}
                />
              ),
              li: ({ node, ...props }) => (
                <li
                  style={{ marginBottom: "1rem", lineHeight: "2" }}
                  {...props}
                />
              ),
              ul: ({ node, ...props }) => (
                <ul
                  style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}
                  {...props}
                />
              ),
              ol: ({ node, ...props }) => (
                <ol
                  style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}
                  {...props}
                />
              )
            }}
          >
            {section}
          </ReactMarkdown>
        </Box>
      );
    });
  };

  return (
    <Box className="mt-5">
      <Paper
        elevation={0}
        className="border border-gray-200"
        sx={{
          "& .MuiTabs-flexContainer": {
            borderBottom: "1px solid #E5E7EB"
          }
        }}
      >
        <Tabs
          ref={tabsRef}
          value={currentTabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="tender analysis tabs"
          sx={{
            // Override the indicator color more specifically
            "& .MuiTabs-indicator": {
              backgroundColor: `${theme.palette.primary.main} !important`
            },
            // More specific selector for tab root
            "& .MuiTab-root": {
              textTransform: "none",
              minHeight: "48px",
              padding: "12px 24px",
              color: "#6B7280",
              "&.Mui-selected": {
                color: "#000000"
              },
              "&:hover": {
                color: `${theme.palette.primary.main} !important`,
                backgroundColor: `${theme.palette.primary.light} !important`,
                ".lucide": {
                  color: `${theme.palette.primary.main} !important`
                }
              },
              "&:active": {
                backgroundColor: theme.palette.action.hover
              },
              // Override the ripple effect color
              "& .MuiTouchRipple-root": {
                color: `${theme.palette.primary.main} !important`
              }
            }
          }}
        >
          {tabs.map((tab, index) => {
            const TabIcon = tab.Icon;
            return (
              <Tab
                key={index}
                icon={
                  <Box className="flex items-center space-x-2">
                    <TabIcon
                      size={16}
                      className={`transition-colors ${
                        currentTabIndex === index
                          ? "text-gray-900"
                          : "text-gray-600 hover:text-orange-400"
                      }`}
                    />
                    {tabContent[index] && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleRegenerateClick(index, e)}
                        className={loadingTab === index ? "animate-spin" : ""}
                        sx={{
                          padding: "4px",
                          color: "#6B7280",
                          "&:hover": {
                            backgroundColor: theme.palette.primary.light,
                            color: theme.palette.primary.main
                          },
                          "&:active": {
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                      >
                        <RefreshCw size={14} />
                      </IconButton>
                    )}
                  </Box>
                }
                label={
                  <span
                    className={`font-medium transition-colors ${
                      currentTabIndex === index
                        ? "text-gray-900"
                        : "text-gray-600"
                    }`}
                  >
                    {tab.name}
                  </span>
                }
                sx={{
                  minHeight: "56px",
                  opacity: 1
                }}
              />
            );
          })}
        </Tabs>

        <Box
          className="min-h-[70vh] border-t border-gray-200"
          sx={{
            "& .markdown-content": {
              "& h1, & h2, & h3, & h4": {
                color: "#111827",
                fontWeight: 600,
                marginBottom: "0.75rem"
              },
              "& p": {
                color: "#374151",
                marginBottom: "1rem"
              },
              "& ul, & ol": {
                paddingLeft: "1.5rem",
                marginBottom: "1rem"
              },
              "& li": {
                marginBottom: "0.5rem"
              }
            }
          }}
        >
          {tabs.map((tab, index) => (
            <TabPanel key={index} value={currentTabIndex} index={index}>
              <Box className="relative p-8">
                {loadingTab === index && tabRects[index] && (
                  <Box
                    className="absolute z-10 bg-white rounded-lg shadow-lg"
                    sx={{
                      left: `${tabRects[index].left - tabRects[0].left}px`, // Position relative to first tab
                      top: "-1px" // Adjust as needed
                    }}
                  >
                    <LoadingState />
                  </Box>
                )}
                {!loadingTab && renderContent(tabContent[index] || "")}
              </Box>
            </TabPanel>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default TenderAnalysis;
