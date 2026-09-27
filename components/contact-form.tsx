"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}
export function ContactForm({ brand, demo }: { brand: string; demo: boolean }) {
  const [state, setState] = useState(""),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [token, setToken] = useState(""),
    [ready, setReady] = useState(false);
  const captcha = useRef<HTMLDivElement>(null),
    widget = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (ready && captcha.current && window.turnstile) {
      widget.current = window.turnstile.render(captcha.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        callback: (t: string) => setToken(t),
        "expired-callback": () => setToken(""),
      });
      return () => {
        if (widget.current) window.turnstile?.remove(widget.current);
      };
    }
  }, [ready]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setState("");
    const form = e.currentTarget;
    try {
      const r = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(new FormData(form)),
          token,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setDone(true);
      form.reset();
    } catch (e) {
      setState(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
      window.turnstile?.reset(widget.current);
      setToken("");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="contact-form">
      {demo && (
        <div className="notice">
          Design preview. Messages will be enabled when the database is
          connected.
        </div>
      )}
      {done ? (
        <div className="success">
          <CheckCircle2 />
          <h3>Thank you for reaching out.</h3>
          <p>Your inquiry has been saved for the team to review.</p>
          <button
            type="button"
            className="text-link"
            onClick={() => setDone(false)}
          >
            Send another inquiry
          </button>
        </div>
      ) : (
        <>
          <div className="form-grid">
            <label>
              Your name
              <input
                name="name"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                placeholder="Full name"
              />
            </label>
            <label>
              Email address
              <input
                name="email"
                type="email"
                required
                maxLength={200}
                autoComplete="email"
                placeholder="you@company.com"
              />
            </label>
          </div>
          <label>
            Company <span className="muted">(optional)</span>
            <input
              name="company"
              maxLength={200}
              autoComplete="organization"
              placeholder="Company name"
            />
          </label>
          <div className="form-grid">
            <label>
              I'm interested in
              <select
                name="type"
                defaultValue={brand ? "Wholesale" : "General"}
              >
                <option>General</option>
                <option>Wholesale</option>
                <option>Brand partnership</option>
                <option>Sourcing & export</option>
              </select>
            </label>
            <label>
              Brand <span className="muted">(optional)</span>
              <input
                name="brand"
                defaultValue={brand}
                maxLength={200}
                placeholder="Brand name"
              />
            </label>
          </div>
          <label>
            Your message
            <textarea
              name="message"
              required
              minLength={20}
              maxLength={5000}
              rows={5}
              placeholder="Tell us a little about your inquiry…"
            />
          </label>
          <div className="honeypot" aria-hidden="true">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <>
              <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                onReady={() => setReady(true)}
              />
              <div ref={captcha} />
            </>
          )}
          <p className="form-note">
            We’ll use your details to respond to this inquiry. Read our{" "}
            <a href="/privacy">privacy notice</a>.
          </p>
          <p role="status" className="form-error">
            {state}
          </p>
          <button disabled={busy || demo} className="button dark" type="submit">
            {busy ? "Sending…" : "Send inquiry"}
            <ArrowUpRight size={17} />
          </button>
        </>
      )}
    </form>
  );
}
