type ClassValue = string | number | false | null | undefined;

/** Joins conditional class names into a single className string. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}

/** Returns the first non-empty trimmed string, or a fallback. */
export function firstName(displayName: string | null | undefined): string {
  const name = displayName?.trim();
  if (!name) {
    return "Someone";
  }
  return name.split(/\s+/)[0] ?? name;
}

/** Builds initials from a display name or email. */
export function initials(
  displayName: string | null | undefined,
  email: string | null | undefined,
): string {
  const name = displayName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  const local = email?.split("@")[0];
  if (local) {
    return local.slice(0, 2).toUpperCase();
  }

  return "?";
}
