import { authorizeMutation, getAdmin } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { z } from "zod";
export async function GET() {
  if (!(await getAdmin()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await (await db())
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return error
    ? Response.json({ error: "Unable to load inquiries." }, { status: 500 })
    : Response.json(data);
}
export async function PATCH(request: Request) {
  const denied = await authorizeMutation(request);
  if (denied)
    return Response.json({ error: denied.error }, { status: denied.status });
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(["new", "read", "closed"]) })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "Invalid inquiry." }, { status: 400 });
  const { error } = await (await db())
    .from("inquiries")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  return error
    ? Response.json({ error: "Unable to update inquiry." }, { status: 500 })
    : Response.json({ ok: true });
}
