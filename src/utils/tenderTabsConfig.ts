import {
  FileText,
  Scale,
  Lightbulb,
  Star,
  ClipboardCheck
} from "lucide-react";

export interface TabData {
  name: string;
  Icon: React.ElementType;
  prompt: string;
  stateKey: string;
  summaryKey?: string;
  extract_insights_prompt?: string;
}

export const tenderTabs: TabData[] = [
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

// Helper function to get tab index by stateKey
export const getTabIndexByStateKey = (stateKey: string): number => {
  const index = tenderTabs.findIndex(
    tab => tab.stateKey.toLowerCase() === stateKey.toLowerCase()
  );
  return index !== -1 ? index : 0; // Default to first tab if not found
};

// Helper function to get display name from stateKey
export const getDisplayNameByStateKey = (stateKey: string): string => {
  const tab = tenderTabs.find(
    tab => tab.stateKey.toLowerCase() === stateKey.toLowerCase()
  );
  return tab ? tab.name : "Summarise Tender"; // Default to first tab name if not found
}; 