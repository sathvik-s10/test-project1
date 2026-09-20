import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the SERVICE ROLE key. This bypasses Row
 * Level Security entirely, so it must NEVER be imported into any file that
 * can end up in a Client Component bundle. The `server-only` import above
 * makes any accidental client-side import fail at build time.
 *
 * Only used by admin-only server actions (kick/ban users, list all tickets,
 * reply to tickets) after verifying the caller's email is in ADMIN_EMAILS.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
