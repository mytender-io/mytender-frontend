import { toast } from "react-toastify";
import { Section, UserComment } from "../BidWritingStateManagerView";

/**
 * Creates and saves a new comment for a section
 *
 * This function:
 * 1. Validates comment text and section
 * 2. Creates a unique comment ID
 * 3. Handles positioning to prevent overlapping comments
 * 4. Updates DOM elements to highlight commented text
 * 5. Updates shared state with the new comment
 *
 * @param commentText - The text content of the comment
 * @param currentSectionIndex - Index of the current section in the outline
 * @param selectionMenuPosition - Position coordinates for the comment
 * @param outline - Array of sections
 * @param auth - Authentication object containing user information
 * @param setSharedState - Function to update the shared application state
 * @param setCommentText - Function to reset the comment text input
 * @param setShowSelectionMenu - Function to toggle the selection menu visibility
 * @param setShowCommentInput - Function to toggle the comment input visibility
 * @param highlightCommentAndText - Function to highlight the commented text
 */
export const handleSaveComment = (
  commentText: string,
  currentSectionIndex: number | null,
  selectionMenuPosition: { top: number },
  outline: Section[],
  auth: any,
  setSharedState: Function,
  setCommentText: Function,
  setShowSelectionMenu: Function,
  setShowCommentInput: Function,
  highlightCommentAndText: Function
) => {
  // Validate inputs before proceeding
  if (!commentText.trim() || currentSectionIndex === null) {
    setShowSelectionMenu(false);
    setShowCommentInput(false);
    return;
  }

  const commentId = `comment-${Date.now()}`;
  const currentSection = outline[currentSectionIndex];
  const currentComments = currentSection.comments || [];

  // calculate the position, avoiding overlaps with existing comments
  let position = selectionMenuPosition.top;
  const existingCommentPositions = currentComments.map((c) => c.position);
  while (existingCommentPositions.includes(position)) {
    position += 30; // Move down by 30px if position is already taken
  }

  // Update DOM to highlight the commented text
  const pendingSpans = document.querySelectorAll(
    'span.commented-text[data-comment-id^="pending-"]'
  );

  if (pendingSpans.length > 0) {
    const span = pendingSpans[pendingSpans.length - 1];
    span.dataset.commentId = commentId;

    // Make the highlight a darker grey instead of orange
    span.style.backgroundColor = "#FFE5CC";

    // Apply the style to all child elements
    const childElements = span.querySelectorAll("*");
    childElements.forEach((element) => {
      (element as HTMLElement).style.backgroundColor = "#FFE5CC";
    });

    // Add click event to highlight when clicked
    span.addEventListener("click", () => {
      highlightCommentAndText(commentId);
    });
  }

  // create the new comment
  const newComment: UserComment = {
    id: commentId,
    text: commentText,
    resolved: false,
    position: position,
    sectionId: currentSection.section_id,
    author: auth?.name || auth?.email || "Anonymous",
    createdAt: new Date().toISOString(),
    replies: [] // Initialize with empty replies array
  };

  // Update the section in the shared state to include the new comment
  setSharedState((prevState) => {
    const newOutline = [...prevState.outline];

    // Initialize comments array if it doesn't exist
    if (!newOutline[currentSectionIndex].comments) {
      newOutline[currentSectionIndex].comments = [];
    }

    // Add the new comment
    newOutline[currentSectionIndex].comments.push(newComment);

    return {
      ...prevState,
      outline: newOutline
    };
  });

  // Reset input state
  setCommentText("");
  setShowSelectionMenu(false);
  setShowCommentInput(false);
};

/**
 * Cancels the comment creation process
 *
 * This function:
 * 1. Removes any pending comment spans from the DOM
 * 2. Resets the comment input state
 * 3. Hides comment-related UI components
 *
 * @param setCommentText - Function to reset the comment text input
 * @param setShowSelectionMenu - Function to hide the selection menu
 * @param setShowCommentInput - Function to hide the comment input
 */
export const handleCancelComment = (
  setCommentText: Function,
  setShowSelectionMenu: Function,
  setShowCommentInput: Function
): void => {
  // Find and remove the pending comment spans
  const pendingSpans = document.querySelectorAll(
    'span.commented-text[data-comment-id^="pending-"]'
  );

  if (pendingSpans.length > 0) {
    const span = pendingSpans[pendingSpans.length - 1];
    // Replace the span with its text content
    const textNode = document.createTextNode(span.textContent || "");
    span.parentNode?.replaceChild(textNode, span);
  }

  setCommentText("");
  setShowSelectionMenu(false);
  setShowCommentInput(false);
};

/**
 * Toggles the resolution status of a comment
 *
 * This function:
 * 1. Updates a comment's resolved status in the shared state
 * 2. If resolving, removes highlight spans from the DOM while preserving text
 *
 * @param id - The ID of the comment to toggle
 * @param currentSectionIndex - Index of the current section in the outline
 * @param setSharedState - Function to update the shared application state
 */
export const handleToggleResolution = (
  id: string,
  currentSectionIndex: number | null,
  setSharedState: Function
): void => {
  if (currentSectionIndex === null) return;

  // Update the comment's resolved status in shared state
  setSharedState((prevState: any) => {
    const newOutline = [...prevState.outline];
    const sectionComments = newOutline[currentSectionIndex].comments || [];

    const updatedComments = sectionComments.map((comment: UserComment) => {
      if (comment.id === id) {
        // If resolving the comment, remove the highlight
        if (!comment.resolved) {
          const commentedSpan = document.querySelector(
            `span.commented-text[data-comment-id="${id}"]`
          );

          if (commentedSpan) {
            // First, remove background color from all child elements
            const childElements = commentedSpan.querySelectorAll("*");
            childElements.forEach((element) => {
              (element as HTMLElement).style.backgroundColor = "";
            });

            // Create a document fragment to hold all the span's contents
            const fragment = document.createDocumentFragment();

            // Move all child nodes from the span to the fragment
            while (commentedSpan.firstChild) {
              // Remove background color from the node if it's an element
              if (commentedSpan.firstChild.nodeType === Node.ELEMENT_NODE) {
                (
                  commentedSpan.firstChild as HTMLElement
                ).style.backgroundColor = "";
              }
              fragment.appendChild(commentedSpan.firstChild);
            }
          }
        }

        // Toggle the resolved status
        return { ...comment, resolved: !comment.resolved };
      }
      return comment;
    });

    newOutline[currentSectionIndex].comments = updatedComments;

    return {
      ...prevState,
      outline: newOutline
    };
  });
};

/**
 * Adds a reply to an existing comment
 *
 * This function:
 * 1. Validates the reply text and section
 * 2. Creates a new reply with author information and timestamp
 * 3. Updates shared state with the new reply
 *
 * @param commentId - The ID of the comment to reply to
 * @param replyText - The text content of the reply
 * @param currentSectionIndex - Index of the current section in the outline
 * @param auth - Authentication object containing user information
 * @param setSharedState - Function to update the shared application state
 * @param setReplyText - Function to reset the reply text input
 */
export const handleSubmitReply = (
  commentId: string,
  replyText: string,
  currentSectionIndex: number | null,
  auth: any,
  setSharedState: Function,
  setReplyText: Function
): void => {
  if (!replyText.trim() || !commentId || currentSectionIndex === null) {
    return;
  }

  // Create a new reply object
  const newReply = {
    id: `reply-${Date.now()}`,
    text: replyText,
    author: auth?.name || auth?.email || "Anonymous",
    createdAt: new Date().toISOString()
  };

  // Update shared state to include the new reply
  setSharedState((prevState) => {
    const newOutline = [...prevState.outline];
    const sectionComments = newOutline[currentSectionIndex].comments || [];

    const updatedComments = sectionComments.map((comment: UserComment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        };
      }
      return comment;
    });

    newOutline[currentSectionIndex].comments = updatedComments;

    return {
      ...prevState,
      outline: newOutline
    };
  });

  setReplyText("");
  toast.success("Reply added");
};

/**
 * Cancels the reply creation process
 *
 * @param setReplyText - Function to reset the reply text input
 * @param setActiveComment - Function to clear the active comment state
 */
export const handleCancelReply = (
  setReplyText: Function,
  setActiveComment: Function
): void => {
  setReplyText("");
  setActiveComment(null);
};

/**
 * Gets all active (unresolved) comments for the current section
 *
 * @param outline - Array of document sections
 * @param currentSectionId - ID of the current section
 * @returns An array of unresolved comments for the current section
 */
export const getCommentsForCurrentSection = (
  outline: Section[],
  currentSectionId: string | null
): UserComment[] => {
  if (!currentSectionId) {
    return [];
  }

  // Find the current section
  const currentSection = outline.find(
    (section) => section.section_id === currentSectionId
  );

  if (!currentSection || !currentSection.comments) {
    return [];
  }

  // Filter out resolved comments
  return currentSection.comments.filter((comment) => !comment.resolved);
};
