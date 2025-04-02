import React, { createContext, useState, useEffect, useRef } from "react";
import { EditorState } from "draft-js";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import { useAuthUser } from "react-auth-kit";

export interface Document {
  name: string;
  editorState: EditorState;
  type: "qa sheet" | "execSummary" | "coverLetter";
}

export interface Subheading {
  subheading_id: string;
  title: string;
  extra_instructions: string;
  word_count: number;
}

export interface HighlightedDocument {
  name: string;
  rawtext: string;
  folder: string;
}

export interface Section {
  section_id: string;
  heading: string;
  question: string;
  word_count: number;
  answer: string;
  reviewer: string;
  answerer: string;
  status: "Not Started" | "In Progress" | "Completed";
  weighting?: string;
  page_limit?: string;
  subsections: number;
  subheadings: Subheading[];
  choice: string;
  writingplan: string;
  comments: UserComment[];
  compliance_requirements: string;
  relevant_evaluation_criteria: string;
  relevant_derived_insights: string;
  relevant_differentiation_factors: string;
  highlightedDocuments: HighlightedDocument[];
  review_ready: boolean;
}

export interface UserComment {
  id: string;
  text: string;
  resolved: boolean;
  position: number;
  sectionId: string;
  author: string; // User who created the comment
  createdAt: string; // ISO date string
  replies: {
    id: string;
    text: string;
    author: string;
    createdAt: string;
  }[];
}

export interface Contributor {
  [login: string]: string; // login: permission
}

export interface Solution {
  product: string;
  features: string;
  approach: string;
}

export interface SharedState {
  bidInfo: string;
  opportunity_information: string;
  compliance_requirements: string;
  tender_summary: string;
  evaluation_criteria: string;
  derive_insights: string;
  differentiation_opportunities: string;
  questions: string;
  value: string;
  client_name: string;
  bid_qualification_result: string;
  opportunity_owner: string;
  submission_deadline: string;
  bid_manager: string;
  contributors: Contributor;
  original_creator: string;
  isSaved: boolean;
  isLoading: boolean;
  saveSuccess: boolean | null;
  object_id: string | null;
  selectedFolders: string[];
  timestamp?: string;
  outline: Section[];
  win_themes: string[];
  customer_pain_points: string[];
  differentiating_factors: string[];
  solution: Solution;
  selectedCaseStudies: HighlightedDocument[]; // Array of highlighted document objects
  tone_of_voice: string;
  new_bid_completed: boolean;
  isExternalUpdate?: boolean; // Flag to prevent autosave after server update
}
export interface BidContextType {
  sharedState: SharedState;
  setSharedState: React.Dispatch<React.SetStateAction<SharedState>>;
  saveProposal: () => void;
  getBackgroundInfo: () => string;
}

const defaultState: BidContextType = {
  sharedState: {
    bidInfo: "",
    opportunity_information: "",
    compliance_requirements: "",
    tender_summary: "",
    evaluation_criteria: "",
    derive_insights: "",
    differentiation_opportunities: "",
    questions: "",
    value: "",
    client_name: "",
    bid_qualification_result: "",
    opportunity_owner: "",
    submission_deadline: "",
    bid_manager: "",
    contributors: {},
    original_creator: "",
    isSaved: false,
    isLoading: false,
    saveSuccess: null,
    object_id: null,
    selectedFolders: ["default"],
    outline: [],
    win_themes: [],
    customer_pain_points: [],
    differentiating_factors: [],
    solution: {
      // Initialize solution with empty values
      product: "",
      features: "",
      approach: ""
    },
    selectedCaseStudies: [], // Initialize with an empty array
    tone_of_voice: "", // Initialize tone_of_voice with empty string
    new_bid_completed: true,
    isExternalUpdate: false
  },
  setSharedState: () => {},
  saveProposal: () => {},
  getBackgroundInfo: () => ""
};

export const BidContext = createContext<BidContextType>(defaultState);

const BidManagement: React.FC = () => {
  // Create a separate ref to track if we're currently saving
  const isSavingRef = useRef(false);

  // Initialize shared state using default state
  const [sharedState, setSharedState] = useState<SharedState>(
    defaultState.sharedState
  );

  // Debounce timer for auto-save functionality
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Get auth token and store in ref to avoid unnecessary re-renders
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  // Utility function to combine background information
  const getBackgroundInfo = () => {
    return `${sharedState.opportunity_information}\n${sharedState.compliance_requirements}`;
  };

  // Main save function that sends data to the server
  const saveProposal = async () => {
    // Prevent concurrent saves
    if (isSavingRef.current) {
      console.log("Save already in progress, skipping");
      return;
    }

    try {
      isSavingRef.current = true;

      // Deep copy state to prevent mutations during save operation
      const stateCopy = JSON.parse(JSON.stringify(sharedState));

      // Validate outline structure before proceeding
      if (!Array.isArray(stateCopy.outline)) {
        console.error("Invalid outline structure");
        return;
      }

      const {
        bidInfo,
        compliance_requirements,
        opportunity_information,
        tender_summary,
        evaluation_criteria,
        derive_insights,
        differentiation_opportunities,
        bid_qualification_result,
        selectedFolders,
        client_name,
        value,
        opportunity_owner,
        submission_deadline,
        bid_manager,
        contributors,
        questions,
        object_id,
        original_creator,
        outline,
        win_themes,
        customer_pain_points,
        differentiating_factors,
        solution,
        selectedCaseStudies, // Include the selectedCaseStudies
        tone_of_voice, // Include tone_of_voice
        new_bid_completed
      } = stateCopy;

      if (!bidInfo || bidInfo.trim() === "") {
        //toast.error("Please type in a bid name...");
        return;
      }

      setSharedState((prev) => ({
        ...prev,
        isLoading: true,
        saveSuccess: null
      }));

      const backgroundInfo = getBackgroundInfo();

      const formData = new FormData();
      const appendFormData = (key: string, value: any) => {
        formData.append(key, value?.toString()?.trim() || " ");
      };

      appendFormData("bid_title", bidInfo);
      appendFormData("status", "ongoing");
      appendFormData("contract_information", backgroundInfo);
      appendFormData("value", value);
      appendFormData("compliance_requirements", compliance_requirements);
      appendFormData("opportunity_information", opportunity_information);
      appendFormData("tender_summary", tender_summary);
      appendFormData("evaluation_criteria", evaluation_criteria);
      appendFormData("derive_insights", derive_insights);
      appendFormData(
        "differentiation_opportunities",
        differentiation_opportunities
      );
      appendFormData("client_name", client_name);
      appendFormData("bid_qualification_result", bid_qualification_result);
      appendFormData("opportunity_owner", opportunity_owner);
      appendFormData("bid_manager", bid_manager);
      appendFormData("submission_deadline", submission_deadline);
      appendFormData("questions", questions);
      appendFormData("original_creator", original_creator);
      appendFormData("tone_of_voice", tone_of_voice); // Add tone_of_voice to form data
      formData.append("new_bid_completed", new_bid_completed);

      formData.append("contributors", JSON.stringify(contributors || []));
      formData.append(
        "selectedFolders",
        JSON.stringify(selectedFolders || ["default"])
      );
      formData.append("outline", JSON.stringify(outline || []));
      formData.append("win_themes", JSON.stringify(win_themes || []));
      formData.append(
        "customer_pain_points",
        JSON.stringify(customer_pain_points || [])
      );
      formData.append(
        "differentiating_factors",
        JSON.stringify(differentiating_factors || [])
      );

      formData.append(
        "solution",
        JSON.stringify(solution || { product: "", features: "", approach: "" })
      );

      // Add selectedCaseStudies to the form data
      formData.append(
        "selectedCaseStudies",
        JSON.stringify(selectedCaseStudies || [])
      );

      if (object_id) {
        appendFormData("object_id", object_id);
      }

      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/upload_bids`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const { bid_id } = response.data;

      setSharedState((prev) => ({
        ...prev,
        isSaved: true,
        isLoading: false,
        saveSuccess: true,
        object_id: bid_id
      }));

      // Reset isSaved after 3 seconds
      setTimeout(
        () => setSharedState((prev) => ({ ...prev, isSaved: false })),
        3000
      );
    } catch (error) {
      console.error("Error saving proposal:", error);
      setSharedState((prev) => ({
        ...prev,
        isLoading: false,
        saveSuccess: false
      }));
    } finally {
      isSavingRef.current = false;
    }
  };

  useEffect(() => {
    if (sharedState.isExternalUpdate) {
      console.log("Skipping autosave - update came from server");

      // Reset the flag after skipping (important!)
      setSharedState((prev) => ({
        ...prev,
        isExternalUpdate: false
      }));

      return;
    }

    // Clear any existing save timer
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      console.log("Cleared existing save timer");
    }

    // Set new timer for auto-save
    setTypingTimeout(
      setTimeout(() => {
        if (!isSavingRef.current) {
          console.log("autosave triggered");
          saveProposal();
        }
      }, 4000)
    );
  }, [
    // Dependencies that trigger auto-save when changed
    sharedState.bidInfo,
    sharedState.opportunity_information,
    sharedState.compliance_requirements,
    sharedState.tender_summary,
    sharedState.evaluation_criteria,
    sharedState.derive_insights,
    sharedState.differentiation_opportunities,
    sharedState.questions,
    sharedState.client_name,
    sharedState.bid_qualification_result,
    sharedState.opportunity_owner,
    sharedState.submission_deadline,
    sharedState.bid_manager,
    sharedState.contributors,
    sharedState.original_creator,
    sharedState.selectedFolders,
    sharedState.win_themes,
    sharedState.differentiating_factors,
    sharedState.customer_pain_points,
    sharedState.tone_of_voice, // Add tone_of_voice as a dependency
    sharedState.new_bid_completed,
    JSON.stringify(sharedState.solution),
    JSON.stringify(sharedState.selectedCaseStudies),
    JSON.stringify(
      sharedState.outline.map((s) => ({
        id: s.section_id,
        subheadingsCount: s.subheadings.length,
        subheadingsIds: s.subheadings.map((sh) => sh.subheading_id).join(",")
      }))
    ),
    // Triggers on deep changes to outline
    JSON.stringify(sharedState.outline)
  ]);

  // Compare the local timestamp in the sharedstate against the server timestamp
  useEffect(() => {
    console.log("checking timestamp...");
    // Only check if we have a bid ID
    if (!sharedState.object_id) return;

    // Create interval to check timestamp every 5 seconds
    const interval = setInterval(async () => {
      try {
        // Skip if currently saving
        if (isSavingRef.current) return;

        const response = await axios.get(
          `http${HTTP_PREFIX}://${API_URL}/get_timestamp/${sharedState.object_id}`,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`
            }
          }
        );

        // console.log(response.data.timestamp);
        const serverTimestamp = response.data.timestamp;
        const localTimestamp = sharedState.timestamp;

        // If no local timestamp, update it
        if (!localTimestamp) {
          setSharedState((prev) => ({
            ...prev,
            timestamp: serverTimestamp
          }));
          return;
        }

        // Compare timestamps
        if (serverTimestamp && localTimestamp) {
          const serverTime = new Date(serverTimestamp).getTime();
          const localTime = new Date(localTimestamp).getTime();

          // Add more detailed logging
          // console.log("Server timestamp:", serverTimestamp);
          // console.log("Local timestamp:", localTimestamp);

          // If server version is newer
          if (serverTime > localTime) {
            console.log("Newer version detected on server, reloading bid");

            // Fetch the updated bid
            try {
              const bidResponse = await axios.get(
                `http${HTTP_PREFIX}://${API_URL}/get_bid/${sharedState.object_id}`,
                {
                  headers: {
                    Authorization: `Bearer ${tokenRef.current}`
                  }
                }
              );

              const updatedBid = bidResponse.data.bid;
              // console.log("updated bid time (ms):", updatedBid.timestamp);

              // Create a promise to track state update completion
              const stateUpdateComplete = new Promise((resolve) => {
                setSharedState((prev) => {
                  const newState = {
                    ...prev,
                    timestamp: serverTimestamp,
                    isExternalUpdate: true,
                    bidInfo: updatedBid.bid_title || prev.bidInfo,
                    opportunity_information:
                      updatedBid.opportunity_information ||
                      prev.opportunity_information,
                    compliance_requirements:
                      updatedBid.compliance_requirements ||
                      prev.compliance_requirements,
                    tender_summary:
                      updatedBid.tender_summary || prev.tender_summary,
                    evaluation_criteria:
                      updatedBid.evaluation_criteria ||
                      prev.evaluation_criteria,
                    derive_insights:
                      updatedBid.derive_insights || prev.derive_insights,
                    differentiation_opportunities:
                      updatedBid.differentiation_opportunities ||
                      prev.differentiation_opportunities,
                    questions: updatedBid.questions || prev.questions,
                    value: updatedBid.value || prev.value,
                    client_name: updatedBid.client_name || prev.client_name,
                    bid_qualification_result:
                      updatedBid.bid_qualification_result ||
                      prev.bid_qualification_result,
                    opportunity_owner:
                      updatedBid.opportunity_owner || prev.opportunity_owner,
                    submission_deadline:
                      updatedBid.submission_deadline ||
                      prev.submission_deadline,
                    bid_manager: updatedBid.bid_manager || prev.bid_manager,
                    contributors: updatedBid.contributors || prev.contributors,
                    original_creator:
                      updatedBid.original_creator || prev.original_creator,
                    selectedFolders:
                      updatedBid.selectedFolders || prev.selectedFolders,
                    // outline: updatedBid.outline
                    //   ? // Do a deep copy of the outline array from the server
                    //     JSON.parse(JSON.stringify(updatedBid.outline))
                    //   : prev.outline,
                    outline: updatedBid.outline || prev.outline,
                    win_themes: updatedBid.win_themes || prev.win_themes,
                    customer_pain_points:
                      updatedBid.customer_pain_points ||
                      prev.customer_pain_points,
                    differentiating_factors:
                      updatedBid.differentiating_factors ||
                      prev.differentiating_factors,
                    solution: updatedBid.solution || prev.solution,
                    selectedCaseStudies:
                      updatedBid.selectedCaseStudies ||
                      prev.selectedCaseStudies,
                    tone_of_voice:
                      updatedBid.tone_of_voice || prev.tone_of_voice,
                    new_bid_completed:
                      updatedBid.new_bid_completed ?? prev.new_bid_completed
                  };

                  // Resolve with the new state
                  setTimeout(() => resolve(newState), 0);

                  return newState;
                });
              });

              // Wait for state update to complete and use the resolved value
              const updatedState = await stateUpdateComplete;
              console.log("Bid data updated successfully");
              console.log("updated bid time (ms):", updatedBid.timestamp);
              console.log("timestamp after update:", updatedState.timestamp);
            } catch (bidError) {
              console.error("Failed to fetch updated bid:", bidError);
            }
          }
        }
      } catch (error) {
        console.error("Error checking timestamp:", error);
      }
    }, 5000);
    // Cleanup
    return () => clearInterval(interval);
  }, [sharedState.object_id, sharedState.timestamp]); // ensure the effect reruns when the timestamp changes

  return (
    <BidContext.Provider
      value={{
        sharedState,
        setSharedState,
        saveProposal,
        getBackgroundInfo
      }}
    >
      <Outlet />
    </BidContext.Provider>
  );
};

export default BidManagement;
