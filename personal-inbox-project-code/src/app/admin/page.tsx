import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin-emails";
import { Header } from "@/components/header";
import { TicketList, type Ticket } from "./ticket-list";
import { UserList } from "./user-list";
import { BannedList } from "./banned-list";

export default async function AdminPage() {
  const admin_user = await requireAdmin();
  const admin = createAdminClient();

  const [{ data: tickets }, { data: usersPage }, { data: banned }] = await Promise.all([
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

  const users = (usersPage?.users ?? [])
    .map((u) => ({
      id: u.id,
      email: u.email ?? "(no email)",
      createdAt: u.created_at,
      emailConfirmed: !!u.email_confirmed_at,
      isAdmin: isAdminEmail(u.email),
    }))
    .sort((a, b) => (a.email > b.email ? 1 : -1));

  const bannedEmails = (banned ?? []).map((b) => ({
    email: b.email,
    reason: b.reason,
    bannedBy: b.banned_by,
    bannedAt: b.banned_at,
  }));

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
