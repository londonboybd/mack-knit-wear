import { authorizeMutation, getAdmin } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { saveSchema } from "@/lib/schema";
export async function GET() {
  if (!(await getAdmin()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await (await db()).from("content").select("*");
  return error
    ? Response.json({ error: "Unable to load content." }, { status: 500 })
    : Response.json(data);
}
export async function POST(request: Request) {
  const denied = await authorizeMutation(request);
  if (denied)
    return Response.json({ error: denied.error }, { status: denied.status });
  if (Number(request.headers.get("content-length") || 0) > 100000)
    return Response.json({ error: "Content is too large." }, { status: 413 });
  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  const { id, kind, slug, content, action, updatedAt } = parsed.data;
  if (
    kind === "page" &&
    ![
      "home",
      "about",
      "products",
      "brands",
      "network",
      "contact",
      "privacy",
    ].includes(slug)
  )
    return Response.json(
      { error: "Choose an existing page." },
      { status: 400 },
    );
  if (kind === "settings" && slug !== "company")
    return Response.json(
      { error: "Invalid settings record." },
      { status: 400 },
    );
  if (kind === "brand" && content.relationship !== "owned")
    return Response.json(
      { error: "Use Our Network for brands the company does not own." },
      { status: 400 },
    );
  if (kind === "network" && content.relationship === "owned")
    return Response.json(
      { error: "Owned brands belong in Our Brands." },
      { status: 400 },
    );
  if (action === "publish" && content.image && !content.imageAlt)
    return Response.json(
      { error: "Add alternative text for this image before publishing." },
      { status: 400 },
    );
  const client = await db();
  let result;
  const publish =
    action === "publish"
      ? { published: content, published_at: new Date().toISOString() }
      : action === "unpublish"
        ? { published: null, published_at: null }
        : {};
  if (id) {
    if (!updatedAt)
      return Response.json(
        { error: "Reload this record before saving." },
        { status: 409 },
      );
    result = await client
      .from("content")
      .update({ draft: content, ...publish })
      .eq("id", id)
      .eq("kind", kind)
      .eq("slug", slug)
      .eq("updated_at", updatedAt)
      .select()
      .maybeSingle();
  } else {
    result = await client
      .from("content")
      .insert({ kind, slug, draft: content, ...publish })
      .select()
      .single();
  }
  if (result.error)
    return Response.json(
      {
        error:
          result.error.code === "23505"
            ? "That URL is already in use."
            : "Content could not be saved.",
      },
      { status: 400 },
    );
  if (!result.data)
    return Response.json(
      {
        error: "This content changed in another session. Reload before saving.",
      },
      { status: 409 },
    );
  return Response.json(result.data);
}
