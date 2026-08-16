export const OWNER_EMAIL = "ervanrahadian@gmail.com";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(normalizeEmail(email));
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  return normalizeEmail(email ?? "") === OWNER_EMAIL;
}

export function isAdminEmail(
  email: string | null | undefined,
  extraAdmins: readonly string[],
): boolean {
  const value = normalizeEmail(email ?? "");
  if (!value) {
    return false;
  }
  if (value === OWNER_EMAIL) {
    return true;
  }
  return extraAdmins.some((admin) => admin === value);
}
