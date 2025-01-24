import React, { useState, useContext, useEffect } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import "./TenderAnalysis.css";
import axios from "axios";
import { displayAlert } from "../helper/Alert";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import { BidContext } from "../views/BidWritingStateManagerView";
import { useAuthUser } from "react-auth-kit";
import { FileText, Scale, Lightbulb, Star } from "lucide-react";
import ReactMarkdown from "react-markdown";

const TenderAnalysis = ({ canUserEdit }) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [loadingTab, setLoadingTab] = useState(null);
  const { sharedState, setSharedState } = useContext(BidContext);
  const getAuth = useAuthUser();
  const auth = getAuth();

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
    setTabContent({
      0: tender_summary || "",
      1: evaluation_criteria || "",
      2: derive_insights || "",
      3: differentiation_opportunities || ""
    });
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

  const formatContent = (content) => {
    if (!content) return "";
  
    let formatted = content;
    
    // Handle main heading
    formatted = formatted.replace(/^##\s(.+?)(?=\n)/, '<h1>$1</h1>');
    
    // Handle Roman numeral sections
    formatted = formatted.replace(/\*\*([IVX]+\.)\s([^:]+):\*\*/g, '<h2>$1 $2</h2>');
    
    // Handle letter subsections
    formatted = formatted.replace(/\*\*([A-Z]\.)\s([^:]+):\*\*/g, '<h3>$1 $2</h3>');
    
    // Handle numbered sections
    formatted = formatted.replace(/(\d+\.)\s([^:\n]+)/g, '<h2>$1 $2</h2>');
    
    // Handle list items
    formatted = formatted.replace(/\*\s\*\*(.*?):\*\*/g, '<li><strong>$1:</strong>');
    formatted = formatted.replace(/\*\s(.*?)(?=\n|$)/g, '<li>$1</li>');
    
    // Handle remaining bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Wrap lists
    formatted = formatted.replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul>$1</ul>');
    
    // Handle paragraphs
    formatted = formatted.split('\n\n').map(p => 
      p.includes('<h') || p.includes('<ul') ? p : `<p>${p}</p>`
    ).join('');
  
    return `
      <style>
        h1 { font-size: 24px; font-weight: 600; margin: 0 0 20px 0; }
        h2 { font-size: 18px; font-weight: 600; margin: 24px 0 16px 0; }
        h3 { font-size: 16px; font-weight: 600; margin: 16px 0 12px 0; }
        p { font-size: 11pt; line-height: 1.5; margin-bottom: 12px; }
        ul { padding-left: 20px; margin: 12px 0; }
        li { margin-bottom: 8px; line-height: 1.5; }
        strong { font-weight: 600; }
      </style>
      ${formatted}
    `;
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
                  {loadingTab === index ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <TabIcon className="tab-icon" size={16} />
                  )}
                  <span className="tab-name">{tab.name}</span>
                </span>
              </div>
            );
          })}
        </div>

        <div className="proposal-container">
        
            <div className="tender-insights-content"
             
              dangerouslySetInnerHTML={{
                __html: formatContent(tabContent[currentTabIndex])
              }}
            />
          
        </div>
      </div>
    </div>
  );
};

export default TenderAnalysis;
