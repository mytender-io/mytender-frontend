import { MutableRefObject, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import axios from "axios";
import { toast } from "react-toastify";
import posthog from "posthog-js";
import PencilEditCheckIcon from "@/components/icons/PencilEditCheckIcon";
import { Section } from "@/views/BidWritingStateManagerView";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";

interface MarkReviewReadyButtonProps {
  section: Section;
  index: number;
  objectId: string | null;
  organizationUsers: any;
  tokenRef: MutableRefObject<string>;
}

const MarkReviewReadyButton = ({
  section,
  index,
  objectId,
  organizationUsers,
  tokenRef
}: MarkReviewReadyButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsReviewReady = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      // If no reviewer has been assigned, show a toast and return
      if (!section.reviewer) {
        toast.warning(
          "Please assign a reviewer before marking as review ready"
        );
        return;
      }

      // Find the reviewer in the organization users to get their email
      const reviewerUser = organizationUsers.find(
        (user) => user.username === section.reviewer
      );

      if (!reviewerUser || !reviewerUser.email) {
        toast.error(
          "Could not find reviewer's email. Please reassign the reviewer."
        );
        return;
      }

      // Create a task for the reviewer
      const taskData = {
        name: `Review section: ${section.heading} (Ready for Review)`,
        bid_id: objectId,
        index: index,
        priority: "high", // Optionally set higher priority for review tasks
        target_user: reviewerUser.username
      };

      // Create the task
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/set_user_task`,
        taskData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      if (response.data.success) {
        // Track review ready action with posthog
        posthog.capture("section_marked_review_ready", {
          bidId: objectId,
          sectionId: section.section_id,
          sectionHeading: section.heading,
          reviewer: section.reviewer,
          emailSent: true
        });

        toast.success(
          `Section "${section.heading}" marked as Review Ready and notification sent to ${reviewerUser.username}`
        );
      } else {
        console.error("Error creating review task:", response.data.error);
        toast.error("Failed to assign review task");
      }
    } catch (error) {
      console.error("Error marking section as review ready:", error);
      toast.error("Failed to mark section as review ready");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-xs text-gray-hint_text"
      onClick={handleMarkAsReviewReady}
      disabled={isLoading}
    >
      {isLoading ? (
        <Spinner className="mr-2 h-4 w-4" />
      ) : (
        <PencilEditCheckIcon />
      )}
      Mark as Review Ready
    </Button>
  );
};

export default MarkReviewReadyButton;
