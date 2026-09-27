import { NextResponse } from "next/server";
import { db, configured } from "@/lib/supabase";
import { z } from "zod";
export async function POST(request: Request) {
  if (!configured)
    return NextResponse.json(
      { error: "Connect Supabase to enable administrator sign-in." },
      { status: 503 },
    );
  if (
    request.headers.get("origin") !==
    new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url).origin
  )
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  const parsed = z
    .object({ email: z.email(), password: z.string().min(1).max(200) })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a valid email and password." },
      { status: 400 },
    );
  const client = await db();
  const { data, error } = await client.auth.signInWithPassword(parsed.data);
  if (error || !data.user)
    return NextResponse.json(
      {
        error: "Unable to sign in. Check your credentials or try again later.",
      },
      { status: 401 },
    );
  const { data: admin } = await client
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!admin) {
    await client.auth.signOut();
    return NextResponse.json(
      { error: "This account does not have administrator access." },
      { status: 403 },
    );
  }
  return NextResponse.json({ ok: true });
}
