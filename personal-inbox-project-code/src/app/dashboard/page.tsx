import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-emails";
import { Header } from "@/components/header";
import { StatusBadge } from "@/components/status-badge";
import { TicketForm } from "./ticket-form";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (isAdminEmail(user.email)) {
    redirect("/admin");
  }

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "User";

  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, subject, category, status, message, admin_reply, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen">
      <Header email={user.email ?? ""} isAdmin={false} />

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <TicketForm name={name} email={user.email ?? ""} />

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Your tickets</h2>
          {!tickets || tickets.length === 0 ? (
            <p className="text-sm text-foreground-muted">You haven&apos;t sent any tickets yet.</p>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{ticket.subject}</p>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="mt-1 text-xs text-foreground-muted">
                    {new Date(ticket.created_at).toLocaleString()}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                    {ticket.message}
                  </p>
                  {ticket.admin_reply && (
                    <div className="mt-3 rounded-lg border border-accent/30 bg-accent/10 p-3">
                      <p className="text-xs font-medium text-accent">Reply from owner</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                        {ticket.admin_reply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
