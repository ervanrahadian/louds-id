import type { Timestamp } from "firebase/firestore";

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const timeFormat = new Intl.DateTimeFormat("en", {
  hour: "numeric",
  minute: "2-digit",
});
const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

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

/** Compact relative time for sidebar previews. */
export function formatRelativeTime(date: Date | null | undefined): string {
  if (!date) {
    return "";
  }

  let duration = (date.getTime() - Date.now()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return relative.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return "";
}

/** Clock time for message bubbles. */
export function formatTime(date: Date | null | undefined): string {
  if (!date) {
    return "";
  }
  return timeFormat.format(date);
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
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
  return dateFormat.format(date);
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
