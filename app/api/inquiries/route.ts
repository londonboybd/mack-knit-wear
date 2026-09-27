import { createHmac } from "node:crypto";
import { serviceDb } from "@/lib/supabase";
import { inquirySchema } from "@/lib/schema";
export async function POST(request: Request) {
  if (
    !process.env.INQUIRY_HASH_SECRET ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  )
    return Response.json(
      {
        error:
          "The inquiry service is not connected yet. Please try again later.",
      },
      { status: 503 },
    );
  if (
    request.headers.get("origin") !==
    new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url).origin
  )
    return Response.json({ error: "Invalid origin." }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 16000)
    return Response.json({ error: "Message is too large." }, { status: 413 });
  const parsed = inquirySchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  const { website, token, ...payload } = parsed.data;
  if (website) return Response.json({ ok: true });
  if (process.env.TURNSTILE_SECRET_KEY) {
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
    if (!result.success)
      return Response.json(
        { error: "Please complete the verification again." },
        { status: 400 },
      );
  }
  // Vercel overwrites x-vercel-forwarded-for; do not trust arbitrary client IP headers.
  const ip = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown"
    : "local-development";
  const hash = createHmac("sha256", process.env.INQUIRY_HASH_SECRET)
    .update(ip)
    .digest("hex");
  try {
    const { data, error } = await serviceDb().rpc("submit_inquiry", {
      payload,
      sender_hash: hash,
    });
    if (error)
      return Response.json(
        { error: "Your inquiry could not be saved. Please try again." },
        { status: 500 },
      );
    if (!data)
      return Response.json(
        { error: "Too many inquiries. Please try again in an hour." },
        { status: 429 },
      );
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "The inquiry service is unavailable." },
      { status: 503 },
    );
  }
}
