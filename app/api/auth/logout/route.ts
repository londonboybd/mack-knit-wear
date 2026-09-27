import { db } from "@/lib/supabase";
import { authorizeMutation } from "@/lib/auth";
export async function POST(request: Request) {
  const denied = await authorizeMutation(request);
  if (denied)
    return Response.json({ error: denied.error }, { status: denied.status });
  await (await db()).auth.signOut();
  return Response.json({ ok: true });
}
