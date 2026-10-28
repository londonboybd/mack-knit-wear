import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Commercial Inquiry Composer & Validation Logic", () => {
  const SUPPORTED_INQUIRY_TYPES = [
    "Wholesale",
    "Private Label",
    "Sample Request",
    "Factory Verification",
    "General",
  ] as const;

  function normalizeInquiryType(rawType?: string, hasProduct?: boolean): string {
    if (!rawType) return hasProduct ? "Wholesale" : "General";
    const normalized = rawType.trim().toLowerCase();
    const found = SUPPORTED_INQUIRY_TYPES.find(
      (t) => t.toLowerCase() === normalized
    );
    return found || (hasProduct ? "Wholesale" : "General");
  }

  function isValidEmail(val: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  function formatPreparedText({
    inquiryType,
    subject,
    name,
    email,
    brand,
    product,
    sku,
    message,
  }: {
    inquiryType: string;
    subject?: string;
    name?: string;
    email?: string;
    brand?: string;
    product?: string;
    sku?: string;
    message?: string;
  }): string {
    return [
      `MACK KNIT WEAR — COMMERCIAL CORRESPONDENCE`,
      `===========================================`,
      `Inquiry Type: ${inquiryType}`,
      `Subject: ${subject || "General Inquiry"}`,
      `From: ${name?.trim() || "Not specified"}`,
      `Return Email: ${email?.trim() || "Not specified"}`,
      brand ? `Brand Context: ${brand}` : "",
      product ? `Referenced Product: ${product}` : "",
      sku ? `SKU / Ref Code: ${sku}` : "",
      `-------------------------------------------`,
      `Message:`,
      message?.trim() || "(No message body provided)",
      `===========================================`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  it("normalizes inquiry types case-insensitively", () => {
    assert.equal(normalizeInquiryType("wholesale"), "Wholesale");
    assert.equal(normalizeInquiryType("WHOLESALE"), "Wholesale");
    assert.equal(normalizeInquiryType("factory verification"), "Factory Verification");
    assert.equal(normalizeInquiryType("Factory Verification"), "Factory Verification");
    assert.equal(normalizeInquiryType("private label"), "Private Label");
    assert.equal(normalizeInquiryType("sample request"), "Sample Request");
    assert.equal(normalizeInquiryType("general"), "General");
    assert.equal(normalizeInquiryType(""), "General");
    assert.equal(normalizeInquiryType(undefined, true), "Wholesale");
  });

  it("validates return email formats accurately", () => {
    assert.equal(isValidEmail("buyer@example.com"), true);
    assert.equal(isValidEmail("sourcing@department-store.co.uk"), true);
    assert.equal(isValidEmail("plainaddress"), false);
    assert.equal(isValidEmail("@missingusername.com"), false);
    assert.equal(isValidEmail("missingdomain@.com"), false);
    assert.equal(isValidEmail(""), false);
  });

  it("formats correspondence text with full brand and product context", () => {
    const formatted = formatPreparedText({
      inquiryType: "Wholesale",
      subject: "Wholesale Inquiry for Structured Ribbed Crew Sock (LB-SK-01)",
      name: "Alex Morgan",
      email: "alex@retailpartner.com",
      brand: "londonBoy",
      product: "Structured Ribbed Crew Sock",
      sku: "LB-SK-01",
      message: "Looking for minimum order quantities and FOB Dhaka pricing.",
    });

    assert.ok(formatted.includes("Inquiry Type: Wholesale"));
    assert.ok(formatted.includes("From: Alex Morgan"));
    assert.ok(formatted.includes("Return Email: alex@retailpartner.com"));
    assert.ok(formatted.includes("Brand Context: londonBoy"));
    assert.ok(formatted.includes("Referenced Product: Structured Ribbed Crew Sock"));
    assert.ok(formatted.includes("SKU / Ref Code: LB-SK-01"));
    assert.ok(formatted.includes("Looking for minimum order quantities"));
  });

  it("omits empty contextual fields cleanly without broken lines", () => {
    const formatted = formatPreparedText({
      inquiryType: "General",
      subject: "General Inquiry",
      name: "Pat Doe",
      email: "pat@example.com",
    });

    assert.ok(!formatted.includes("Referenced Product:"));
    assert.ok(!formatted.includes("SKU / Ref Code:"));
    assert.ok(!formatted.includes("Brand Context:"));
  });
});
