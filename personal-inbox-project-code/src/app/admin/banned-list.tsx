"use client";

import { useTransition } from "react";
import { unbanEmail } from "./actions";

type Banned = {
  email: string;
  reason: string | null;
  bannedBy: string | null;
  bannedAt: string;
};

export function BannedList({ banned }: { banned: Banned[] }) {
  const [pending, startTransition] = useTransition();

  if (banned.length === 0) {
    return <p className="text-sm text-foreground-muted">No banned emails.</p>;
  }

  return (
    <div className="space-y-2">
      {banned.map((b) => (
        <div key={b.email} className="card flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-medium text-foreground">{b.email}</p>
            <p className="text-xs text-foreground-muted">
              Banned {new Date(b.bannedAt).toLocaleDateString()}
              {b.bannedBy && ` by ${b.bannedBy}`}
              {b.reason && ` · ${b.reason}`}
            </p>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await unbanEmail(b.email);
              })
            }
            className="btn-secondary"
          >
            Unban
          </button>
        </div>
      ))}
    </div>
  );
}
