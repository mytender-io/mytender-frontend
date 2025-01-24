import React, { useState, useContext, useEffect } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import "./TenderAnalysis.css";
import axios from "axios";
import { displayAlert } from "../helper/Alert";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import { BidContext } from "../views/BidWritingStateManagerView";
import { useAuthUser } from "react-auth-kit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileLines,
  faLightbulb,
  faStar,
  faScaleBalanced
} from "@fortawesome/free-solid-svg-icons";

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
      icon: faFileLines,
      prompt: "generate_summarise_tender",
      stateKey: "tender_summary",
      placeholder: "Enter tender summary here..."
    },
    {
      name: "Evaluation Criteria",
      icon: faScaleBalanced,
      prompt: "generate_evaluation_criteria",
      stateKey: "evaluation_criteria",
      placeholder: "Document evaluation criteria..."
    },
    {
      name: "Derive Insights",
      icon: faLightbulb,
      prompt: "generate_derive_insights",
      stateKey: "derive_insights",
      placeholder: "Note key insights..."
    },
    {
      name: "Differentiation Opportunities",
      icon: faStar,
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

    if (tabContent[index]) return; // Skip generation if content exists

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
  return (
    <div className="tender-analysis mt-5">
      <div>
        <div className="tabs-container">
          {tabs.map((tab, index) => (
            <div
              key={index}
              className={`tab ${currentTabIndex === index ? "active" : ""}`}
              onClick={() => handleTabClick(index)}
            >
              <span className="tab-content">
                {loadingTab === index ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <FontAwesomeIcon icon={tab.icon} className="tab-icon" />
                )}
                <span className="tab-name">{tab.name}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="proposal-container">
          <textarea
            className="tender-insights-textarea"
            value={tabContent[currentTabIndex]}
            onChange={handleTextChange}
            placeholder={tabs[currentTabIndex].placeholder}
            disabled={!canUserEdit}
          />
        </div>
      </div>
    </div>
  );
};

export default TenderAnalysis;
