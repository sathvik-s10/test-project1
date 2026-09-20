import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components. Uses the public anon key,
 * so it is safe to bundle for the browser. Row Level Security policies are
 * what actually keep users scoped to their own data.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
