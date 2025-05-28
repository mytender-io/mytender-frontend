import React, { createContext, useContext, useState, ReactNode } from "react";

interface GeneratingSectionContextType {
  isGenerating: boolean;
  generatingSectionId: string | null;
  setGenerating: (isGenerating: boolean, sectionId?: string | null) => void;
}

const GeneratingSectionContext = createContext<
  GeneratingSectionContextType | undefined
>(undefined);

export const GenerationProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSectionId, setGeneratingSectionId] = useState<string | null>(
    null
  );

  const setGenerating = (
    generating: boolean,
    sectionId: string | null = null
  ) => {
    setIsGenerating(generating);
    setGeneratingSectionId(generating ? sectionId : null);
  };

  return (
    <GeneratingSectionContext.Provider
      value={{ isGenerating, generatingSectionId, setGenerating }}
    >
      {children}
    </GeneratingSectionContext.Provider>
  );
};

export const useGeneration = () => {
  const context = useContext(GeneratingSectionContext);
  if (context === undefined) {
    throw new Error("useGeneration must be used within a GenerationProvider");
  }
  return context;
};
