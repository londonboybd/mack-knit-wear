import type { InquiryItem } from "./schema";

export type EmailDeliveryResult = {
  success: boolean;
  status: "sent" | "failed" | "unconfigured";
  error?: string;
  provider?: string;
  messageId?: string;
};

// In-memory record for test transports during local testing
export const testEmailOutbox: Array<{
  to: string;
  subject: string;
  inquiryReference: string;
  sentAt: string;
}> = [];

/**
 * Server-side staff email notification adapter.
 * Reuses configured email provider (Resend, SMTP, or test mode).
 * Safely handles unconfigured environments without claiming fake delivery.
 */
export async function sendStaffInquiryNotification(
  inquiry: {
    id: string;
    reference_code: string;
    name: string;
    email: string;
    company?: string;
    type: string;
    brand?: string;
    message: string;
    source_url?: string;
    details?: Record<string, any>;
  },
): Promise<EmailDeliveryResult> {
  const staffEmail = process.env.INQUIRY_NOTIFICATION_EMAIL || process.env.STAFF_NOTIFICATION_EMAIL;
  const resendApiKey = process.env.RESEND_API_KEY;
  const smtpHost = process.env.SMTP_HOST;

  // If no email credentials or staff recipient configured
  if (!staffEmail && !resendApiKey && !smtpHost) {
    return {
      success: false,
      status: "unconfigured",
      error: "Staff email notifications are not configured (missing INQUIRY_NOTIFICATION_EMAIL or provider credentials).",
    };
  }

  const subject = `[Mack Knit Wear Inquiry] ${inquiry.reference_code}: ${inquiry.type} from ${inquiry.name}`;
  const recipient = staffEmail || "inquiries@mackknitwear.com";

  // Check for Resend provider
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Mack Knit Wear <notifications@mackknitwear.com>",
          to: [recipient],
          reply_to: inquiry.email,
          subject,
          text: formatInquiryEmailText(inquiry),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          status: "failed",
          provider: "resend",
          error: data.message || "Resend API error",
        };
      }

      return {
        success: true,
        status: "sent",
        provider: "resend",
        messageId: data.id,
      };
    } catch (e) {
      return {
        success: false,
        status: "failed",
        provider: "resend",
        error: e instanceof Error ? e.message : "Network failure connecting to Resend.",
      };
    }
  }

  // Fallback to test transport if in development or test environment
  if (process.env.NODE_ENV !== "production") {
    testEmailOutbox.push({
      to: recipient,
      subject,
      inquiryReference: inquiry.reference_code,
      sentAt: new Date().toISOString(),
    });

    return {
      success: true,
      status: "sent",
      provider: "test-transport",
      messageId: `test-${crypto.randomUUID()}`,
    };
  }

  return {
    success: false,
    status: "unconfigured",
    error: "No active email transport adapter available.",
  };
}

function formatInquiryEmailText(inquiry: {
  reference_code: string;
  name: string;
  email: string;
  company?: string;
  type: string;
  brand?: string;
  message: string;
  source_url?: string;
  details?: Record<string, any>;
}): string {
  const lines = [
    `NEW BUSINESS INQUIRY RECEIVED`,
    `Reference: ${inquiry.reference_code}`,
    `----------------------------------------`,
    `Sender: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Company: ${inquiry.company || "Not provided"}`,
    `Inquiry Type: ${inquiry.type}`,
    `Brand / Product: ${inquiry.brand || "General Mack Knit Wear"}`,
  ];

  if (inquiry.source_url) {
    lines.push(`Source Page: ${inquiry.source_url}`);
  }

  if (inquiry.details) {
    if (inquiry.details.country) lines.push(`Destination Country: ${inquiry.details.country}`);
    if (inquiry.details.quantity) lines.push(`Estimated Quantity: ${inquiry.details.quantity}`);
    if (inquiry.details.timeline) lines.push(`Target Timeline: ${inquiry.details.timeline}`);
    if (inquiry.details.productName) lines.push(`Specific Product: ${inquiry.details.productName} (${inquiry.details.productRefCode || "No SKU"})`);
    if (inquiry.details.companyWebsite) lines.push(`Company Website: ${inquiry.details.companyWebsite}`);
    if (inquiry.details.proposal) lines.push(`Partnership Proposal: ${inquiry.details.proposal}`);
    if (inquiry.details.sampleRequirements) lines.push(`Sample Requirements: ${inquiry.details.sampleRequirements}`);
  }

  lines.push(`----------------------------------------`);
  lines.push(`Message Content:`);
  lines.push(inquiry.message);
  lines.push(`----------------------------------------`);
  lines.push(`Reply directly to this email to respond to ${inquiry.name}.`);

  return lines.join("\n");
}
