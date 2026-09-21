import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin-emails";
import { Header } from "@/components/header";
import { TicketList, type Ticket } from "./ticket-list";
import { UserList } from "./user-list";
import { BannedList } from "./banned-list";

function mapUsers(
  rawUsers: { id: string; email?: string; created_at: string; email_confirmed_at?: string | null }[]
) {
  return rawUsers
    .map((u) => ({
      id: u.id,
      email: u.email ?? "(no email)",
      createdAt: u.created_at,
      emailConfirmed: !!u.email_confirmed_at,
      isAdmin: isAdminEmail(u.email),
    }))
    .sort((a, b) => (a.email > b.email ? 1 : -1));
}

export default async function AdminPage() {
  const admin_user = await requireAdmin();

  // User/ticket/ban data still needs a real Supabase project connected -
  // until then this just shows empty lists instead of crashing the page.
  let tickets: Ticket[] = [];
  let users: ReturnType<typeof mapUsers> = [];
  let bannedEmails: { email: string; reason: string | null; bannedBy: string | null; bannedAt: string }[] = [];
  try {
    const admin = createAdminClient();
    const [{ data: ticketData }, { data: usersPage }, { data: banned }] = await Promise.all([
      admin
        .from("tickets")
        .select("id, name, email, category, subject, message, status, admin_reply, created_at")
        .order("created_at", { ascending: false }),
      admin.auth.admin.listUsers({ perPage: 1000 }),
      admin
        .from("banned_emails")
        .select("email, reason, banned_by, banned_at")
        .order("banned_at", { ascending: false }),
    ]);

    tickets = (ticketData ?? []) as Ticket[];
    users = mapUsers(usersPage?.users ?? []);
    bannedEmails = (banned ?? []).map((b) => ({
      email: b.email,
      reason: b.reason,
      bannedBy: b.banned_by,
      bannedAt: b.banned_at,
    }));
  } catch {
    // Supabase not connected yet - keep the empty defaults above.
  }

  const openCount = (tickets ?? []).filter((t) => t.status !== "closed").length;

  return (
    <div className="min-h-screen">
      <Header email={admin_user.email ?? ""} isAdmin />

      <main className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Tickets{" "}
            <span className="text-sm font-normal text-foreground-muted">
              ({openCount} open)
            </span>
          </h2>
          <TicketList tickets={(tickets ?? []) as Ticket[]} />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Users</h2>
          <UserList users={users} />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Banned emails</h2>
          <BannedList banned={bannedEmails} />
        </section>
      </main>
    </div>
  );
}
