import { signOut } from "@/app/login/actions";

export function Header({
  email,
  isAdmin,
}: {
  email: string;
  isAdmin: boolean;
}) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <div>
          <p className="font-semibold text-foreground">Personal Inbox</p>
          <p className="text-xs text-foreground-muted">
            {email} {isAdmin && <span className="text-accent">· admin</span>}
          </p>
        </div>
        <form action={signOut}>
          <button type="submit" className="btn-secondary text-sm">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
