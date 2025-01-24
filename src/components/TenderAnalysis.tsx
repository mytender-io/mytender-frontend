import React, { useState, useContext, useEffect, useRef } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import "./TenderAnalysis.css";
import axios from "axios";
import { displayAlert } from "../helper/Alert";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import { BidContext } from "../views/BidWritingStateManagerView";
import { useAuthUser } from "react-auth-kit";
import { FileText, Scale, Lightbulb, Star, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// Create an error boundary component
class MarkdownErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Markdown rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-message">Error rendering content</div>;
    }

    return this.props.children;
  }
}

const CustomTable = ({ content }) => {
  // Parse table content into structured data
  const parseTable = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Get headers
    const headerLine = lines[0];
    const headers = headerLine
      .split('|')
      .map(cell => cell.trim())
      .filter(Boolean);

    // Skip separator line and get data rows
    const dataRows = lines.slice(2)
      .map(line => {
        const cells = line
          .split('|')
          .map(cell => cell.trim())
          .filter(Boolean);
        return cells;
      })
      .filter(row => row.length > 0);

    return { headers, rows: dataRows };
  };

  const { headers, rows } = parseTable(content);

  return (
    <div className="table-container">
      <table className="markdown-table">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TenderAnalysis = ({ canUserEdit }) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [loadingTab, setLoadingTab] = useState(null);
  const { sharedState, setSharedState } = useContext(BidContext);
  const getAuth = useAuthUser();
  const auth = getAuth();
  const mounted = useRef(false);

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
      stateKey: "tender_summary",
      placeholder: "Enter tender summary here..."
    },
    {
      name: "Evaluation Criteria",
      Icon: Scale,
      prompt: "generate_evaluation_criteria",
      stateKey: "evaluation_criteria",
      placeholder: "Document evaluation criteria..."
    },
    {
      name: "Derive Insights",
      Icon: Lightbulb,
      prompt: "generate_derive_insights",
      stateKey: "derive_insights",
      placeholder: "Note key insights..."
    },
    {
      name: "Differentiation Opportunities",
      Icon: Star,
      prompt: "generate_differentiation_opportunities",
      stateKey: "differentiation_opportunities",
      placeholder: "List differentiation opportunities..."
    }
  ];

  const handleTextChange = (event) => {
    const newContent = event.target.value;
    setTabContent((prev) => ({ ...prev, [currentTabIndex]: newContent }));
    setSharedState((prev) => ({
      ...prev,
      [tabs[currentTabIndex].stateKey]: newContent
    }));
  };

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

  const handleTabClick = async (index) => {
    if (!canUserEdit) {
      displayAlert("You only have permission to view this bid.", "danger");
      return;
    }

    setCurrentTabIndex(index);

    if (tabContent[index]) return;

    if (!object_id) {
      displayAlert("Please save the bid first.", "warning");
      return;
    }

    const tab = tabs[index];
    setLoadingTab(index);

    const formData = new FormData();
    formData.append("bid_id", object_id);
    formData.append("prompt", tab.prompt);

    try {
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
        setSharedState((prev) => ({ ...prev, [tab.stateKey]: generatedContent }));
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

  const renderContent = (content: string) => {
    // Split content into sections
    const sections = content.split(/(?=\n\d+\.|#)/);
    
    return sections.map((section, index) => {
      // Check if section contains a table
      if (section.includes('|')) {
        const parts = section.split(/(\n.*\|.*\n[\s|-]+\|.*[\s\S]*?)(?=\n\n|\n(?=\d+\.|#)|$)/);
        
        return parts.map((part, partIndex) => {
          if (part.includes('|') && part.includes('-|-')) {
            return <CustomTable key={`${index}-${partIndex}`} content={part} />;
          }
          return (
            <div key={`${index}-${partIndex}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {part}
              </ReactMarkdown>
            </div>
          );
        });
      }
      
      return (
        <div key={index}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {section}
          </ReactMarkdown>
        </div>
      );
    });
  };

  return (
    <div className="tender-analysis mt-5">
      <div>
        <div className="tabs-container">
          {tabs.map((tab, index) => {
            const TabIcon = tab.Icon;
            return (
              <div
                key={index}
                className={`tab ${currentTabIndex === index ? "active" : ""}`}
                onClick={() => handleTabClick(index)}
              >
                <span className="tab-content">
                  <TabIcon className="tab-icon" size={16} />
                  <span className="tab-name">{tab.name}</span>
                  {tabContent[index] && (
                    <RefreshCw
                      className={`regenerate-icon ${loadingTab === index ? 'spinning' : ''}`}
                      size={14}
                      onClick={(e) => handleRegenerateClick(index, e)}
                    />
                  )}
                </span>
              </div>
            );
          })}
        </div>
        <div className="tab-content-container">
          {currentTabIndex !== null && (
            <div className="tab-content">
              {loadingTab === currentTabIndex ? (
                <div className="loading-spinner">
                  <Spinner animation="border" />
                </div>
              ) : (
                <div className="markdown-content">
                  {renderContent(tabContent[currentTabIndex] || '')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenderAnalysis;
