import React, { createContext, useState, ReactNode, useContext } from "react";

interface ProposalGenerationState {
  isGeneratingProposal: boolean;
  progress: number;
  message: string;
  currentStep: number;
}

interface ProposalGenerationContextType {
  state: ProposalGenerationState;
  setIsGeneratingProposal: (isGenerating: boolean) => void;
  setProgress: (progress: number) => void;
  setMessage: (message: string) => void;
  setCurrentStep: (step: number) => void;
  resetState: () => void;
}

const initialState: ProposalGenerationState = {
  isGeneratingProposal: false,
  progress: 0,
  message: "Analysing the outline...",
  currentStep: 1
};

const ProposalGenerationContext = createContext<
  ProposalGenerationContextType | undefined
>(undefined);

interface ProposalGenerationProviderProps {
  children: ReactNode;
}

export const ProposalGenerationProvider: React.FC<
  ProposalGenerationProviderProps
> = ({ children }) => {
  const [state, setState] = useState<ProposalGenerationState>(initialState);

  const setIsGeneratingProposal = (isGenerating: boolean) => {
    setState((prev) => ({
      ...prev,
      isGeneratingProposal: isGenerating
    }));
  };

  const setProgress = (progress: number) => {
    setState((prev) => ({
      ...prev,
      progress
    }));
  };

  const setMessage = (message: string) => {
    setState((prev) => ({
      ...prev,
      message
    }));
  };

  const setCurrentStep = (step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: step
    }));
  };

  const resetState = () => {
    setState(initialState);
  };

  const contextValue: ProposalGenerationContextType = {
    state,
    setIsGeneratingProposal,
    setProgress,
    setMessage,
    setCurrentStep,
    resetState
  };

  return (
    <ProposalGenerationContext.Provider value={contextValue}>
      {children}
    </ProposalGenerationContext.Provider>
  );
};

// Custom hook to use the context
export const useProposalGeneration = (): ProposalGenerationContextType => {
  const context = useContext(ProposalGenerationContext);
  if (context === undefined) {
    throw new Error(
      "useProposalGeneration must be used within a ProposalGenerationProvider"
    );
  }
  return context;
};
