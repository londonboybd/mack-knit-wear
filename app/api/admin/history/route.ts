import { getAdmin } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { z } from "zod";
export async function GET(request: Request) {
  if (!(await getAdmin()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!z.uuid().safeParse(id).success)
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  const { data, error } = await (await db())
    .from("content_history")
    .select("id,snapshot,created_at")
    .eq("content_id", id)
    .order("created_at", { ascending: false })
    .limit(20);
  return error
    ? Response.json({ error: "Unable to load revisions." }, { status: 500 })
    : Response.json(data);
}
