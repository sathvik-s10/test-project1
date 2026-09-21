import "server-only";
import { redirect } from "next/navigation";
import { getDemoUser } from "@/lib/demo-auth";

// Temporary demo version: checks the demo_session cookie instead of a real
// Supabase session. Swap back to Supabase-backed auth when ready.
export async function requireAdmin() {
  const user = await getDemoUser();

  if (!user || !user.isAdmin) {
    redirect("/dashboard");
  }

  return user;
}
