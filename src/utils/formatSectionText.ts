/**
 * Formats text content to properly display paragraphs, bold text, and other formatting
 * Compatible with Tailwind styling approach
 * @param {string} text - The raw text to format
 * @returns {string} - The formatted HTML string
 */
export const formatSectionText = (text: string) => {
  if (!text || typeof text !== "string") return "";

  // If the text already contains HTML formatting, just return it
  if (
    text.includes("<p>") ||
    text.includes("<div>") ||
    text.includes("<span>")
  ) {
    return text;
  }

  // Format plain text with proper HTML
  let formatted = text;

  // Format Bold text with **markers**
  formatted = formatted.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-bold">$1</strong>'
  );

  // Split by double line breaks and wrap in paragraphs
  formatted = formatted
    .split(/\n\s*\n/)
    .map((para) => `<p class="mb-4">${para.replace(/\n/g, "<br>")}</p>`)
    .join("");

  // If no paragraphs were created, wrap the whole content
  if (!formatted.includes("<p")) {
    formatted = `<p class="mb-4">${formatted}</p>`;
  }

  return formatted;
};
