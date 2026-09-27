import { getAdmin } from "@/lib/auth";
import { db } from "@/lib/supabase";
export async function GET() {
  if (!(await getAdmin()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await (await db()).from("content").select("*");
  if (error) return Response.json({ error: "Export failed." }, { status: 500 });
  return new Response(
    JSON.stringify(
      { exportedAt: new Date().toISOString(), content: data },
      null,
      2,
    ),
    {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition":
          'attachment; filename="mack-knit-wear-content.json"',
        "Cache-Control": "no-store",
      },
    },
  );
}
