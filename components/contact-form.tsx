"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ArrowUpRight, CheckCircle2, X, AlertCircle } from "lucide-react";
import { inquiryTypes, type InquiryType } from "@/lib/schema";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

export function ContactForm({
  brand = "",
  initialProduct = "",
  initialSku = "",
  initialType = "",
  demo = false,
  enableSampleRequests = true,
}: {
  brand?: string;
  initialProduct?: string;
  initialSku?: string;
  initialType?: string;
  demo?: boolean;
  enableSampleRequests?: boolean;
}) {
  const [selectedType, setSelectedType] = useState<InquiryType>(() => {
    if (initialType && inquiryTypes.includes(initialType as InquiryType)) {
      return initialType as InquiryType;
    }
    if (initialProduct || brand) return "Wholesale";
    return "General";
  });

  const [activeBrand, setActiveBrand] = useState(brand);
  const [activeProduct, setActiveProduct] = useState(initialProduct);
  const [activeSku, setActiveSku] = useState(initialSku);

  // Form input state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");

  // Conditional fields
  const [country, setCountry] = useState("");
  const [quantity, setQuantity] = useState("");
  const [timeline, setTimeline] = useState("");
  const [proposal, setProposal] = useState("");
  const [sampleReqs, setSampleReqs] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");

  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [referenceCode, setReferenceCode] = useState("");
  const [statusError, setStatusError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);

  const captcha = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);

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

  const hasContext = Boolean(activeBrand || activeProduct);

  const clearContext = () => {
    setActiveBrand("");
    setActiveProduct("");
    setActiveSku("");
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatusError("");
    setFieldErrors({});

    // Client-side validation
    const errors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      errors.name = "Please enter your full name (at least 2 characters).";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid commercial email address.";
    }
    if (!message.trim() || message.trim().length < 20) {
      errors.message = "Please describe your inquiry in at least 20 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setBusy(false);
      return;
    }

    try {
      const sourceUrl = typeof window !== "undefined" ? window.location.href : "";

      const payload = {
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
        type: selectedType,
        brand: activeBrand || activeProduct || "",
        message: message.trim(),
        website: (e.currentTarget.elements.namedItem("website") as HTMLInputElement)?.value || "",
        token,
        idempotencyKey,
        sourceUrl,
        details: {
          country: country.trim(),
          quantity: quantity.trim(),
          timeline: timeline.trim(),
          proposal: proposal.trim(),
          sampleRequirements: sampleReqs.trim(),
          productName: activeProduct,
          productRefCode: activeSku,
          companyWebsite: companyWebsite.trim(),
        },
      };

      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReferenceCode(data.reference || "INQ-CONFIRMED");
      setDone(true);
    } catch (err) {
      setStatusError(
        err instanceof Error ? err.message : "Something went wrong. Please check your inputs and try again.",
      );
      window.turnstile?.reset(widget.current);
      setToken("");
    } finally {
      setBusy(false);
    }
  }

  const allowedTypes = inquiryTypes.filter(
    (t) => t !== "Sample request" || enableSampleRequests,
  );

  return (
    <form onSubmit={submit} className="contact-form" noValidate>
      {demo && (
        <div className="notice">
          Design preview mode. Inquiries will be stored in PostgreSQL when credentials are connected.
        </div>
      )}

      {done ? (
        <div className="success" role="alert">
          <CheckCircle2 size={40} className="success-icon" />
          <h3>Thank you for reaching out.</h3>
          <p>
            Your inquiry has been stored securely with reference code:
          </p>
          <div className="reference-pill-code">
            <strong>{referenceCode}</strong>
          </div>
          <small className="muted">
            Our Dhaka and European desks review confirmed inquiries within two business days.
          </small>
          <button
            type="button"
            className="button outline small"
            onClick={() => {
              setDone(false);
              setMessage("");
              setReferenceCode("");
            }}
          >
            Send another inquiry
          </button>
        </div>
      ) : (
        <>
          {/* Pre-filled Context Review Bar */}
          {hasContext && (
            <div className="prefill-context-pill">
              <div>
                <span className="context-label">Inquiry context:</span>
                <strong>{activeProduct ? `${activeProduct} (${activeSku || "Catalog"})` : activeBrand}</strong>
              </div>
              <button
                type="button"
                className="clear-context-btn"
                onClick={clearContext}
                aria-label="Remove pre-filled brand or product context"
              >
                <X size={14} /> Remove
              </button>
            </div>
          )}

          {/* Inquiry Intent Selector */}
          <div className="form-group">
            <label htmlFor="inquiry-type-select">
              I’m interested in
            </label>
            <select
              id="inquiry-type-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as InquiryType)}
            >
              {allowedTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Contact Details */}
          <div className="form-grid">
            <label>
              Your name <span className="req">*</span>
              <input
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                placeholder="Full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((f) => ({ ...f, name: "" }));
                }}
              />
              {fieldErrors.name && <span className="field-error-text">{fieldErrors.name}</span>}
            </label>

            <label>
              Email address <span className="req">*</span>
              <input
                type="email"
                required
                maxLength={200}
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: "" }));
                }}
              />
              {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
            </label>
          </div>

          <div className="form-grid">
            <label>
              Company / organization <span className="muted">(optional)</span>
              <input
                maxLength={200}
                autoComplete="organization"
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </label>

            {/* Conditional Company Website for Brand Partnership */}
            {selectedType === "Brand partnership" && (
              <label>
                Company website <span className="muted">(optional)</span>
                <input
                  type="url"
                  placeholder="https://yourbrand.com"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                />
              </label>
            )}

            {/* Conditional Country for Wholesale / Sourcing */}
            {["Wholesale", "Sourcing & export"].includes(selectedType) && (
              <label>
                Destination country / market
                <input
                  placeholder="e.g. United Kingdom, Germany"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </label>
            )}
          </div>

          {/* Conditional Quantity and Timeline for Wholesale / Sourcing */}
          {["Wholesale", "Sourcing & export"].includes(selectedType) && (
            <div className="form-grid">
              <label>
                Estimated quantity <span className="muted">(approx. pieces)</span>
                <input
                  placeholder="e.g. 500 pcs per colorway"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </label>

              <label>
                Target production timeline
                <input
                  placeholder="e.g. Q3 2026 delivery"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                />
              </label>
            </div>
          )}

          {/* Conditional Proposal for Brand Partnership */}
          {selectedType === "Brand partnership" && (
            <label>
              Partnership scope & proposal outline
              <textarea
                rows={3}
                placeholder="Briefly outline your retail footprint, collaboration vision, or licensing inquiry…"
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
              />
            </label>
          )}

          {/* Conditional Sample Requirements for Sample Request */}
          {selectedType === "Sample request" && (
            <div className="form-grid">
              <label>
                Specific sample requirements
                <input
                  placeholder="e.g. 14G merino knit swatches and color card"
                  value={sampleReqs}
                  onChange={(e) => setSampleReqs(e.target.value)}
                />
              </label>
              <label>
                Delivery deadline
                <input
                  placeholder="e.g. within 2 weeks"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                />
              </label>
            </div>
          )}

          {/* Message Area */}
          <label>
            Your message <span className="req">*</span>
            <textarea
              required
              minLength={20}
              maxLength={5000}
              rows={4}
              placeholder="Tell us about your project requirements, quantities, or technical questions…"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (fieldErrors.message) setFieldErrors((f) => ({ ...f, message: "" }));
              }}
            />
            {fieldErrors.message && <span className="field-error-text">{fieldErrors.message}</span>}
          </label>

          {/* Silent Honeypot */}
          <div className="honeypot" aria-hidden="true">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          {/* Turnstile Integration */}
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
            We handle your commercial inquiry information strictly under our{" "}
            <a href="/privacy">privacy notice</a>. We never distribute contact details to third parties.
          </p>

          {statusError && (
            <div role="alert" className="form-error-banner">
              <AlertCircle size={16} />
              <span>{statusError}</span>
            </div>
          )}

          <button
            disabled={busy || demo}
            className="button dark"
            type="submit"
          >
            {busy ? "Transmitting inquiry…" : "Send business inquiry"}
            <ArrowUpRight size={17} />
          </button>
        </>
      )}
    </form>
  );
}
