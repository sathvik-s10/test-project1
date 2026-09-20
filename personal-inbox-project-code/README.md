# Personal Inbox

A dark-blue ticket inbox: visitors create an account, verify their email,
and submit tickets (messages) to the site owner. The owner (admin) reads
and replies to tickets, and can kick or ban users. Users can never message
each other — the only communication path is user → admin.

Built with **Next.js (App Router)**, **Supabase** (Auth + Postgres), and
**Tailwind CSS**.

## Features

- Email/password sign-up with required email verification before a user can
  send tickets.
- A dashboard where verified users submit tickets (category, subject,
  message) and see the owner's replies.
- An admin panel (no separate "admin" sign-up flow — see below) that lists
  every ticket, lets the owner reply and change ticket status, and lists
  every user.
- **Kick**: deletes a user's account outright. They can sign up again with
  the same email afterwards.
- **Ban**: permanently blacklists an email address (stored in the database)
  so it can never sign up or sign in again, and deletes the account if one
  exists.
- Every ticket is stored in Postgres via Supabase.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com/dashboard) and create a new
   project (free tier is fine).
2. In your project, go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key
   - **service_role** key (keep this secret — server-only)

## 2. Set up the database

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and
   run it. This creates the `tickets` and `banned_emails` tables with Row
   Level Security enabled.

## 3. Configure email verification

1. In Supabase, go to **Authentication → Sign In / Providers** and make sure
   **Email** is enabled with **Confirm email** turned on.
2. Go to **Authentication → URL Configuration** and set:
   - **Site URL**: `http://localhost:3000` for local dev (change to your
     production URL after deploying).
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` (and your
     production equivalent, e.g. `https://your-app.vercel.app/auth/callback`).

## 4. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAILS=owner@example.com
```

`ADMIN_EMAILS` is a comma-separated list of email addresses. Anyone who
signs up and verifies their email with one of these addresses automatically
gets access to `/admin` instead of `/dashboard` — there's no separate admin
sign-up flow or database role to manage by hand.

## 5. Run it locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, sign up with the email you put in
`ADMIN_EMAILS`, verify it, and you'll land on `/admin`. Any other email that
signs up lands on `/dashboard` and can submit tickets to you.

## 6. Deploy (e.g. to Vercel)

1. Push this repo to GitHub and import it into Vercel.
2. Add the same environment variables from `.env.local` in the Vercel
   project settings, but set `NEXT_PUBLIC_SITE_URL` to your production URL
   (e.g. `https://your-app.vercel.app`).
3. Add `https://your-app.vercel.app/auth/callback` to Supabase's Redirect
   URLs (step 3 above) and update the Site URL there too.
4. Deploy.

## How the pieces fit together

- `src/lib/supabase/client.ts` / `server.ts` — anon-key Supabase clients for
  the browser and server, respectively. RLS policies restrict regular users
  to their own ticket rows.
- `src/lib/supabase/admin.ts` — a service-role Supabase client that bypasses
  RLS. Only ever imported from server-only admin actions, after the caller's
  email has been checked against `ADMIN_EMAILS`.
- `src/lib/admin-emails.ts` — reads `ADMIN_EMAILS` and exposes
  `isAdminEmail()`.
- `src/lib/require-admin.ts` — re-verifies on every admin action/page load
  that the current session's email is in `ADMIN_EMAILS`.
- `src/proxy.ts` — Next.js Proxy (formerly "middleware"): refreshes the auth
  session cookie and redirects unauthenticated/unverified users away from
  `/dashboard` and `/admin`.
- `supabase/schema.sql` — the `tickets` and `banned_emails` tables plus RLS
  policies.

## Notes on security

- Regular users can only ever read/insert rows in `tickets` where
  `user_id = auth.uid()` (enforced by Postgres RLS), so there is no way for
  one user to read another user's tickets — there is no user-to-user chat.
- `banned_emails` has no RLS policies for the `anon`/`authenticated` roles,
  so it's only ever readable/writable via the service-role key on the
  server.
- Every admin server action re-checks `ADMIN_EMAILS` server-side; it is
  never trusted from the client.
