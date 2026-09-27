import { authorizeMutation, getAdmin } from "@/lib/auth";
import { db } from "@/lib/supabase";
import {
  saveSchema,
  normalizeContent,
  checkRecordUsage,
  type Kind,
  type RecordItem,
} from "@/lib/schema";

const reservedSlugs = [
  "admin",
  "api",
  "login",
  "preview",
  "media",
  "inquiries",
  "settings",
  "export",
  "history",
  "auth",
  "sitemap",
  "robots",
];

const corePageSlugs = [
  "home",
  "about",
  "products",
  "brands",
  "capabilities",
  "network",
  "contact",
  "privacy",
];

export async function GET() {
  if (!(await getAdmin()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await (await db())
    .from("content")
    .select("*")
    .order("updated_at", { ascending: false });
  return error
    ? Response.json({ error: "Unable to load content." }, { status: 500 })
    : Response.json(data);
}

export async function POST(request: Request) {
  const denied = await authorizeMutation(request);
  if (denied)
    return Response.json({ error: denied.error }, { status: denied.status });

  if (Number(request.headers.get("content-length") || 0) > 500000)
    return Response.json({ error: "Content payload exceeds 500 KB ceiling." }, { status: 413 });

  const rawJson = await request.json().catch(() => null);
  const parsed = saveSchema.safeParse(rawJson);
  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message || "Validation failed." },
      { status: 400 },
    );

  const { id, kind, slug, content: rawContent, action, updatedAt } = parsed.data;
  const content = normalizeContent(rawContent, kind, slug);

  // Validate reserved slugs
  if (reservedSlugs.includes(slug)) {
    return Response.json(
      { error: `The URL identifier "/${slug}" is reserved for system use.` },
      { status: 400 },
    );
  }

  // Settings validation
  if (kind === "settings" && slug !== "company") {
    return Response.json({ error: "Invalid settings record identifier." }, { status: 400 });
  }

  // Relationship boundaries
  if (kind === "brand" && content.relationship !== "owned") {
    return Response.json(
      { error: "Use Our Network for brands or clients the company does not own." },
      { status: 400 },
    );
  }

  if (kind === "network" && content.relationship === "owned") {
    return Response.json(
      { error: "Owned portfolio brands belong in Our Brands." },
      { status: 400 },
    );
  }

  // Required image accessibility alt-text verification on publication
  if (action === "publish") {
    if (content.image && !content.imageAlt) {
      return Response.json(
        { error: "Add descriptive alternative text for the primary image before publishing." },
        { status: 400 },
      );
    }
    if (content.brandLogo && !content.brandLogoAlt) {
      return Response.json(
        { error: "Add alternative text for the brand logo before publishing." },
        { status: 400 },
      );
    }
    if (content.gallery?.some((g) => g.image && !g.alt)) {
      return Response.json(
        { error: "Every gallery image requires alternative text before publishing." },
        { status: 400 },
      );
    }
  }

  const client = await db();

  // If unpublishing or archiving, inspect usage references
  if (action === "unpublish" && id) {
    const { data: allRecords } = await client.from("content").select("*");
    if (allRecords) {
      const usage = checkRecordUsage(id, kind, allRecords as RecordItem[]);
      // Usage is tracked; we attach it in response headers or log
      if (usage.isUsed && request.headers.get("x-ignore-usage") !== "true") {
        return Response.json(
          {
            error: `This record is currently referenced by other items (${usage.usages.map((u) => `${u.title} (${u.kind})`).join(", ")}). Remove those references or confirm unpublication.`,
            usageWarning: true,
            usages: usage.usages,
          },
          { status: 409 },
        );
      }
    }
  }

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
    // Check if slug already exists across any kind
    const { data: existing } = await client
      .from("content")
      .select("id, kind, slug")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return Response.json(
        { error: `The URL "/${slug}" is already used by a ${existing.kind} record.` },
        { status: 400 },
      );
    }

    result = await client
      .from("content")
      .insert({ kind, slug, draft: content, ...publish })
      .select()
      .single();
  }

  if (result.error) {
    return Response.json(
      {
        error:
          result.error.code === "23505"
            ? "That URL identifier is already in use."
            : "Content could not be saved to the database.",
      },
      { status: 400 },
    );
  }

  if (!result.data) {
    return Response.json(
      {
        error: "This content changed in another session. Reload before saving to resolve conflicts.",
      },
      { status: 409 },
    );
  }

  return Response.json(result.data);
}

export async function DELETE(request: Request) {
  const denied = await authorizeMutation(request);
  if (denied)
    return Response.json({ error: denied.error }, { status: denied.status });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id)
    return Response.json({ error: "Record ID is required." }, { status: 400 });

  const client = await db();
  const { data: existing } = await client
    .from("content")
    .select("*")
    .eq("id", id)
    .single();

  if (!existing)
    return Response.json({ error: "Record not found." }, { status: 404 });

  // Do not allow deleting published core pages
  if (existing.kind === "page" && corePageSlugs.includes(existing.slug)) {
    return Response.json(
      { error: "Core system pages cannot be deleted." },
      { status: 403 },
    );
  }

  // Check usage across other records
  const { data: allRecords } = await client.from("content").select("*");
  if (allRecords) {
    const usage = checkRecordUsage(id, existing.kind as Kind, allRecords as RecordItem[]);
    if (usage.isUsed && url.searchParams.get("force") !== "true") {
      return Response.json(
        {
          error: `Cannot delete: this record is referenced by ${usage.usages.length} item(s).`,
          usages: usage.usages,
        },
        { status: 409 },
      );
    }
  }

  const { error } = await client.from("content").delete().eq("id", id);
  if (error)
    return Response.json({ error: "Failed to delete record." }, { status: 500 });

  return Response.json({ ok: true, id });
}
