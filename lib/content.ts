import "server-only";
import { db, demo, configured } from "./supabase";
import { seed } from "./seed";
import { contentSchema, type RecordItem } from "./schema";
export async function publicRecords(): Promise<RecordItem[]> {
  if (demo) return seed;
  if (!configured) return [];
  const { data, error } = await (await db()).from("public_content").select("*");
  if (error) throw new Error("Content could not be loaded.");
  return (data ?? []).map((r) => ({ ...r, draft: r.published }) as RecordItem);
}
export async function adminRecords(): Promise<RecordItem[]> {
  if (demo) return seed;
  const { data, error } = await (await db())
    .from("content")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error("Content could not be loaded.");
  return (data ?? []) as RecordItem[];
}
export const fallbackSettings = contentSchema.parse({
  title: "Mack Knit Wear",
  footer: "Knitwear. Brands. Connections.",
});
