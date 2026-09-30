"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Clock, Copy, Check, ExternalLink, Send } from "lucide-react";
import { siteSettings } from "@/lib/data/site-data";
import { Reveal } from "./motion";

interface ContactProps {
  initialBrand?: string;
  initialProduct?: string;
  initialSku?: string;
  initialType?: string;
}

export function ContactCorrespondence({
  initialBrand = "",
  initialProduct = "",
  initialSku = "",
  initialType = "",
}: ContactProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState(
    initialType || (initialProduct ? "Wholesale" : "General")
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

  const formatPreparedText = () => {
    return [
      `MACK KNIT WEAR — COMMERCIAL CORRESPONDENCE`,
      `===========================================`,
      `Date: ${new Date().toISOString().split("T")[0]}`,
      `Inquiry Type: ${inquiryType}`,
      `Subject: ${subject || "General Inquiry"}`,
      `From: ${name || "Not specified"}`,
      `Email: ${email || "Not specified"}`,
      initialProduct ? `Referenced Product: ${initialProduct}` : "",
      initialSku ? `SKU / Ref Code: ${initialSku}` : "",
      `-------------------------------------------`,
      `Message:`,
      message || "(No message body provided)",
      `===========================================`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const handleCopy = async () => {
    try {
      const text = formatPreparedText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setValidationError("Clipboard access was restricted by your browser. Please select and copy manually.");
    }
  };

  const handleOpenEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setValidationError("Please enter your return email address before launching your email application.");
      return;
    }
    setValidationError("");

    const emailSubject = encodeURIComponent(
      subject || `[${inquiryType}] Mack Knit Wear Inquiry`
    );
    const bodyContent = encodeURIComponent(formatPreparedText());
    const mailtoUrl = `mailto:${siteSettings.email}?subject=${emailSubject}&body=${bodyContent}`;

    window.location.href = mailtoUrl;
  };

  return (
    <div className="contact-page">
      {/* Editorial Header */}
      <section className="contact-header-section" aria-label="Correspondence Introduction">
        <div className="section-container">
          <Reveal delay={50}>
            <span className="hero-eyebrow">COMMERCIAL CORRESPONDENCE</span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="contact-title">
              Start a direct conversation.
              <br />
              <span className="serif-accent">Transparent trade dialogue.</span>
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="contact-intro-text">
              We welcome dialogue with international wholesale stockists, department store buyers, private label clients, and textile partners.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Main Correspondence Layout: Details on left, Composer on right */}
      <section className="contact-body-section" aria-label="Correspondence Desk and Composer">
        <div className="section-container contact-split-grid">
          {/* Left: Confirmed Direct Channels */}
          <aside className="contact-channels-col" aria-label="Direct Contact Channels">
            <div className="channel-box">
              <span className="channel-box-title">DIRECT CHANNELS</span>

              <div className="channel-item">
                <div className="channel-icon-wrap" aria-hidden="true">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="channel-label">General & Wholesale Inquiries</span>
                  <a href={`mailto:${siteSettings.email}`} className="channel-link">
                    {siteSettings.email}
                  </a>
                </div>
              </div>

              <div className="channel-item">
                <div className="channel-icon-wrap" aria-hidden="true">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="channel-label">Direct Telephone (BST)</span>
                  <a href={`tel:${siteSettings.phone.replace(/\s+/g, "")}`} className="channel-link">
                    {siteSettings.phone}
                  </a>
                </div>
              </div>

              <div className="channel-item">
                <div className="channel-icon-wrap" aria-hidden="true">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="channel-label">Commercial Trade Desk</span>
                  <p className="channel-static-val">Dhaka, Bangladesh</p>
                </div>
              </div>

              <div className="channel-item">
                <div className="channel-icon-wrap" aria-hidden="true">
                  <Clock size={18} />
                </div>
                <div>
                  <span className="channel-label">Response Commitment</span>
                  <p className="channel-static-val">{siteSettings.responseNotice}</p>
                </div>
              </div>
            </div>

            <div className="channel-assurance-box">
              <h4>Direct Dialogue Guarantee</h4>
              <p>
                Messages sent to our correspondence desk connect directly with production coordinators in Dhaka. We provide factual yarn lead times, realistic minimums, and honest technical guidance.
              </p>
            </div>
          </aside>

          {/* Right: Inquiry Composer */}
          <main className="contact-composer-col" aria-label="Inquiry Composer">
            <div className="composer-card">
              <div className="composer-header">
                <h2 className="composer-heading">Inquiry Composer</h2>
                <span className="composer-badge">CLIENT-SIDE EMAIL PREPARATION</span>
              </div>

              <p className="composer-instruction">
                Complete the fields below to format your inquiry. When ready, open your native email application or copy the formatted text to your clipboard.
              </p>

              {validationError && (
                <div className="composer-error-banner" role="alert">
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
                      className="composer-input"
                      placeholder="name@organization.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="composer-type">Inquiry Classification</label>
                  <select
                    id="composer-type"
                    className="composer-select"
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                  >
                    <option value="Wholesale">Wholesale & Retail Stockist (londonBoy)</option>
                    <option value="Private Label">Private Label & Contract Knitting</option>
                    <option value="Sample Request">Yarn & Gauge Sample Request</option>
                    <option value="Factory Verification">Associate Facility Verification</option>
                    <option value="General">General Trade Inquiry</option>
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

                <div className="form-group">
                  <label htmlFor="composer-message">Message Details</label>
                  <textarea
                    id="composer-message"
                    rows={6}
                    className="composer-textarea"
                    placeholder="Provide details such as intended volumes, target delivery timelines, or specific technical criteria..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {/* Context Indicator if arrived from a product */}
                {initialProduct && (
                  <div className="composer-context-pill">
                    <span>Active Product Context:</span>
                    <strong>{initialProduct}</strong>
                    {initialSku && <code>[{initialSku}]</code>}
                  </div>
                )}

                {/* Primary & Secondary Actions */}
                <div className="composer-actions-bar">
                  <button type="submit" className="button primary-dark action-email-btn">
                    <Send size={16} /> Open in Email Application
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="button secondary-quiet action-copy-btn"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="text-green" /> Copied to clipboard
                      </>
                    ) : (
                      <>
                        <Copy size={16} /> Copy Prepared Message
                      </>
                    )}
                  </button>
                </div>

                <div className="composer-disclaimer">
                  <span>Note:</span> This composer formats text for transmission via your email client or clipboard. Mack Knit Wear does not store or process inquiry submissions on an intermediary web server.
                </div>
              </form>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
