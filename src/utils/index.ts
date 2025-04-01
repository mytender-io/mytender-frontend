import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { enUS } from "date-fns/locale";
import { Locale } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const customLocale: Locale = {
  ...enUS,
  formatDistance: (token, count, options) => {
    const result = enUS.formatDistance(token, count, options);
    return result.replace("about ", "");
  }
};

export const getSectionHeading = (heading: string) => {
  const match = heading.match(/^[\d.]+/);
  const sectionNumber = match ? match[0] : "";
  return sectionNumber;
};

export const calculateWordCount = (htmlContent: string): number => {
  if (!htmlContent) return 0;

  // Create a temporary div to extract text from HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  // Get text content without HTML tags
  const textContent = tempDiv.textContent || tempDiv.innerText || "";

  // Split by whitespace and filter out empty strings
  return textContent.trim().split(/\s+/).filter(Boolean).length;
};
