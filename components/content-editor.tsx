"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Save,
  Globe,
  History,
  Upload,
  Check,
  Copy,
} from "lucide-react";
import {
  contentSchema,
  relationshipLabels,
  type RecordItem,
  type Content,
  type Kind,
} from "@/lib/schema";
import { StatusBadge } from "./records-table";
import { BrandPage, PageIntro, Prose } from "./public-content";
type HistoryEntry = { id: number; snapshot: Content; created_at: string };
export function ContentEditor({
  record,
  kind,
  section,
  demo,
}: {
  record?: RecordItem;
  kind: Kind;
  section: string;
  demo: boolean;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(record),
    [content, setContent] = useState<Content>(
      record?.draft ||
        contentSchema.parse({
          title: `Untitled ${kind}`,
          relationship: kind === "network" ? "partner" : "owned",
        }),
    ),
    [slug, setSlug] = useState(record?.slug || ""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [preview, setPreview] = useState(false),
    [history, setHistory] = useState<HistoryEntry[] | null>(null),
    [dirty, setDirty] = useState(false),
    [confirm, setConfirm] = useState<"publish" | "unpublish" | null>(null);
  useEffect(() => {
    function prevent(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty]);
  function field<K extends keyof Content>(key: K, value: Content[K]) {
    setContent((c) => ({ ...c, [key]: value }));
    setDirty(true);
  }
  async function save(action: "save" | "publish" | "unpublish") {
    setConfirm(null);
    if (demo) {
      setMessage("Preview only: connect Supabase to save and publish.");
      return;
    }
    const checked = contentSchema.safeParse(content);
    if (!checked.success) {
      setMessage(checked.error.issues[0].message);
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: current?.id,
          kind,
          slug,
          content: checked.data,
          action,
          updatedAt: current?.updated_at,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setCurrent(data);
      setDirty(false);
      setMessage(
        action === "publish"
          ? "Published. The live website now shows this content."
          : action === "unpublish"
            ? "Unpublished. The content is now a private draft."
            : "Draft saved. The live website is unchanged.",
      );
      if (!current) router.replace(`/admin/${section}/${data.id}`);
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  async function revisions() {
    if (demo) {
      setHistory([]);
      return;
    }
    try {
      const r = await fetch(`/api/admin/history?id=${current?.id}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setHistory(data);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to load revisions.");
    }
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const r = await fetch("/api/admin/media", { method: "POST", body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      field("image", d.url);
      setMessage("Image uploaded. Add alternative text, then save your draft.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }
  const text = (
    key: keyof Content,
    label: string,
    textarea = false,
    hint = "",
  ) => (
    <label key={key}>
      {label}
      {textarea ? (
        <textarea
          rows={key === "body" ? 7 : 3}
          value={String(content[key])}
          onChange={(e) => field(key, e.target.value as never)}
        />
      ) : (
        <input
          value={String(content[key])}
          onChange={(e) => field(key, e.target.value as never)}
        />
      )}{" "}
      {hint && <small>{hint}</small>}
    </label>
  );
  return (
    <>
      <Link
        href={section === "settings" ? "/admin" : `/admin/${section}`}
        className="back-link"
      >
        <ArrowLeft size={15} />
        Back to {section === "settings" ? "overview" : section}
      </Link>
      <div className="admin-page-heading editor-heading">
        <div>
          <h1>
            {kind === "settings"
              ? "Site settings"
              : current
                ? `Edit ${kind}`
                : `New ${kind}`}
          </h1>
          <p>
            {current?.draft.title ||
              "Give this entry a name and a place in your portfolio."}
          </p>
        </div>
        <div className="editor-actions">
          <button
            className="button outline"
            onClick={() => setPreview(!preview)}
          >
            <Eye size={16} />
            {preview ? "Back to editor" : "Preview"}
          </button>
          <button
            disabled={busy || demo}
            className="button outline"
            onClick={() => save("save")}
          >
            <Save size={16} />
            Save draft
          </button>
          <button
            disabled={busy || demo}
            className="button dark"
            onClick={() => setConfirm("publish")}
          >
            <Globe size={16} />
            Publish
          </button>
        </div>
      </div>
      <div className="editor-message" role="status">
        {message}
        {dirty && <span className="muted"> · Unsaved changes</span>}
      </div>
      {confirm && (
        <div className="confirm-panel" role="alert">
          <strong>
            {confirm === "publish"
              ? "Publish these changes to the live website?"
              : "Remove this content from the live website?"}
          </strong>
          <p>
            {confirm === "publish"
              ? "Check the company details, images, and links before publishing."
              : "The draft and revision history will be retained."}
          </p>
          <button className="button dark" onClick={() => save(confirm)}>
            Confirm {confirm}
          </button>
          <button className="button outline" onClick={() => setConfirm(null)}>
            Cancel
          </button>
        </div>
      )}
      {preview ? (
        <div className="editor-preview">
          <div className="preview-label">UNSAVED CONTENT PREVIEW</div>
          {kind === "brand" ? (
            <BrandPage content={content} />
          ) : (
            <>
              <PageIntro content={content} />
              {content.image && (
                <img
                  className="wide-photo"
                  src={content.image}
                  alt={content.imageAlt}
                />
              )}
              <div className="section">
                <Prose text={content.body} />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="editor-grid">
          <div>
            <section className="panel form-panel">
              <div className="panel-heading">
                <h2>
                  {kind === "settings" ? "Company information" : "Core content"}
                </h2>
                {current && <StatusBadge record={current} />}
              </div>
              {text(
                "title",
                kind === "settings" ? "Company name" : "Title / name",
              )}
              {kind !== "settings" && (
                <label>
                  URL identifier
                  <input
                    value={slug}
                    disabled={!!current}
                    placeholder="your-brand-name"
                    onChange={(e) => {
                      setSlug(
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                      );
                      setDirty(true);
                    }}
                  />
                  <small>
                    {current
                      ? "Fixed after creation to keep existing links working."
                      : "Lowercase letters, numbers, and hyphens."}
                  </small>
                </label>
              )}
              {text("eyebrow", "Small heading / label")}
              {text("summary", "Short introduction", true)}
              {text(
                "body",
                "Full description",
                true,
                "Separate paragraphs with a new line.",
              )}
              {kind === "settings" && (
                <>
                  {text("email", "Business email")}
                  {text("phone", "Phone")}
                  {text("address", "Address", true)}
                  {text("footer", "Footer description")}
                  {text("footerNote", "Footer closing line")}
                  {text("logoTagline", "Logo tagline")}
                  {text("linkedin", "LinkedIn URL")}
                  {text("facebook", "Facebook URL")}
                </>
              )}
              {kind === "page" && current?.slug === "home" && (
                <>
                  {text("heroFooter", "Hero footer label")}
                  {text("photoLabel", "Photo label")}
                  {text(
                    "ticker",
                    "Feature strip words",
                    false,
                    "Separate words with commas.",
                  )}
                  {text("aboutLabel", "About section label")}
                  {text("brandsLabel", "Brands section label")}
                  {text("brandsTitle", "Brands section heading")}
                  {text("contactLabel", "Contact section label")}
                  {text("contactTitle", "Contact section heading")}
                  {text("contactButton", "Contact button label")}
                  {text("ctaLabel", "Main button label")}
                  {text(
                    "ctaHref",
                    "Main button destination",
                    false,
                    "A site path such as /brands, or a complete HTTPS URL.",
                  )}
                </>
              )}
            </section>
            <section className="panel form-panel">
              <h2>{kind === "settings" ? "Company logo" : "Image"}</h2>
              {content.image && (
                <img
                  className="editor-image"
                  src={content.image}
                  alt={content.imageAlt || "Selected image preview"}
                />
              )}
              <label className="upload-button">
                <Upload size={16} />
                Upload image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={demo || busy}
                  onChange={(e) => upload(e.target.files?.[0])}
                />
              </label>
              <p className="muted">
                JPG, PNG, or WebP, up to 3 MB. Uploaded images are publicly
                accessible.
              </p>
              {text(
                "image",
                "Image URL",
                false,
                "Upload an image or paste its HTTPS address. Clear this field to remove the image.",
              )}
              {text(
                "imageAlt",
                "Image alternative text",
                false,
                "Describe what the image shows for people using screen readers.",
              )}
            </section>
            <section className="panel form-panel">
              <h2>Search engine appearance</h2>
              {text("seoTitle", "Page title")}
              {text("seoDescription", "Search description", true)}
              <p className="muted">
                If empty, the content title and introduction are used.
              </p>
            </section>
          </div>
          <aside>
            <section className="panel form-panel">
              <h2>Display settings</h2>
              {kind === "settings" && !demo && (
                <p>
                  <a className="text-link" href="/api/admin/export" download>
                    Export content backup
                  </a>
                </p>
              )}
              {kind === "page" && current?.slug === "home" && (
                <div className="home-sections">
                  <p className="muted">
                    Show, hide, and reorder homepage sections.
                  </p>
                  {(["about", "brands", "contact"] as const).map((s) => (
                    <label className="checkbox" key={s}>
                      <input
                        type="checkbox"
                        checked={content.homeSections.includes(s)}
                        onChange={(e) =>
                          field(
                            "homeSections",
                            e.target.checked
                              ? [...content.homeSections, s]
                              : content.homeSections.filter((v) => v !== s),
                          )
                        }
                      />
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </label>
                  ))}
                  {content.homeSections.map((s, i) => (
                    <div className="section-order" key={s}>
                      <span>
                        {i + 1}. {s}
                      </span>
                      <button
                        type="button"
                        disabled={i === 0}
                        aria-label={`Move ${s} up`}
                        onClick={() => {
                          const order = [...content.homeSections];
                          [order[i - 1], order[i]] = [order[i], order[i - 1]];
                          field("homeSections", order);
                        }}
                      >
                        Move up
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {["brand", "network"].includes(kind) && (
                <>
                  <label>
                    Business relationship
                    <select
                      value={content.relationship}
                      disabled={kind === "brand"}
                      onChange={(e) =>
                        field(
                          "relationship",
                          e.target.value as Content["relationship"],
                        )
                      }
                    >
                      {Object.entries(relationshipLabels)
                        .filter(([key]) =>
                          kind === "brand" ? key === "owned" : key !== "owned",
                        )
                        .map(([value, label]) => (
                          <option value={value} key={value}>
                            {label}
                          </option>
                        ))}
                    </select>
                  </label>
                  {text(
                    "website",
                    "Official website URL",
                    false,
                    "Use a complete https:// address.",
                  )}
                  {kind === "brand" &&
                    text(
                      "store",
                      "Ecommerce / store URL",
                      false,
                      "Leave blank until the store is available.",
                    )}
                </>
              )}
              {["brand", "product", "network"].includes(kind) && (
                <>
                  {text("category", "Category label")}
                  <label>
                    Display order
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={content.order}
                      onChange={(e) => field("order", Number(e.target.value))}
                    />
                    <small>Lower numbers appear first.</small>
                  </label>
                </>
              )}
              {kind === "brand" && (
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={content.featured}
                    onChange={(e) => field("featured", e.target.checked)}
                  />
                  Feature on homepage
                </label>
              )}
              <p className="muted">
                Only published content is visible to website visitors.
              </p>
              {current?.published && (
                <button
                  disabled={demo || busy}
                  className="text-danger"
                  onClick={() => setConfirm("unpublish")}
                >
                  Unpublish this content
                </button>
              )}
            </section>
            <section className="panel form-panel">
              <h2>
                <History size={17} /> Revision history
              </h2>
              <p className="muted">
                Restore a previous version into the editor, then save or publish
                it.
              </p>
              <button
                disabled={!current}
                className="button outline"
                onClick={revisions}
              >
                View previous versions
              </button>
              {history && (
                <div className="revision-list">
                  {history.length === 0 ? (
                    <p>No previous versions yet.</p>
                  ) : (
                    history.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => {
                          setContent(h.snapshot);
                          setDirty(true);
                          setMessage(
                            "Previous version loaded into the editor. Save to keep it.",
                          );
                        }}
                      >
                        <History size={15} />
                        {new Date(h.created_at).toLocaleString()}
                      </button>
                    ))
                  )}
                </div>
              )}
            </section>
            <div className="editor-tip">
              <Check size={18} />
              <p>
                Use verified information. Keep unconfirmed brands and
                relationships in draft.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
