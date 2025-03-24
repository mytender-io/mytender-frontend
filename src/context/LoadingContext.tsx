import React, { createContext, useState, useContext, ReactNode } from "react";
import LoadingOverlay from "../views/Bids/components/LoadingOverlay";

interface LoadingContextType {
  isGeneratingOutline: boolean;
  setIsGeneratingOutline: (value: boolean) => void;
  progress: number;
  setProgress: (value: number) => void;
  loadingMessage: string;
  setLoadingMessage: (value: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [isGeneratingOutline, setIsGeneratingOutline] =
    useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(
    "Analysing tender documents..."
  );

  return (
    <LoadingContext.Provider
      value={{
        isGeneratingOutline,
        setIsGeneratingOutline,
        progress,
        setProgress,
        loadingMessage,
        setLoadingMessage
      }}
    >
      {children}
      <LoadingOverlay
        isOpen={isGeneratingOutline}
        progress={progress}
        loadingMessage={loadingMessage}
      />
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
