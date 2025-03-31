import { MutableRefObject, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import axios from "axios";
import { toast } from "react-toastify";
import posthog from "posthog-js";
import PencilEditCheckIcon from "@/components/icons/PencilEditCheckIcon";
import { Section, SharedState } from "@/views/BidWritingStateManagerView";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";

interface MarkReviewReadyButtonProps {
  section: Section;
  index: number;
  objectId: string | null;
  organizationUsers: any;
  tokenRef: MutableRefObject<string>;
  setSharedState: (setState: any) => void;
}

const MarkReviewReadyButton = ({
  section,
  index,
  objectId,
  organizationUsers,
  tokenRef,
  setSharedState
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
        (user: any) => user.username === section.reviewer
      );

      // if (!reviewerUser || !reviewerUser.email) {
      //   toast.error(
      //     "Could not find reviewer's email. Please reassign the reviewer."
      //   );
      //   return;
      // }

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
        setSharedState((prevState: SharedState) => {
          const newOutline = [...prevState.outline];
          newOutline[index] = {
            ...newOutline[index],
            review_ready: true
          };
          return {
            ...prevState,
            outline: newOutline
          };
        });

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
      className={`text-xs ${
        section.review_ready
          ? "bg-green-500 hover:bg-green-600 text-white border-green-500 disabled:opacity-100"
          : "text-gray-hint_text"
      }`}
      onClick={handleMarkAsReviewReady}
      disabled={isLoading || section.review_ready}
    >
      {isLoading ? <Spinner /> : <PencilEditCheckIcon />}
      {section.review_ready ? "Ready for Review" : "Mark as Review Ready"}
    </Button>
  );
};

export default MarkReviewReadyButton;
