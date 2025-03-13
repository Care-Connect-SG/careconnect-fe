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
        : "",
    )
    .join(" ");
}

export function convertUTCToLocal(utcDateString?: Date) {
  const date = new Date(utcDateString + "Z");
  return date;
}

export function formatDateWithoutSeconds(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();

  const datePart = date.toLocaleDateString();
  const timeParts = date.toLocaleTimeString().split(":");
  const formattedTime = `${timeParts[0]}:${timeParts[1]}`;

  const isToday = date.toDateString() === now.toDateString();
  const isYesterday =
    date.toDateString() ===
    new Date(now.setDate(now.getDate() - 1)).toDateString();

  let dateLabel = `on ${datePart}`;
  if (isToday) {
    dateLabel = "today";
  } else if (isYesterday) {
    dateLabel = "yesterday";
  }

  return `${dateLabel}, ${formattedTime}`;
}

export function formatDayMonthYear(date: Date): string {
  const day = date.getDate();

  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}
