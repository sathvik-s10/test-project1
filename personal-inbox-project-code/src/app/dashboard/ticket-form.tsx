"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTicket, type TicketFormState } from "./actions";
import { TICKET_CATEGORIES } from "./ticket-categories";

const initialState: TicketFormState = {};

export function TicketForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, pending] = useActionState(createTicket, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-foreground">Submit a ticket</h2>
      <p className="mt-1 text-sm text-foreground-muted">
        This goes directly to the site owner. They&apos;ll respond here once
        it&apos;s handled.
      </p>

      <form ref={formRef} action={formAction} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-foreground-muted">Name</label>
            <input value={name} disabled className="input opacity-70" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-foreground-muted">Email</label>
            <input value={email} disabled className="input opacity-70" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-foreground-muted" htmlFor="category">
            Category
          </label>
          <select id="category" name="category" required className="input" defaultValue="general">
            {TICKET_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-foreground-muted" htmlFor="subject">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            maxLength={150}
            className="input"
            placeholder="Short summary of your ticket"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-foreground-muted" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            maxLength={5000}
            rows={6}
            className="input resize-y"
            placeholder="Describe your issue or message in detail..."
          />
        </div>

        {state.error && (
          <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
            Ticket submitted. The site owner will get back to you.
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
          {pending ? "Submitting..." : "Submit ticket"}
        </button>
      </form>
    </div>
  );
}
