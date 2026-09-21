import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];
const COOKIE_NAME = "demo_session";

// Temporary demo version: checks the demo_session cookie set by
// src/lib/demo-auth.ts instead of calling Supabase, so pages work before a
// real Supabase project is connected. Swap back to the Supabase-backed
// version once real auth is wired up.
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasSession = !!request.cookies.get(COOKIE_NAME)?.value;

  if (!hasSession) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
