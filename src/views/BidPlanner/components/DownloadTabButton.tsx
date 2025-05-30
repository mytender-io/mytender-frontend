import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL, HTTP_PREFIX } from "../../../helper/Constants";
import { tenderTabs } from "../../../utils/tenderTabsConfig";

interface DownloadTabButtonProps {
  object_id: string;
  currentTabIndex: number;
  tabContent: Record<number, string>;
  auth: { token: string } | null;
  className?: string;
}

const DownloadTabButton: React.FC<DownloadTabButtonProps> = ({
  object_id,
  currentTabIndex,
  tabContent,
  auth,
  className = ""
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!object_id) {
      toast.error("No bid ID found");
      return;
    }

    const currentTab = tenderTabs[currentTabIndex];
    const currentContent =
      tabContent[currentTabIndex as keyof typeof tabContent];

    if (!currentContent?.trim()) {
      toast.warning("No content available to download for this tab");
      return;
    }

    setIsDownloading(true);

    try {
      toast.info("Preparing document for download...");

      // Create FormData for the request
      const formData = new FormData();
      formData.append("bid_id", object_id);
      formData.append("tab_name", currentTab.name);
      formData.append("content", currentContent);
      formData.append("content_type", currentTab.stateKey);

      const response = await axios({
        method: "post",
        url: `http${HTTP_PREFIX}://${API_URL}/download_tender_insight`,
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
      a.download = `${currentTab.name.replace(/\s+/g, "_")}.docx`;

      // Append to the DOM, click and then remove
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success(`${currentTab.name} downloaded successfully`);
    } catch (error) {
      console.error("Error downloading tab content:", error);
      let errorMsg = "Failed to download document";

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          errorMsg = "Download service not available";
        } else if (axiosError.response?.status === 400) {
          errorMsg = "Invalid content for download";
        }
      }

      toast.error(errorMsg);
    } finally {
      setIsDownloading(false);
    }
  };

  const hasContent = Boolean(
    tabContent[currentTabIndex as keyof typeof tabContent]?.trim()
  );

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading || !hasContent || !object_id}
      className={`flex items-center gap-2 ${className}`}
    >
      {isDownloading ? (
        <RefreshCw size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      {isDownloading ? "Downloading..." : "Download"}
    </Button>
  );
};

export default DownloadTabButton;
