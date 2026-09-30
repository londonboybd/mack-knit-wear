import type { Metadata } from "next";
import Link from "next/link";
import { siteSettings } from "@/lib/data/site-data";

export const metadata: Metadata = {
  title: "Commercial Confidentiality & Privacy Notice | Mack Knit Wear",
  description:
    "Mack Knit Wear's commitment to commercial confidentiality, client privacy, and zero database tracking.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Commercial Confidentiality & Privacy Notice | Mack Knit Wear",
    description:
      "Mack Knit Wear's commitment to commercial confidentiality, client privacy, and zero database tracking.",
    url: "/privacy",
    siteName: "Mack Knit Wear",
  },
};

export default function PrivacyPage() {
  return (
    <div className="section-container privacy-page" style={{ padding: "80px 20px", maxWidth: "800px" }}>
      <span className="hero-eyebrow">LEGAL & CONFIDENTIALITY</span>
      <h1 className="editorial-heading" style={{ margin: "20px 0 30px" }}>
        Commercial Confidentiality & Privacy Notice
      </h1>
      <div
        className="editorial-body"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          fontSize: "16px",
          lineHeight: "1.7",
          color: "#3f4d4a",
        }}
      >
        <p>
          Mack Knit Wear operates on principles of strict commercial confidentiality and data privacy. This website is a static architectural portfolio designed for transparent trade dialogue without tracking, advertising cookies, or backend database logging.
        </p>
        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "var(--mack-text)", marginTop: "16px" }}>
          Client-Side Correspondence
        </h2>
        <p>
          Our inquiry composer operates entirely within your browser session. Messages prepared using our trade desk forms are not saved to a server database or third-party CRM. When you select &ldquo;Open in Email Client,&rdquo; your device prepares a standard email addressed directly to our trade desk.
        </p>
        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "var(--mack-text)", marginTop: "16px" }}>
          Confidentiality of Specifications
        </h2>
        <p>
          All technical design packages, target yarn specifications, minimum order quantity inquiries, and proprietary branding discussions shared via direct correspondence remain strictly confidential between prospective clients and our Dhaka office. We do not distribute, sell, or share client information with external third parties or marketing organizations.
        </p>
        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "var(--mack-text)", marginTop: "16px" }}>
          Trade Desk Contact
        </h2>
        <p>
          For privacy inquiries or to update your company contact records, reach out directly to our commercial trade desk in Dhaka, Bangladesh at{" "}
          <strong>
            <a href={`mailto:${siteSettings.email}`} style={{ textDecoration: "underline" }}>
              {siteSettings.email}
            </a>
          </strong>.
        </p>
        <div style={{ marginTop: "24px" }}>
          <Link href="/contact" className="button primary-dark">
            Return to Commercial Correspondence
          </Link>
        </div>
      </div>
    </div>
  );
}
