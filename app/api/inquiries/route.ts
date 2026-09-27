import { createHmac } from "node:crypto";
import { serviceDb } from "@/lib/supabase";
import { inquirySchema } from "@/lib/schema";
import { sendStaffInquiryNotification } from "@/lib/email-adapter";

export async function POST(request: Request) {
  if (
    !process.env.INQUIRY_HASH_SECRET ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return Response.json(
      {
        error: "The inquiry service is not connected yet. Please try again later.",
      },
      { status: 503 },
    );
  }

  // Origin check
  const origin = request.headers.get("origin");
  const expectedSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.url;
  if (origin && origin !== new URL(expectedSiteUrl).origin) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  if (Number(request.headers.get("content-length") || 0) > 32000) {
    return Response.json({ error: "Message payload is too large." }, { status: 413 });
  }

  const rawJson = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(rawJson);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message || "Invalid inquiry data." },
      { status: 400 },
    );
  }

  const { website, token, idempotencyKey, ...payload } = parsed.data;

  // Silent honeypot discard
  if (website) {
    return Response.json({ ok: true, reference: "INQ-VERIFIED" });
  }

  // Turnstile verification if secret key configured
  if (process.env.TURNSTILE_SECRET_KEY) {
    try {
      const verification = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: new URLSearchParams({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: token,
          }),
        },
      );
      const result = await verification.json();
      if (!result.success) {
        return Response.json(
          { error: "Verification challenge failed. Please submit again." },
          { status: 400 },
        );
      }
    } catch {
      return Response.json(
        { error: "Verification provider unreachable. Please retry." },
        { status: 503 },
      );
    }
  }

  // Hash sender IP for PostgreSQL rate limiting
  const ip = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    : "local-development";

  const hash = createHmac("sha256", process.env.INQUIRY_HASH_SECRET)
    .update(ip)
    .digest("hex");

  // Generate reference code
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const referenceCode = `INQ-${dateStr}-${randSuffix}`;

  const submissionPayload = {
    ...payload,
    idempotency_key: idempotencyKey || "",
    reference_code: referenceCode,
  };

  try {
    const supabase = serviceDb();

    // Submit inquiry through PostgreSQL function (enforces rate limit and idempotency)
    const { data: inquiryId, error } = await supabase.rpc("submit_inquiry", {
      payload: submissionPayload,
      sender_hash: hash,
    });

    if (error) {
      return Response.json(
        { error: "Your inquiry could not be saved to our database. Please retry." },
        { status: 500 },
      );
    }

    if (!inquiryId) {
      return Response.json(
        { error: "Inquiry frequency limit exceeded. Please wait an hour before submitting again." },
        { status: 429 },
      );
    }

    // Retrieve the stored record (handles both fresh submissions and idempotent duplicates)
    const { data: storedInquiry } = await supabase
      .from("inquiries")
      .select("id, reference_code, name, email, company, type, brand, message, source_url, details")
      .eq("id", inquiryId)
      .single();

    const finalReference = storedInquiry?.reference_code || referenceCode;

    // Send staff email notification asynchronously
    try {
      const emailResult = await sendStaffInquiryNotification({
        id: inquiryId,
        reference_code: finalReference,
        name: payload.name,
        email: payload.email,
        company: payload.company,
        type: payload.type,
        brand: payload.brand,
        message: payload.message,
        source_url: payload.sourceUrl,
        details: payload.details,
      });

      // Durably update notification delivery status in database
      await supabase
        .from("inquiries")
        .update({
          notification_status: emailResult.status,
          notification_attempts: 1,
          notification_last_attempt: new Date().toISOString(),
          notification_error: emailResult.error || null,
        })
        .eq("id", inquiryId);
    } catch (notifErr) {
      // Notification errors do NOT abort the successful durable inquiry storage
      await supabase
        .from("inquiries")
        .update({
          notification_status: "failed",
          notification_error: notifErr instanceof Error ? notifErr.message : "Notification failure",
        })
        .eq("id", inquiryId);
    }

    return Response.json({
      ok: true,
      reference: finalReference,
      status: "stored",
    });
  } catch (err) {
    return Response.json(
      { error: "The inquiry storage service is currently unavailable." },
      { status: 503 },
    );
  }
}
