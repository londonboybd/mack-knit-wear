"use client";
import { useEffect, useState } from "react";
import { Upload, Copy, Image as ImageIcon } from "lucide-react";
type Media = { name: string; url: string };
export function MediaLibrary({ demo }: { demo: boolean }) {
  const [items, setItems] = useState<Media[]>(
      demo
        ? [
            {
              name: "Illustrative knitwear photograph",
              url: "/images/knitwear.jpg",
            },
          ]
        : [],
    ),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!demo)
      fetch("/api/admin/media")
        .then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          setItems(d);
        })
        .catch((e) => setMessage(e.message));
  }, [demo]);
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const r = await fetch("/api/admin/media", { method: "POST", body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setItems((i) => [d, ...i]);
      setMessage("Image uploaded. Copy its URL into any content editor.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to upload.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">YOUR VISUAL LIBRARY</span>
          <h1>Media library</h1>
          <p>Company photography, product images, and brand assets.</p>
        </div>
        <label className="button dark">
          <Upload size={17} />
          {busy ? "Uploading…" : "Upload image"}
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={demo || busy}
            onChange={(e) => upload(e.target.files?.[0])}
          />
        </label>
      </div>
      <div className="notice">
        Images are public. Upload JPG, PNG, or WebP files up to 3 MB. Add
        descriptive alternative text when using an image on a page.
      </div>
      <p role="status">{message}</p>
      <div className="media-grid">
        {items.map((item) => (
          <article className="panel media-card" key={item.url}>
            <img src={item.url} alt={item.name} />
            <div>
              <strong>{item.name}</strong>
              <button
                className="text-link"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(item.url);
                    setMessage("Image URL copied.");
                  } catch {
                    setMessage(`Image URL: ${item.url}`);
                  }
                }}
              >
                <Copy size={15} />
                Copy URL
              </button>
            </div>
          </article>
        ))}
      </div>
      {!items.length && (
        <div className="panel empty-state">
          <ImageIcon />
          <h3>Your image library starts here.</h3>
          <p>Upload an image to use it across the website.</p>
        </div>
      )}
    </>
  );
}
