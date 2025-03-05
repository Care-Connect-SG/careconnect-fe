import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toTitleCase(str: string, locale = undefined) {
  return str
    .split(" ")
    .map((word) =>
      word.length > 0
        ? word.charAt(0).toLocaleUpperCase(locale) +
          word.slice(1).toLocaleLowerCase(locale)
        : ""
    )
    .join(" ");
}
