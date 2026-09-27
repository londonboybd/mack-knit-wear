"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <section className="login-story">
        <Link href="/" className="admin-logo">
          <span className="monogram">M</span>Mack Knit Wear
        </Link>
        <div>
          <span className="eyebrow">CONTENT STUDIO</span>
          <h1>
            Your story.
            <br />
            Your space.
          </h1>
          <p>
            Build a home for your company, your brands, and what comes next.
          </p>
        </div>
        <span>MANAGE WITH CONFIDENCE.</span>
      </section>
      <section className="login-form-wrap">
        <form onSubmit={login}>
          <LockKeyhole size={27} />
          <h2>Welcome back.</h2>
          <p>Sign in to your company workspace.</p>
          {!configured && (
            <div className="notice">
              Administrator sign-in requires a connected Supabase project. See
              the setup guide included with this project.
            </div>
          )}
          <label>
            Email
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <p role="alert" className="form-error">
            {error}
          </p>
          <button className="button dark" disabled={busy || !configured}>
            {busy ? "Signing in…" : "Sign in"}
            <ArrowRight size={17} />
          </button>
          <p className="form-note">
            Access is limited to approved administrators. Contact the site owner
            if you need access or a password reset.
          </p>
          <Link href="/" className="text-link">
            Back to website
          </Link>
        </form>
      </section>
    </main>
  );
}
