"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthFormState } from "./actions";

const initialState: AuthFormState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Sign in to send a ticket to the site owner.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-foreground-muted" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-foreground-muted" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input"
              placeholder="••••••••"
            />
          </div>

          {state.error && (
            <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent hover:text-accent-hover">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
