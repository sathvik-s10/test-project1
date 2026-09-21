"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin-emails";
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  BACKEND_NOT_CONFIGURED_MESSAGE,
} from "@/lib/supabase/config";

export type AuthFormState = {
  error?: string;
  info?: string;
};

async function isEmailBanned(email: string): Promise<boolean> {
  if (!isSupabaseAdminConfigured()) return false;

  const admin = createAdminClient();
  const { data } = await admin
    .from("banned_emails")
    .select("email")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  return !!data;
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return { error: BACKEND_NOT_CONFIGURED_MESSAGE };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (await isEmailBanned(email)) {
    return { error: "This email has been banned from this site." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user?.email_confirmed_at) {
    redirect("/verify-email");
  }

  if (isAdminEmail(data.user.email)) {
    redirect("/admin");
  }

  redirect("/dashboard");
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return { error: BACKEND_NOT_CONFIGURED_MESSAGE };
  }

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

  if (await isEmailBanned(email)) {
    return { error: "This email has been banned from this site." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    info: "Account created! Check your email for a verification link before signing in.",
  };
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
