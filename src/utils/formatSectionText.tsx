// Add these formatting utilities to your utils.js file

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

/**
 * Simple function to add Tailwind classes to existing HTML elements
 * @param {string} html - HTML content
 * @returns {string} - HTML with Tailwind classes
 */
export const addTailwindClasses = (html: string) => {
  if (!html) return "";

  // Add classes to common elements
  return html
    .replace(/<p>/g, '<p class="mb-4">')
    .replace(/<h1>/g, '<h1 class="text-2xl font-bold mt-6 mb-3">')
    .replace(/<h2>/g, '<h2 class="text-xl font-semibold mt-5 mb-2">')
    .replace(/<h3>/g, '<h3 class="text-lg font-semibold mt-4 mb-2">')
    .replace(/<ul>/g, '<ul class="list-disc pl-5 mb-4">')
    .replace(/<ol>/g, '<ol class="list-decimal pl-5 mb-4">')
    .replace(/<li>/g, '<li class="mb-1">')
    .replace(/<strong>/g, '<strong class="font-bold">')
    .replace(/<em>/g, '<em class="italic">')
    .replace(
      /<blockquote>/g,
      '<blockquote class="pl-4 border-l-4 border-gray-300 italic my-4">'
    );
};
