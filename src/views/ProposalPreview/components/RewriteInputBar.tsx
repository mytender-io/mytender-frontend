import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { X, Send } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import { Section } from "@/views/BidWritingStateManagerView";

interface RewriteInputBarProps {
  section: Section;
  sectionIndex: number;
  isActive: boolean;
  objectId: string | null;
  tokenRef: React.MutableRefObject<string>;
  onCancel: () => void;
  onRewriteSuccess: (sectionIndex: number, updatedSection: any) => void;
}

const RewriteInputForm: React.FC<RewriteInputBarProps> = ({
  section,
  sectionIndex,
  isActive,
  objectId,
  tokenRef,
  onCancel,
  onRewriteSuccess
}) => {
  const [rewriteFeedback, setRewriteFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleRewriteSubmit = async () => {
    if (!rewriteFeedback.trim() || !objectId) {
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("section", JSON.stringify(section));
      formData.append("user_feedback", rewriteFeedback);
      formData.append("bid_id", objectId);

      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/rewrite_section`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      if (response.data) {
        // Pass the updated section back to the parent component
        onRewriteSuccess(sectionIndex, response.data);
        toast.success("Section rewritten successfully");
        // Clear the input
        setRewriteFeedback("");
      }
    } catch (error) {
      console.error("Error rewriting section:", error);
      toast.error("Failed to rewrite section");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isSubmitting) {
      e.preventDefault();
      if (rewriteFeedback.trim()) {
        handleRewriteSubmit();
      }
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 relative border border-gray-200 rounded-md p-2 bg-white shadow-tooltip my-2">
      <Input
        placeholder="Please type your instructions in here..."
        value={rewriteFeedback}
        onChange={(e) => setRewriteFeedback(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSubmitting}
        className="flex-1 border-none outline-none bg-transparent focus-visible:ring-0 shadow-none text-sm h-8 px-2"
      />
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X size={16} />
        </Button>
        <Button
          onClick={handleRewriteSubmit}
          disabled={!rewriteFeedback.trim() || isSubmitting}
          size="icon"
          className="h-8 w-8 rounded-full"
        >
          {isSubmitting ? (
            <Spinner className="text-white" />
          ) : (
            <Send className="text-white" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default RewriteInputForm;
