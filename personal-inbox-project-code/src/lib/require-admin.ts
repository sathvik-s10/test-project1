import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-emails";

/**
 * Every admin server action and the /admin page call this first. It re-reads
 * the session from cookies on the server, so a non-admin can't just guess a
 * request shape to hit an admin action - the email in ADMIN_EMAILS is
 * re-checked on every call, not cached client-side.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  return user;
}
