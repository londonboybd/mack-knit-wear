"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mail, Phone, MapPin, Copy, Check, ExternalLink } from "lucide-react";
import { siteSettings } from "@/lib/data/site-data";
import { HeroEntrance } from "./motion";

interface ContactProps {
  initialBrand?: string;
  initialProduct?: string;
  initialSku?: string;
  initialType?: string;
}

const SUPPORTED_INQUIRY_TYPES = [
  { value: "Wholesale", label: "Wholesale & Retail Stockist (londonBoy)" },
  { value: "Private Label", label: "Private Label & Contract Knitting" },
  { value: "Sample Request", label: "Yarn & Gauge Sample Request" },
  { value: "Factory Verification", label: "Associate Facility Verification" },
  { value: "General", label: "General Trade Inquiry" },
] as const;

type InquiryTypeValue = (typeof SUPPORTED_INQUIRY_TYPES)[number]["value"];

function normalizeInquiryType(rawType?: string, hasProduct?: boolean): InquiryTypeValue {
  if (!rawType) return hasProduct ? "Wholesale" : "General";
  const normalized = rawType.trim().toLowerCase();
  const found = SUPPORTED_INQUIRY_TYPES.find(
    (t) => t.value.toLowerCase() === normalized
  );
  return found ? found.value : hasProduct ? "Wholesale" : "General";
}

function isValidEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

export function ContactCorrespondence({
  initialBrand = "",
  initialProduct = "",
  initialSku = "",
  initialType = "",
}: ContactProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState<InquiryTypeValue>(
    normalizeInquiryType(initialType, Boolean(initialProduct))
  );
  const [subject, setSubject] = useState(
    initialProduct
      ? `Inquiry regarding ${initialProduct}${initialSku ? ` (${initialSku})` : ""}`
      : initialBrand
      ? `Commercial inquiry regarding ${initialBrand}`
      : ""
  );
  const [message, setMessage] = useState(
    initialProduct
      ? `Hello,\n\nI am writing to inquire regarding production specifications, minimum order quantities, and sample availability for ${initialProduct}${
          initialSku ? ` [Ref: ${initialSku}]` : ""
        }.\n\n`
      : ""
  );

  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [showFallbackText, setShowFallbackText] = useState(false);
  const textareaFallbackRef = useRef<HTMLTextAreaElement>(null);

  // Sync initial parameters if they change
  useEffect(() => {
    if (initialType) {
      setInquiryType(normalizeInquiryType(initialType, Boolean(initialProduct)));
    }
  }, [initialType, initialProduct]);

  const recipientEmail = siteSettings.email || "";

  const formatPreparedText = () => {
    return [
      `MACK KNIT WEAR — COMMERCIAL CORRESPONDENCE`,
      `===========================================`,
      `Date: ${new Date().toISOString().split("T")[0]}`,
      `Inquiry Type: ${inquiryType}`,
      `Subject: ${subject || "General Inquiry"}`,
      `From: ${name.trim() || "Not specified"}`,
      `Return Email: ${email.trim() || "Not specified"}`,
      initialBrand ? `Brand Context: ${initialBrand}` : "",
      initialProduct ? `Referenced Product: ${initialProduct}` : "",
      initialSku ? `SKU / Ref Code: ${initialSku}` : "",
      `-------------------------------------------`,
      `Message:`,
      message.trim() || "(No message body provided)",
      `===========================================`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const handleCopy = async () => {
    setValidationError("");
    const text = formatPreparedText();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch {
      setShowFallbackText(true);
      setValidationError(
        "Direct clipboard access was restricted by your browser. You can select and copy the formatted message from the box below."
      );
      setTimeout(() => {
        textareaFallbackRef.current?.select();
      }, 100);
    }
  };

  const handleOpenEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) {
      setValidationError(
        "Commercial trade desk direct email is not configured at this time. Please contact us via phone or check back later."
      );
      return;
    }

    if (!email.trim()) {
      setValidationError("Please enter your return email address so we can reply to your inquiry.");
      return;
    }

    if (!isValidEmail(email)) {
      setValidationError("Please enter a valid return email address (e.g. name@organization.com).");
      return;
    }

    setValidationError("");

    const emailSubject = encodeURIComponent(
      subject || `[${inquiryType}] Mack Knit Wear Inquiry`
    );
    const bodyContent = encodeURIComponent(formatPreparedText());
    const mailtoUrl = `mailto:${recipientEmail}?subject=${emailSubject}&body=${bodyContent}`;

    window.location.href = mailtoUrl;
  };

  return (
    <div className="contact-page">
      {/* Editorial Header */}
      <section className="contact-header-section" aria-label="Correspondence Introduction">
        <div className="section-container">
          <HeroEntrance delay={40}>
            <span className="hero-eyebrow">COMMERCIAL CORRESPONDENCE</span>
          </HeroEntrance>
          <HeroEntrance delay={100}>
            <h1 className="contact-title">
              Start a direct conversation.
              <br />
              <span className="serif-accent">Transparent trade dialogue.</span>
            </h1>
          </HeroEntrance>
          <HeroEntrance delay={160}>
            <p className="contact-intro-text">
              We welcome dialogue with international wholesale stockists, department store buyers, private label clients, and textile partners.
            </p>
          </HeroEntrance>
        </div>
      </section>

      {/* Main Correspondence Layout */}
      <section className="contact-main-section" aria-label="Contact Channels & Composer">
        <div className="section-container contact-split-grid">
          {/* Left: Confirmed Trade Desk Details */}
          <aside className="contact-channels-col" aria-label="Direct Contact Channels">
            <h2 className="channels-heading">Direct Channels</h2>

            <div className="channel-cards-list">
              <div className="channel-item">
                <div className="channel-icon-wrap" aria-hidden="true">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="channel-label">General & Wholesale Inquiries</span>
                  {recipientEmail ? (
                    <a
                      href={`mailto:${recipientEmail}`}
                      className="channel-value-link"
                    >
                      {recipientEmail}
                    </a>
                  ) : (
                    <p className="channel-static-val">Email address not configured</p>
                  )}
                </div>
              </div>

              {siteSettings.phone && (
                <div className="channel-item">
                  <div className="channel-icon-wrap" aria-hidden="true">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="channel-label">Direct Telephone (BST)</span>
                    <a href={`tel:${siteSettings.phone.replace(/\s+/g, "")}`} className="channel-value-link">
                      {siteSettings.phone}
                    </a>
                  </div>
                </div>
              )}

              <div className="channel-item">
                <div className="channel-icon-wrap" aria-hidden="true">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="channel-label">Commercial Trade Desk</span>
                  <p className="channel-static-val">{siteSettings.address}</p>
                </div>
              </div>
            </div>

            <div className="channel-assurance-box">
              <h4>Direct Dialogue</h4>
              <p>
                Messages prepared here format directly for your native email client or clipboard. We do not store submissions in a remote database or track user accounts.
              </p>
            </div>
          </aside>

          {/* Right: Inquiry Composer (Valid section landmark, NOT nested main) */}
          <section className="contact-composer-col" aria-label="Inquiry Composer">
            <div className="composer-card">
              <div className="composer-header">
                <h2 className="composer-heading">Inquiry Composer</h2>
                <span className="composer-badge">CLIENT-SIDE EMAIL PREPARATION</span>
              </div>

              <p className="composer-instruction">
                Complete the fields below to format your inquiry. When ready, open your native email application or copy the formatted text to your clipboard.
              </p>

              {recipientEmail && (
                <div className="composer-recipient-notice" style={{ fontSize: "13px", color: "var(--muted-accent)", marginBottom: "16px" }}>
                  Inquiries will be directed to: <strong>{recipientEmail}</strong>
                </div>
              )}

              {validationError && (
                <div className="composer-error-banner" role="alert" aria-live="assertive">
                  {validationError}
                </div>
              )}

              <form onSubmit={handleOpenEmail} className="composer-form" noValidate>
                <div className="form-row-split">
                  <div className="form-group">
                    <label htmlFor="composer-name">Your Full Name</label>
                    <input
                      id="composer-name"
                      type="text"
                      className="composer-input"
                      placeholder="e.g. Eleanor Vance"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="composer-email">
                      Return Email Address <span className="req">*</span>
                    </label>
                    <input
                      id="composer-email"
                      type="email"
                      required
                      aria-required="true"
                      aria-invalid={Boolean(validationError && (!email || !isValidEmail(email)))}
                      className="composer-input"
                      placeholder="name@organization.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (validationError) setValidationError("");
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="composer-type">Inquiry Classification</label>
                  <select
                    id="composer-type"
                    className="composer-select"
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value as InquiryTypeValue)}
                  >
                    {SUPPORTED_INQUIRY_TYPES.map((typeOption) => (
                      <option key={typeOption.value} value={typeOption.value}>
                        {typeOption.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="composer-subject">Subject Header</label>
                  <input
                    id="composer-subject"
                    type="text"
                    className="composer-input"
                    placeholder="Brief description of your project or requirements"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                {/* Contextual product / brand badge if arrived via direct link */}
                {(initialProduct || initialBrand) && (
                  <div className="composer-context-badge">
                    <span>
                      Context: <strong>{initialProduct || initialBrand}</strong>
                      {initialSku && ` (Ref: ${initialSku})`}
                    </span>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="composer-message">Message Details</label>
                  <textarea
                    id="composer-message"
                    className="composer-textarea"
                    rows={6}
                    placeholder="Provide details regarding target quantities, gauge preferences, delivery requirements, or technical queries..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="composer-actions-bar">
                  <button
                    type="submit"
                    className="button primary-dark composer-btn-main"
                    disabled={!recipientEmail}
                  >
                    Open in Email Client <ExternalLink size={15} />
                  </button>

                  <button
                    type="button"
                    className="button secondary-quiet composer-btn-copy"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <Check size={16} /> Copied to Clipboard
                      </>
                    ) : (
                      <>
                        <Copy size={16} /> Copy Message
                      </>
                    )}
                  </button>
                </div>

                {/* Accessible Selectable Fallback Textarea */}
                {showFallbackText && (
                  <div className="composer-fallback-wrap" style={{ marginTop: "20px" }}>
                    <label htmlFor="composer-fallback-output" style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                      Formatted Inquiry (Select All & Copy):
                    </label>
                    <textarea
                      ref={textareaFallbackRef}
                      id="composer-fallback-output"
                      readOnly
                      rows={8}
                      className="composer-textarea"
                      style={{ fontFamily: "monospace", fontSize: "12px", background: "var(--surface-secondary)" }}
                      value={formatPreparedText()}
                      aria-label="Selectable formatted inquiry text"
                    />
                  </div>
                )}

                <p className="composer-disclaimer">
                  No database submission is performed. Clicking &ldquo;Open in Email Client&rdquo; prepares your draft using standard <code>mailto:</code> protocol.
                </p>
              </form>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
