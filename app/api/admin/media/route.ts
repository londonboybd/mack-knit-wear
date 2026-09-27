import { getAdmin, authorizeMutation } from "@/lib/auth";
import { db } from "@/lib/supabase";
export async function GET() {
  if (!(await getAdmin()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const bucket = (await db()).storage.from("media");
  const { data, error } = await bucket.list("", {
    limit: 100,
    sortBy: { column: "created_at", order: "desc" },
  });
  return error
    ? Response.json({ error: "Unable to load media." }, { status: 500 })
    : Response.json(
        (data ?? []).map((f) => ({
          name: f.name,
          url: bucket.getPublicUrl(f.name).data.publicUrl,
        })),
      );
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
      { error: "Unsupported image format." },
      { status: 400 },
    );
  const name = `${crypto.randomUUID()}.${mime === "image/jpeg" ? "jpg" : mime.split("/")[1]}`;
  const bucket = (await db()).storage.from("media");
  const { error } = await bucket.upload(name, b, {
    contentType: mime,
    upsert: false,
  });
  return error
    ? Response.json({ error: "Upload failed." }, { status: 500 })
    : Response.json({ name, url: bucket.getPublicUrl(name).data.publicUrl });
}
