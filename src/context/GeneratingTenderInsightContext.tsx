import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import axios, { AxiosResponse } from "axios";
import { createContext, ReactNode, useContext, useState } from "react";
import { useAuthUser } from "react-auth-kit";

interface GeneratingTenderInsightContextType {
  loadingBidTab: number | null;
  setLoadingBidTab: (arg: number | null) => void;
  generate_tender_insights: (
    endpoint: string,
    formData: FormData,
    mounted: React.MutableRefObject<boolean>
  ) => Promise<void>;
  tenderInsight: AxiosResponse<unknown, unknown> | null;
  setTenderInsight: React.Dispatch<
    React.SetStateAction<AxiosResponse<unknown, unknown> | null>
  >;
  generatingInsightError: string;
  setGeneratingInsightError: React.Dispatch<React.SetStateAction<string>>;
}

const GeneratingTenderInsightContext = createContext<
  GeneratingTenderInsightContextType | undefined
>(undefined);

export const GeneratingTenderInsightProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const [loadingBidTab, setLoadingBidTab] = useState<number | null>(null);
  const [tenderInsight, setTenderInsight] = useState<AxiosResponse<
    unknown,
    unknown
  > | null>(null);
  const [generatingInsightError, setGeneratingInsightError] = useState("");

  const generate_tender_insights = async (
    endpoint: string,
    formData: FormData,
    mounted: React.MutableRefObject<boolean>
  ) => {
    try {
      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/${endpoint}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setTenderInsight(result);
    } catch (err) {
      if (mounted.current) {
        const errorMsg =
          err.response?.status === 404
            ? "No documents found in the tender library. Please upload documents before generating"
            : "An error occurred while regenerating. Please try again.";
        setGeneratingInsightError(errorMsg);
      }
    }
  };

  return (
    <GeneratingTenderInsightContext.Provider
      value={{
        loadingBidTab,
        setLoadingBidTab,
        generate_tender_insights,
        tenderInsight,
        setTenderInsight,
        generatingInsightError,
        setGeneratingInsightError
      }}
    >
      {children}
    </GeneratingTenderInsightContext.Provider>
  );
};

export const useGeneratingTenderInsightContext =
  (): GeneratingTenderInsightContextType => {
    const context = useContext(GeneratingTenderInsightContext);
    if (context === undefined) {
      throw new Error(
        "useGeneratingTenderInsightContext must be used within a GeneratingTenderInsightProvider"
      );
    }
    return context;
  };
