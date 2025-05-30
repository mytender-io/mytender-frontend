import React, { useContext, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { BidContext } from "@/views/BidWritingStateManagerView";
import { Download, Loader2 } from "lucide-react";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import { posthog } from "posthog-js";

const DownloadProposalButton: React.FC = () => {
  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  const tokenRef = useRef(auth?.token || "default");
  const { sharedState } = useContext(BidContext);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadDocument = async () => {
    if (!sharedState.object_id) {
      toast.error("No bid ID found");
      return;
    }

    setIsDownloading(true);

    try {
      toast.info("Preparing document for download...");

      // Create FormData instead of JSON
      const formData = new FormData();
      formData.append("bid_id", sharedState.object_id);

      const response = await axios({
        method: "post",
        url: `http${HTTP_PREFIX}://${API_URL}/generate_docx`,
        data: formData,
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${tokenRef.current}`
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
      a.download = `${sharedState.bidInfo || "proposal"}.docx`;

      // Append to the DOM, click and then remove
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success("Document downloaded successfully");

      // Track download with posthog
      posthog.capture("proposal_document_downloaded", {
        bidId: sharedState.object_id,
        format: "docx"
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center">
      <Button
        onClick={handleDownloadDocument}
        className="flex items-center gap-2"
        disabled={isDownloading}
        variant="outline"
      >
        {isDownloading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download Proposal
          </>
        )}
      </Button>
    </div>
  );
};

export default DownloadProposalButton;
