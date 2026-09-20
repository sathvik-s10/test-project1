import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Check your inbox</h1>
        <p className="mt-3 text-sm text-foreground-muted">
          We sent you a verification link. You need to verify your email
          before you can send tickets to the site owner.
        </p>
        <Link href="/login" className="btn-secondary mt-6 inline-block">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
