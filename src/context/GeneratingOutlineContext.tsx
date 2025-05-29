import React, { createContext, useState, ReactNode, useContext } from "react";

interface GeneratingOutlineState {
  currentStep: number;
  isGeneratingOutline: boolean;
  progress: number;
  loadingMessage: string;
  error: string | null;
}

interface GeneratingOutlineContextType {
  state: GeneratingOutlineState;
  setCurrentStep: (step: number) => void;
  setIsGeneratingOutline: (isGenerating: boolean) => void;
  setProgress: (progress: number) => void;
  setLoadingMessage: (message: string) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

const initialState: GeneratingOutlineState = {
  currentStep: 1,
  isGeneratingOutline: false,
  progress: 0,
  loadingMessage: "Analysing tender documents...",
  error: null
};

const GeneratingOutlineContext = createContext<
  GeneratingOutlineContextType | undefined
>(undefined);

interface GeneratingOutlineProviderProps {
  children: ReactNode;
}

export const GeneratingOutlineProvider: React.FC<
  GeneratingOutlineProviderProps
> = ({ children }) => {
  const [state, setState] = useState<GeneratingOutlineState>({
    ...initialState
  });

  const setCurrentStep = (step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: step
    }));
  };

  const setIsGeneratingOutline = (isGenerating: boolean) => {
    setState((prev) => ({
      ...prev,
      isGeneratingOutline: isGenerating
    }));
  };

  const setProgress = (progress: number) => {
    setState((prev) => ({
      ...prev,
      progress
    }));
  };

  const setLoadingMessage = (message: string) => {
    setState((prev) => ({
      ...prev,
      loadingMessage: message
    }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({
      ...prev,
      error
    }));
  };

  const resetState = () => {
    setState({ ...initialState });
  };

  const contextValue: GeneratingOutlineContextType = {
    state,
    setCurrentStep,
    setIsGeneratingOutline,
    setProgress,
    setLoadingMessage,
    setError,
    resetState
  };

  return (
    <GeneratingOutlineContext.Provider value={contextValue}>
      {children}
    </GeneratingOutlineContext.Provider>
  );
};

// Custom hook to use the context
export const useGeneratingOutline = (): GeneratingOutlineContextType => {
  const context = useContext(GeneratingOutlineContext);
  if (context === undefined) {
    throw new Error(
      "useGeneratingOutline must be used within an GeneratingOutlineProvider"
    );
  }
  return context;
};