"use client";

import { useState, useTransition } from "react";
import { StatusBadge } from "@/components/status-badge";
import { replyToTicket, updateTicketStatus } from "./actions";

export type Ticket = {
  id: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "closed";
  admin_reply: string | null;
  created_at: string;
};

export function TicketList({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return <p className="text-sm text-foreground-muted">No tickets yet.</p>;
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <TicketRow key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  const [reply, setReply] = useState(ticket.admin_reply ?? "");
  const [status, setStatus] = useState(ticket.status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleReply() {
    setError(null);
    startTransition(async () => {
      const result = await replyToTicket(ticket.id, reply, status);
      if (result.error) setError(result.error);
    });
  }

  function handleStatusOnly(newStatus: typeof status) {
    setStatus(newStatus);
    setError(null);
    startTransition(async () => {
      const result = await updateTicketStatus(ticket.id, newStatus);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-foreground">{ticket.subject}</p>
          <p className="text-xs text-foreground-muted">
            {ticket.name} · {ticket.email} · {ticket.category}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <p className="mt-1 text-xs text-foreground-muted">
        {new Date(ticket.created_at).toLocaleString()}
      </p>

      <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{ticket.message}</p>

      <div className="mt-4 space-y-2 border-t border-border pt-4">
        <label className="block text-xs font-medium text-foreground-muted">
          Reply to {ticket.name}
        </label>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={3}
          className="input resize-y"
          placeholder="Write a reply..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => handleStatusOnly(e.target.value as typeof status)}
            className="input w-auto"
          >
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={handleReply}
            disabled={pending}
            className="btn-primary"
            type="button"
          >
            {pending ? "Saving..." : "Send reply"}
          </button>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
