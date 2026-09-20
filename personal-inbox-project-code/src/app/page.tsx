import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-emails";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loggedInHref = user ? (isAdminEmail(user.email) ? "/admin" : "/dashboard") : "/login";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="card max-w-md p-10">
        <h1 className="text-3xl font-semibold text-foreground">Personal Inbox</h1>
        <p className="mt-3 text-foreground-muted">
          Verify your email, then send a ticket straight to the site owner.
        </p>
        <Link href={loggedInHref} className="btn-primary mt-8 inline-block">
          {user ? "Go to your inbox" : "Sign in"}
        </Link>
      </div>
    </main>
  );
}
