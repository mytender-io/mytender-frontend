import React, { useState } from "react";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import posthog from "posthog-js";

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bidId?: string; // Optional bid ID to associate feedback with
  token?: string; // Auth token
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  isOpen,
  onClose,
  bidId,
  token
}) => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!bidId) {
      toast.error("No bid selected for feedback");
      return;
    }

    if (!feedback.trim()) {
      toast.error("Please enter feedback before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      posthog.capture("submit_bid_feedback", {
        bid_id: bidId
      });

      const formData = new FormData();
      formData.append("bid_id", bidId);
      formData.append("feedback", feedback);

      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/submit_bid_feedback`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.data && response.data.status === "success") {
        toast.success("Feedback submitted successfully");
        setFeedback("");
        onClose();
      } else {
        toast.error("Failed to submit feedback");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const errorMessage =
            err.response.data?.detail || "Failed to submit feedback";
          toast.error(errorMessage);
        } else if (err.request) {
          toast.error("No response received from server. Please try again.");
        }
      } else {
        toast.error("Error submitting feedback. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Feedback</DialogTitle>
          <DialogDescription>
            Please add your feedback from the bid to help improve your future
            responses and continually train your own model.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback here..."
            className="min-h-[120px]"
            disabled={isSubmitting}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmitFeedback}
            disabled={isSubmitting || !feedback.trim()}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
