"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TicketFormState = {
  error?: string;
  success?: boolean;
};

export async function createTicket(
  _prevState: TicketFormState,
  formData: FormData
): Promise<TicketFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email_confirmed_at) {
    return { error: "You must be signed in with a verified email to send a ticket." };
  }

  const category = String(formData.get("category") ?? "general");
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!subject || !message) {
    return { error: "Subject and message are required." };
  }

  if (subject.length > 150) {
    return { error: "Subject must be under 150 characters." };
  }

  if (message.length > 5000) {
    return { error: "Message must be under 5000 characters." };
  }

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "User";

  const { error } = await supabase.from("tickets").insert({
    user_id: user.id,
    name,
    email: user.email,
    category,
    subject,
    message,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
