/**
 * The site owner / admin is not a role stored in the database - it's
 * determined purely by whether a verified account's email appears in the
 * ADMIN_EMAILS environment variable. This makes admin setup a one-line env
 * var for anyone who clones this repo, with no manual DB editing required.
 */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
