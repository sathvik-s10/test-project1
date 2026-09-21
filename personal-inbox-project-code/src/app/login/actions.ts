"use server";

import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin-emails";
import { setDemoUser, clearDemoUser } from "@/lib/demo-auth";

// Temporary demo version: accepts any email/password and just remembers the
// "logged in" user in a cookie, instead of calling Supabase. This lets
// login/signup be demoed before a real Supabase project is connected.
// Swap back to real Supabase auth (see git history) when ready.

export type AuthFormState = {
  error?: string;
  info?: string;
};

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  await setDemoUser({
    id: email,
    email,
    name: email.split("@")[0],
    isAdmin: isAdminEmail(email),
  });

  if (isAdminEmail(email)) {
    redirect("/admin");
  }

  redirect("/dashboard");
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  await setDemoUser({ id: email, email, name, isAdmin: isAdminEmail(email) });

  if (isAdminEmail(email)) {
    redirect("/admin");
  }

  redirect("/dashboard");
}

export async function signOut() {
  await clearDemoUser();
  redirect("/login");
}
