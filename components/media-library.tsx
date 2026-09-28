"use client";

import { useEffect, useState } from "react";
import { Upload, Copy, Image as ImageIcon, Trash2, Check, AlertTriangle } from "lucide-react";
import type { MediaAsset } from "./media-picker";

export function MediaLibrary({ demo }: { demo: boolean }) {
  const [items, setItems] = useState<MediaAsset[]>(
    demo
      ? [
          {
            name: "knitwear.jpg",
            url: "/images/knitwear.jpg",
            alt: "Illustrative knitwear textile detail",
            isUsed: true,
            usages: [
              { kind: "page", slug: "home", title: "Home" },
              { kind: "page", slug: "about", title: "About us" },
            ],
          },
        ]
      : [],
  );

  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Upload fields
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState("");

  useEffect(() => {
    if (!demo) {
      fetch("/api/admin/media")
        .then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          setItems(d);
        })
        .catch((e) => setMessage(e.message));
    }
  }, [demo]);

  async function upload() {
    if (!uploadFile) return;
    setBusy(true);
    setMessage("");

    try {
      const form = new FormData();
      form.set("file", uploadFile);
      form.set("alt", uploadAlt.trim());

      const r = await fetch("/api/admin/media", { method: "POST", body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);

      setItems((prev) => [
        {
          name: d.name,
          url: d.url,
          alt: uploadAlt.trim(),
          isUsed: false,
          usages: [],
        },
        ...prev,
      ]);

      setMessage("Image uploaded successfully with alternative text.");
      setUploadFile(null);
      setUploadAlt("");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to upload.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteAsset(item: MediaAsset) {
    if (item.isUsed) {
      alert(
        `Cannot delete: This asset is used in ${item.usages?.map((u) => `"${u.title}" (${u.kind})`).join(", ")}. Remove it from those pages before deleting.`,
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      const res = await fetch(
        `/api/admin/media?name=${encodeURIComponent(item.name)}&url=${encodeURIComponent(item.url)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setItems((prev) => prev.filter((i) => i.url !== item.url));
      setMessage(`Deleted "${item.name}".`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to delete asset.");
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
      setMessage("Asset URL copied to clipboard.");
    } catch {
      setMessage(`Asset URL: ${url}`);
    }
  }

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">YOUR VISUAL LIBRARY</span>
          <h1>Media library</h1>
          <p>Inspect assets, review content usage, and safely manage public photography.</p>
        </div>

        <label className="button dark">
          <Upload size={17} />
          {busy ? "Uploading…" : "Upload new image"}
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={demo || busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setUploadFile(f);
                setUploadAlt(f.name.replace(/\.[^/.]+$/, ""));
              }
            }}
          />
        </label>
      </div>

      {uploadFile && (
        <div className="panel upload-staged-panel">
          <div className="staged-file-info">
            <strong>Selected: {uploadFile.name}</strong>
            <small>({(uploadFile.size / 1024).toFixed(1)} KB)</small>
          </div>
          <label>
            Alternative text for accessibility <span className="req">*</span>
            <input
              placeholder="Describe what this photograph portrays for screen readers…"
              value={uploadAlt}
              onChange={(e) => setUploadAlt(e.target.value)}
            />
          </label>
          <div className="staged-actions">
            <button
              type="button"
              className="button dark small"
              disabled={busy || !uploadAlt.trim()}
              onClick={upload}
            >
              Confirm & upload
            </button>
            <button
              type="button"
              className="button outline small"
              onClick={() => {
                setUploadFile(null);
                setUploadAlt("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="notice">
        Images are public website assets. Upload JPG, PNG, or WebP files under 3 MB. The system tracks content references to prevent accidental broken images on live pages.
      </div>

      {message && <p role="status" className="editor-message info">{message}</p>}

      <div className="media-grid">
        {items.map((item) => (
          <article className="panel media-card" key={item.url}>
            <div className="media-thumb-box">
              <img src={item.url} alt={item.alt || item.name} loading="lazy" />
            </div>

            <div className="media-card-details">
              <strong>{item.name}</strong>

              <div className="media-usage-row">
                {item.isUsed ? (
                  <span
                    className="badge published"
                    title={item.usages?.map((u) => `${u.title} (${u.kind})`).join(", ")}
                  >
                    Used in {item.usages?.length} place(s)
                  </span>
                ) : (
                  <span className="badge draft">Unused</span>
                )}
              </div>

              <div className="media-card-actions">
                <button
                  type="button"
                  className="text-link"
                  onClick={() => copyUrl(item.url)}
                >
                  {copiedUrl === item.url ? <Check size={14} /> : <Copy size={14} />}
                  {copiedUrl === item.url ? "Copied" : "Copy URL"}
                </button>

                {!item.isUsed && !demo && (
                  <button
                    type="button"
                    className="icon-action-btn text-danger"
                    onClick={() => deleteAsset(item)}
                    title="Delete unused asset"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {!items.length && (
        <div className="panel empty-state">
          <ImageIcon size={32} />
          <h3>Your image library starts here.</h3>
          <p>Upload photography to feature across product pages and brand lookbooks.</p>
        </div>
      )}
    </>
  );
}
