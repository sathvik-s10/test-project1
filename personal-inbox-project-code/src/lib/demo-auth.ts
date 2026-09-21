import "server-only";
import { cookies } from "next/headers";

/**
 * Temporary stand-in for Supabase auth so login/signup can be demoed before
 * a real Supabase project is wired up. Accepts any email/password, just
 * remembers who "signed in" in a cookie. Swap this out for real Supabase
 * auth (see src/lib/supabase/server.ts) when ready.
 */
const COOKIE_NAME = "demo_session";

export type DemoUser = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
};

export async function getDemoUser(): Promise<DemoUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoUser;
  } catch {
    return null;
  }
}

export async function setDemoUser(user: DemoUser) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearDemoUser() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
