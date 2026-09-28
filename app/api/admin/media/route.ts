import { getAdmin, authorizeMutation } from "@/lib/auth";
import { db } from "@/lib/supabase";

export async function GET() {
  if (!(await getAdmin()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const client = await db();
  const bucket = client.storage.from("media");
  const { data: storageFiles, error: storageError } = await bucket.list("", {
    limit: 200,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (storageError)
    return Response.json({ error: "Unable to load media assets." }, { status: 500 });

  // Load content to detect image usage across pages, brands, products
  const { data: contentRecords } = await client.from("content").select("id, kind, slug, draft, published");

  const mediaItems = (storageFiles ?? []).map((f) => {
    const url = bucket.getPublicUrl(f.name).data.publicUrl;

    // Check where this image URL is used
    const usages: Array<{ kind: string; slug: string; title: string }> = [];
    if (contentRecords) {
      for (const r of contentRecords) {
        const c = r.draft;
        const pub = r.published;
        const matches =
          c?.image === url ||
          c?.brandLogo === url ||
          c?.craftsmanshipImage === url ||
          c?.gallery?.some((g: any) => g.image === url) ||
          c?.sections?.some((s: any) => s.image === url || s.data?.items?.some((it: any) => it.image === url)) ||
          pub?.image === url;

        if (matches) {
          usages.push({
            kind: r.kind,
            slug: r.slug,
            title: c?.title || r.slug,
          });
        }
      }
    }

    return {
      name: f.name,
      url,
      size: f.metadata?.size,
      mimeType: f.metadata?.mimetype,
      createdAt: f.created_at,
      usages,
      isUsed: usages.length > 0,
    };
  });

  return Response.json(mediaItems);
}

export async function POST(request: Request) {
  const denied = await authorizeMutation(request);
  if (denied)
    return Response.json({ error: denied.error }, { status: denied.status });

  if (Number(request.headers.get("content-length") || 0) > 4_000_000)
    return Response.json(
      { error: "Choose an image smaller than 3 MB." },
      { status: 413 },
    );

  const form = await request.formData();
  const file = form.get("file");
  const alt = String(form.get("alt") || "");
  const caption = String(form.get("caption") || "");

  if (!(file instanceof File) || file.size > 3_000_000)
    return Response.json(
      { error: "Choose a JPG, PNG, or WebP under 3 MB." },
      { status: 400 },
    );

  const b = Buffer.from(await file.arrayBuffer());
  const mime =
    b[0] === 255 && b[1] === 216 && b[2] === 255
      ? "image/jpeg"
      : b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        ? "image/png"
        : b.toString("ascii", 0, 4) === "RIFF" &&
            b.toString("ascii", 8, 12) === "WEBP"
          ? "image/webp"
          : null;

  if (!mime)
    return Response.json(
      { error: "Unsupported image format. Upload JPG, PNG, or WebP." },
      { status: 400 },
    );

  const name = `${crypto.randomUUID()}.${mime === "image/jpeg" ? "jpg" : mime.split("/")[1]}`;
  const client = await db();
  const bucket = client.storage.from("media");

  const { error: uploadError } = await bucket.upload(name, b, {
    contentType: mime,
    upsert: false,
  });

  if (uploadError)
    return Response.json({ error: "Upload failed." }, { status: 500 });

  const url = bucket.getPublicUrl(name).data.publicUrl;

  // Insert into media_assets table for metadata tracking
  try {
    await client.from("media_assets").insert({
      name,
      url,
      alt,
      caption,
      size_bytes: file.size,
      mime_type: mime,
    });
  } catch {
    // Non-fatal if table not migrated yet
  }

  return Response.json({ name, url, alt, caption });
}

export async function DELETE(request: Request) {
  const denied = await authorizeMutation(request);
  if (denied)
    return Response.json({ error: denied.error }, { status: denied.status });

  const url = new URL(request.url);
  const name = url.searchParams.get("name");
  const imageUrl = url.searchParams.get("url");

  if (!name && !imageUrl)
    return Response.json({ error: "Image name or URL is required." }, { status: 400 });

  const client = await db();

  // Inspect usage across content records before deleting
  const { data: contentRecords } = await client.from("content").select("id, kind, slug, draft, published");
  if (contentRecords && imageUrl) {
    for (const r of contentRecords) {
      const c = r.draft;
      const pub = r.published;
      const isReferenced =
        c?.image === imageUrl ||
        c?.brandLogo === imageUrl ||
        c?.gallery?.some((g: any) => g.image === imageUrl) ||
        pub?.image === imageUrl;

      if (isReferenced && url.searchParams.get("force") !== "true") {
        return Response.json(
          {
            error: `Cannot delete asset: This image is currently in use on "${c?.title || r.slug}" (${r.kind}). Remove the image from the content first.`,
          },
          { status: 409 },
        );
      }
    }
  }

  const fileName = name || (imageUrl ? imageUrl.split("/").pop() : "");
  if (!fileName)
    return Response.json({ error: "Could not determine file name." }, { status: 400 });

  const bucket = client.storage.from("media");
  const { error: removeError } = await bucket.remove([fileName]);

  if (removeError)
    return Response.json({ error: "Failed to delete storage file." }, { status: 500 });

  try {
    await client.from("media_assets").delete().eq("name", fileName);
  } catch {
    // Ignore
  }

  return Response.json({ ok: true });
}
