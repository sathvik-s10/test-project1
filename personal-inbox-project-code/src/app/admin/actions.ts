"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin-emails";

export type ActionResult = { error?: string; success?: boolean };

export async function replyToTicket(
  ticketId: string,
  reply: string,
  status: "open" | "in_progress" | "closed"
): Promise<ActionResult> {
  await requireAdmin();

  if (!reply.trim()) {
    return { error: "Reply cannot be empty." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("tickets")
    .update({
      admin_reply: reply.trim(),
      status,
      replied_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function updateTicketStatus(
  ticketId: string,
  status: "open" | "in_progress" | "closed"
): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("tickets").update({ status }).eq("id", ticketId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

/**
 * Kick: deletes the user's Supabase auth account outright. Nothing stops
 * them from signing back up with the same email afterwards - that's the
 * difference from a ban.
 */
export async function kickUser(userId: string, email: string): Promise<ActionResult> {
  const admin_user = await requireAdmin();

  if (isAdminEmail(email) || userId === admin_user.id) {
    return { error: "You cannot kick an admin." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

/**
 * Ban: permanently blacklists the email (so it can never sign up or sign in
 * again) and deletes their current account, if they have one.
 */
export async function banUser(
  userId: string,
  email: string,
  reason: string
): Promise<ActionResult> {
  const admin_user = await requireAdmin();

  if (isAdminEmail(email) || userId === admin_user.id) {
    return { error: "You cannot ban an admin." };
  }

  const admin = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { error: banError } = await admin.from("banned_emails").insert({
    email: normalizedEmail,
    reason: reason.trim() || null,
    banned_by: admin_user.email,
  });

  if (banError) return { error: banError.message };

  if (userId) {
    await admin.auth.admin.deleteUser(userId);
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function unbanEmail(email: string): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("banned_emails")
    .delete()
    .eq("email", email.trim().toLowerCase());

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}
