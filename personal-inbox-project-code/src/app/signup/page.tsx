"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthFormState } from "../login/actions";

const initialState: AuthFormState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold text-foreground">Create account</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          You&apos;ll need to verify your email before you can send tickets.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-foreground-muted" htmlFor="name">
              Name
            </label>
            <input id="name" name="name" type="text" required className="input" placeholder="Jane Doe" />
          </div>

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
              minLength={8}
              autoComplete="new-password"
              className="input"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-foreground-muted" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="input"
            />
          </div>

          {state.error && (
            <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}
          {state.info && (
            <p className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
              {state.info}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
