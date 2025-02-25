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
