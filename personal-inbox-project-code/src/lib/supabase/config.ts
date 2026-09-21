export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSupabaseAdminConfigured(): boolean {
  return isSupabaseConfigured() && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export const BACKEND_NOT_CONFIGURED_MESSAGE =
  "This site isn't connected to a real backend yet, so sign-in isn't available. Come back once it's configured.";
