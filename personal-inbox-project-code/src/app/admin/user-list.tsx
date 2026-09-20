"use client";

import { useState, useTransition } from "react";
import { kickUser, banUser } from "./actions";

type AppUser = {
  id: string;
  email: string;
  createdAt: string;
  emailConfirmed: boolean;
  isAdmin: boolean;
};

export function UserList({ users }: { users: AppUser[] }) {
  if (users.length === 0) {
    return <p className="text-sm text-foreground-muted">No users yet.</p>;
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <UserRow key={user.id} user={user} />
      ))}
    </div>
  );
}

function UserRow({ user }: { user: AppUser }) {
  const [banReason, setBanReason] = useState("");
  const [showBanInput, setShowBanInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleKick() {
    setError(null);
    if (!confirm(`Kick ${user.email}? Their account will be deleted, but they can sign up again.`)) {
      return;
    }
    startTransition(async () => {
      const result = await kickUser(user.id, user.email);
      if (result.error) setError(result.error);
    });
  }

  function handleBan() {
    setError(null);
    if (!confirm(`Ban ${user.email}? This email will be permanently blocked from this site.`)) {
      return;
    }
    startTransition(async () => {
      const result = await banUser(user.id, user.email, banReason);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className="font-medium text-foreground">
          {user.email}{" "}
          {user.isAdmin && <span className="text-xs text-accent">(admin)</span>}
        </p>
        <p className="text-xs text-foreground-muted">
          Joined {new Date(user.createdAt).toLocaleDateString()} ·{" "}
          {user.emailConfirmed ? "Verified" : "Unverified"}
        </p>
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>

      {!user.isAdmin && (
        <div className="flex flex-wrap items-center gap-2">
          {showBanInput ? (
            <>
              <input
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason (optional)"
                className="input w-48"
              />
              <button type="button" onClick={handleBan} disabled={pending} className="btn-danger">
                Confirm ban
              </button>
              <button
                type="button"
                onClick={() => setShowBanInput(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={handleKick} disabled={pending} className="btn-secondary">
                Kick
              </button>
              <button
                type="button"
                onClick={() => setShowBanInput(true)}
                disabled={pending}
                className="btn-danger"
              >
                Ban
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
