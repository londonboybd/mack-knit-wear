import { authorizeMutation, getAdmin } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { z } from "zod";
import { inquiryStatuses } from "@/lib/schema";

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(inquiryStatuses).optional(),
  note: z.string().trim().max(2000).optional(),
});

export async function GET() {
  if (!(await getAdmin()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await (await db())
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  return error
    ? Response.json({ error: "Unable to load inquiries." }, { status: 500 })
    : Response.json(data);
}

export async function PATCH(request: Request) {
  const denied = await authorizeMutation(request);
  if (denied)
    return Response.json({ error: denied.error }, { status: denied.status });

  const adminUser = await getAdmin();
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "Invalid update request." }, { status: 400 });

  const { id, status, note } = parsed.data;
  const client = await db();

  // If status change requested
  if (status) {
    const { error } = await client
      .from("inquiries")
      .update({ status })
      .eq("id", id);

    if (error)
      return Response.json({ error: "Unable to update inquiry status." }, { status: 500 });
  }

  // If internal note addition requested
  if (note) {
    const { data: existing } = await client
      .from("inquiries")
      .select("internal_notes")
      .eq("id", id)
      .single();

    const existingNotes = Array.isArray(existing?.internal_notes)
      ? existing.internal_notes
      : [];

    const newNote = {
      id: crypto.randomUUID(),
      text: note,
      created_at: new Date().toISOString(),
      author: adminUser?.email || "Administrator",
    };

    const updatedNotes = [...existingNotes, newNote];

    const { error } = await client
      .from("inquiries")
      .update({ internal_notes: updatedNotes })
      .eq("id", id);

    if (error)
      return Response.json({ error: "Unable to save internal note." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
