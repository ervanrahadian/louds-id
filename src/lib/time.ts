import type { Timestamp } from "firebase/firestore";

const dateLabelFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Converts a Firestore timestamp-like value to a Date. */
export function toDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "object" && "toDate" in value) {
    try {
      return (value as Timestamp).toDate();
    } catch {
      return null;
    }
  }

  return null;
}

export function isSameDay(
  left: Date | null | undefined,
  right: Date | null | undefined,
): boolean {
  if (!left || !right) {
    return false;
  }
  return startOfDay(left) === startOfDay(right);
}

/** 24-hour clock time, e.g. 14.00 */
export function formatTime(date: Date | null | undefined): string {
  if (!date) {
    return "";
  }
  return `${pad(date.getHours())}.${pad(date.getMinutes())}`;
}

/** Sidebar preview: time today, otherwise DD/MM/YY. */
export function formatListTime(date: Date | null | undefined): string {
  if (!date) {
    return "";
  }
  if (isSameDay(date, new Date())) {
    return formatTime(date);
  }
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${pad(date.getFullYear() % 100)}`;
}

/** Day label used as a separator in the transcript. */
export function formatDateLabel(date: Date): string {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const dayMs = 24 * 60 * 60 * 1000;

  if (target === today) {
    return "Today";
  }
  if (target === today - dayMs) {
    return "Yesterday";
  }
  return dateLabelFormat.format(date);
}
