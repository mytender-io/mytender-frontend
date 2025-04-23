import { toast } from "react-toastify";
import posthog from "posthog-js";

export const handleApplyFeedbackImprovement = (
  feedbackId: string,
  improvedText: string,
  currentSectionIndex: number | null,
  editorRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
  outline: any[],
  setSharedState: Function,
  setActiveFeedback: Function
) => {
  if (currentSectionIndex !== null) {
    // First, find the feedback item
    const currentSection = outline[currentSectionIndex];
    const feedbackItem = currentSection.answerFeedback?.find(
      (feedback) => feedback.id === feedbackId
    );

    if (feedbackItem) {
      // Update the section content to replace highlighted text with improved version
      const editorElement = editorRefs.current[currentSectionIndex];

      if (editorElement) {
        // Find the feedback span
        const feedbackSpan = editorElement.querySelector(
          `span.feedback-text[data-feedback-id="${feedbackId}"]`
        );

        if (feedbackSpan) {
          // Create a plain text node with the improved content
          const textNode = document.createTextNode(improvedText);

          // Replace the span with improved text
          feedbackSpan.parentNode?.replaceChild(textNode, feedbackSpan);

          // Update the answer content in state with the modified HTML
          const newContent = editorElement.innerHTML;

          setSharedState((prevState) => {
            const newOutline = [...prevState.outline];
            // Update the content first
            newOutline[currentSectionIndex] = {
              ...newOutline[currentSectionIndex],
              answer: newContent
            };

            // Then mark the feedback as resolved
            if (newOutline[currentSectionIndex].answerFeedback) {
              const updatedFeedback = newOutline[
                currentSectionIndex
              ].answerFeedback.map((feedback) =>
                feedback.id === feedbackId
                  ? { ...feedback, resolved: true }
                  : feedback
              );

              newOutline[currentSectionIndex] = {
                ...newOutline[currentSectionIndex],
                answerFeedback: updatedFeedback
              };
            }

            return {
              ...prevState,
              outline: newOutline
            };
          });

          // Reset active feedback
          setActiveFeedback(null);

          // Track feedback applied event
          posthog.capture("feedback_improvement_applied", {
            feedbackId,
            sectionId: currentSection.section_id
          });

          toast.success("Feedback improvement applied");
        }
      }
    }
  }
};

/**
 * Handles resolving feedback by removing highlighting from HTML and updating state
 *
 * @param feedbackId - The unique ID of the feedback being resolved
 * @param currentSectionIndex - The index of the current section in the outline
 * @param editorRefs - React refs for all editor elements
 * @param outline - The current outline data structure containing all sections
 * @param setSharedState - Function to update the shared state
 * @param setActiveFeedback - Function to update the active feedback state
 */
export const handleFeedbackResolved = (
  feedbackId: string,
  currentSectionIndex: number | null,
  editorRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
  outline: any[],
  setSharedState: Function,
  setActiveFeedback: Function
) => {
  if (currentSectionIndex !== null) {
    // First, find the feedback item
    const currentSection = outline[currentSectionIndex];
    const feedbackItem = currentSection.answerFeedback?.find(
      (feedback) => feedback.id === feedbackId
    );

    if (feedbackItem) {
      // Update the section content to remove highlighting from HTML
      // This step needs to be done BEFORE updating the state
      const editorElement = editorRefs.current[currentSectionIndex];

      if (editorElement) {
        // Find the feedback span
        const feedbackSpan = editorElement.querySelector(
          `span.feedback-text[data-feedback-id="${feedbackId}"]`
        );

        if (feedbackSpan) {
          // Create a plain text node with the original content, no highlight
          const textNode = document.createTextNode(feedbackItem.originalText);

          // Replace the span with plain text
          feedbackSpan.parentNode?.replaceChild(textNode, feedbackSpan);

          // Update the answer content in state with the modified HTML
          const newContent = editorElement.innerHTML;

          setSharedState((prevState) => {
            const newOutline = [...prevState.outline];
            // Update the content first
            newOutline[currentSectionIndex] = {
              ...newOutline[currentSectionIndex],
              answer: newContent
            };

            // Then mark the feedback as resolved
            if (newOutline[currentSectionIndex].answerFeedback) {
              const updatedFeedback = newOutline[
                currentSectionIndex
              ].answerFeedback.map((feedback) =>
                feedback.id === feedbackId
                  ? { ...feedback, resolved: true }
                  : feedback
              );

              newOutline[currentSectionIndex] = {
                ...newOutline[currentSectionIndex],
                answerFeedback: updatedFeedback
              };
            }

            return {
              ...prevState,
              outline: newOutline
            };
          });

          // Reset active feedback
          setActiveFeedback(null);

          toast.success("Feedback Resolved");
        }
      }
    }
  }
};

/**
 * Highlights the selected feedback text by changing its background color
 *
 * @param feedbackId - The unique ID of the feedback to highlight
 */
export const highlightFeedbackText = (feedbackId: string) => {
  // First reset all feedback spans to default green color
  document.querySelectorAll("span.feedback-text").forEach((span) => {
    (span as HTMLElement).style.backgroundColor = "rgb(144, 238, 144)"; // Reset to light green

    // Reset all child elements
    const childElements = span.querySelectorAll("*");
    childElements.forEach((element) => {
      (element as HTMLElement).style.backgroundColor = "rgb(144, 238, 144)";
    });
  });

  // Then highlight the selected feedback span
  const feedbackSpan = document.querySelector(
    `span.feedback-text[data-feedback-id="${feedbackId}"]`
  );

  if (feedbackSpan) {
    (feedbackSpan as HTMLElement).style.backgroundColor = "rgb(76, 175, 80)"; // Darker green for active

    // Apply highlighting to all child elements
    const childElements = feedbackSpan.querySelectorAll("*");
    childElements.forEach((element) => {
      (element as HTMLElement).style.backgroundColor = "rgb(76, 175, 80)";
    });
  }
};

/**
 * Handles clicking on a feedback item, activating it and opening the feedback sidepane
 *
 * @param feedbackId - The unique ID of the feedback being clicked
 * @param currentSectionIndex - The index of the current section in the outline
 * @param outline - The current outline data structure containing all sections
 * @param setActiveFeedback - Function to update the active feedback state
 * @param setFeedbackSidepaneOpen - Function to toggle the feedback sidepane
 */
export const handleFeedbackClick = (
  feedbackId: string,
  currentSectionIndex: number | null,
  outline: any[],
  setActiveFeedback: Function,
  setFeedbackSidepaneOpen: Function
) => {
  if (currentSectionIndex !== null) {
    const currentSection = outline[currentSectionIndex];
    const feedbackItem = currentSection.answerFeedback?.find(
      (feedback) => feedback.id === feedbackId
    );

    if (feedbackItem) {
      // Set the feedback item as the active feedback
      setActiveFeedback(feedbackItem);

      // Open the feedback sidepane
      setFeedbackSidepaneOpen(true);

      // Highlight this specific feedback span
      highlightFeedbackText(feedbackId);

      // Track the event
      posthog.capture("feedback_item_clicked", {
        feedbackId,
        sectionId: currentSection.section_id
      });
    }
  }
};
