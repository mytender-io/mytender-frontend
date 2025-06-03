import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL, HTTP_PREFIX } from "../../../helper/Constants";

interface DownloadAllInsightsButtonProps {
  object_id: string;
  tabContent: Record<number, string>;
  auth: { token: string } | null;
  className?: string;
}

const DownloadAllInsightsButton: React.FC<DownloadAllInsightsButtonProps> = ({
  object_id,
  tabContent,
  auth,
  className = ""
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadAll = async () => {
    if (!object_id) {
      toast.error("No bid ID found");
      return;
    }

    // Check if any content exists
    const hasAnyContent = Object.values(tabContent).some((content) =>
      content?.trim()
    );
    if (!hasAnyContent) {
      toast.warning("No content available to download");
      return;
    }

    setIsDownloading(true);

    try {
      toast.info("Preparing complete analysis document...");

      // Create FormData for the request
      const formData = new FormData();
      formData.append("bid_id", object_id);
      formData.append("tender_summary", tabContent[0] || "");
      formData.append("evaluation_criteria", tabContent[1] || "");
      formData.append("derive_insights", tabContent[2] || "");
      formData.append("differentiation_opportunities", tabContent[3] || "");
      formData.append("compliance_requirements", tabContent[4] || "");

      const response = await axios({
        method: "post",
        url: `http${HTTP_PREFIX}://${API_URL}/download_all_tender_insights`,
        data: formData,
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${auth?.token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a temporary link element to trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = "Complete_Tender_Analysis.docx";

      // Append to the DOM, click and then remove
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success("Complete tender analysis downloaded successfully");
    } catch (error) {
      console.error("Error downloading all insights:", error);
      let errorMsg = "Failed to download complete analysis";

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          errorMsg = "Download service not available";
        } else if (axiosError.response?.status === 400) {
          errorMsg = "No content available for download";
        }
      }
      toast.error(errorMsg);
    } finally {
      setIsDownloading(false);
    }
  };

  const hasAnyContent = Object.values(tabContent).some((content) =>
    content?.trim()
  );

  return (
    <Button
      variant="outline"
      onClick={handleDownloadAll}
      disabled={isDownloading || !hasAnyContent || !object_id}
      className={`flex items-center gap-2 ${className}`}
    >
      {isDownloading ? (
        <RefreshCw size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      {isDownloading ? "Downloading..." : "Download All"}
    </Button>
  );
};

export default DownloadAllInsightsButton;
