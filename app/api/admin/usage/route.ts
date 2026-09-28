import { getAdmin } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { checkRecordUsage, type Kind, type RecordItem } from "@/lib/schema";

export async function GET(request: Request) {
  if (!(await getAdmin()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const kind = url.searchParams.get("kind") as Kind;

  if (!id || !kind)
    return Response.json({ error: "id and kind query parameters are required" }, { status: 400 });

  const client = await db();
  const { data: records, error } = await client.from("content").select("*");

  if (error || !records)
    return Response.json({ error: "Unable to inspect record usage" }, { status: 500 });

  const usage = checkRecordUsage(id, kind, records as RecordItem[]);
  return Response.json(usage);
}
