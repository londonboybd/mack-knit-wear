"use client";

import React, { useState, useEffect } from "react";
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
  Trash2,
  Plus,
  AlertTriangle,
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import {
  contentSchema,
  normalizeContent,
  relationshipLabels,
  pageTemplateLabels,
  type RecordItem,
  type Content,
  type Kind,
  type PageTemplate,
  type Section,
  type Specification,
  type ProcessStep,
  type Location,
  type NavItem,
  type GalleryItem,
} from "@/lib/schema";
import { StatusBadge } from "./records-table";
import { SectionEditor } from "./section-editor";
import { SectionRenderer } from "./section-renderer";
import { PublicShell } from "./public-shell";
import { ProductCarousel } from "./product-carousel";
import { MediaPicker } from "./media-picker";

type HistoryEntry = { id: number; snapshot: Content; created_at: string };

export function ContentEditor({
  record,
  kind,
  section,
  demo,
  allRecords = [],
}: {
  record?: RecordItem;
  kind: Kind;
  section: string;
  demo: boolean;
  allRecords?: RecordItem[];
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(record);
  const [content, setContent] = useState<Content>(
    record?.draft
      ? normalizeContent(record.draft, kind, record.slug)
      : normalizeContent(
          contentSchema.parse({
            title: `Untitled ${kind}`,
            relationship: kind === "network" ? "partner" : "owned",
          }),
          kind,
        ),
  );
  const [slug, setSlug] = useState(record?.slug || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "error" | "success">("info");
  const [preview, setPreview] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [dirty, setDirty] = useState(false);
  const [confirm, setConfirm] = useState<"publish" | "unpublish" | "delete" | null>(null);
  const [usageWarning, setUsageWarning] = useState<Array<{ title: string; kind: string; context: string }> | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<
    "image" | "brandLogo" | { type: "gallery"; index: number } | null
  >(null);

  const openMediaPicker = (target: "image" | "brandLogo" | { type: "gallery"; index: number }) => {
    setMediaPickerTarget(target);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (asset: { url: string; alt: string; caption?: string }) => {
    if (mediaPickerTarget === "image") {
      field("image", asset.url);
      if (asset.alt) field("imageAlt", asset.alt);
    } else if (mediaPickerTarget === "brandLogo") {
      field("brandLogo", asset.url);
      if (asset.alt) field("brandLogoAlt", asset.alt);
    } else if (mediaPickerTarget && typeof mediaPickerTarget === "object" && mediaPickerTarget.type === "gallery") {
      const updated = [...(content.gallery || [])];
      if (updated[mediaPickerTarget.index]) {
        updated[mediaPickerTarget.index] = {
          ...updated[mediaPickerTarget.index],
          image: asset.url,
          alt: asset.alt || updated[mediaPickerTarget.index].alt,
          caption: asset.caption || updated[mediaPickerTarget.index].caption,
        };
        field("gallery", updated);
      }
    }
    setMediaPickerOpen(false);
    setMediaPickerTarget(null);
  };

  // Warn before navigating away with unsaved changes
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

  async function checkUsageBeforeAction(action: "unpublish" | "delete") {
    if (!current?.id) {
      setConfirm(action);
      return;
    }

    try {
      const res = await fetch(`/api/admin/usage?id=${current.id}&kind=${kind}`);
      const data = await res.json();
      if (data.isUsed && data.usages.length > 0) {
        setUsageWarning(data.usages);
      } else {
        setUsageWarning(null);
      }
    } catch {
      setUsageWarning(null);
    }
    setConfirm(action);
  }

  async function save(action: "save" | "publish" | "unpublish") {
    setConfirm(null);
    setUsageWarning(null);

    if (demo) {
      setMessage("Preview only mode: connect Supabase to save and publish.");
      setMessageType("info");
      return;
    }

    // Required image accessibility checks
    if (action === "publish") {
      if (content.image && !content.imageAlt) {
        setMessage("Add descriptive alternative text for the primary image before publishing.");
        setMessageType("error");
        return;
      }
      if (content.brandLogo && !content.brandLogoAlt) {
        setMessage("Add alternative text for the brand logo before publishing.");
        setMessageType("error");
        return;
      }
      if (content.gallery?.some((g) => g.image && !g.alt)) {
        setMessage("Every gallery image requires alternative text before publishing.");
        setMessageType("error");
        return;
      }
    }

    const checked = contentSchema.safeParse(content);
    if (!checked.success) {
      setMessage(checked.error.issues[0]?.message || "Validation failed.");
      setMessageType("error");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ignore-usage": "true",
        },
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
      setMessageType("success");
      setMessage(
        action === "publish"
          ? "Published. Live website updated."
          : action === "unpublish"
            ? "Unpublished. Content restored to private draft."
            : "Draft saved. Live website is unchanged.",
      );

      if (!current) {
        router.replace(`/admin/${section}/${data.id}`);
      }
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to save.");
      setMessageType("error");
    } finally {
      setBusy(false);
    }
  }

  async function deleteCurrentRecord() {
    if (!current?.id) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/content?id=${current.id}&force=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/admin/${section}`);
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to delete record.");
      setMessageType("error");
      setConfirm(null);
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
      setMessageType("error");
    }
  }

  async function upload(file: File | undefined, targetField: "image" | "brandLogo" = "image") {
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const r = await fetch("/api/admin/media", { method: "POST", body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      field(targetField, d.url);
      setMessage("Image uploaded. Remember to provide alternative text.");
      setMessageType("success");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed.");
      setMessageType("error");
    } finally {
      setBusy(false);
    }
  }

  const textInput = (
    key: keyof Content,
    label: string,
    textarea = false,
    hint = "",
  ) => (
    <label key={key}>
      {label}
      {textarea ? (
        <textarea
          rows={key === "body" ? 6 : 3}
          value={String(content[key] ?? "")}
          onChange={(e) => field(key, e.target.value as never)}
        />
      ) : (
        <input
          value={String(content[key] ?? "")}
          onChange={(e) => field(key, e.target.value as never)}
        />
      )}
      {hint && <small>{hint}</small>}
    </label>
  );

  const ownedBrands = allRecords.filter((r) => r.kind === "brand");
  const availableProducts = allRecords.filter((r) => r.kind === "product");
  const availableCollections = allRecords.filter((r) => r.kind === "collection");
  const siteSettings = allRecords.find((r) => r.kind === "settings")?.draft || content;

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
              "Configure specifications, sections, and publication status."}
          </p>
        </div>

        <div className="editor-actions">
          <button
            className={`button ${preview ? "dark" : "outline"}`}
            type="button"
            onClick={() => setPreview(!preview)}
          >
            <Eye size={16} />
            {preview ? "Back to editor" : "Preview draft"}
          </button>
          <button
            disabled={busy || demo}
            className="button outline"
            type="button"
            onClick={() => save("save")}
          >
            <Save size={16} />
            Save draft
          </button>
          <button
            disabled={busy || demo}
            className="button dark"
            type="button"
            onClick={() => setConfirm("publish")}
          >
            <Globe size={16} />
            Publish live
          </button>
        </div>
      </div>

      {message && (
        <div className={`editor-message ${messageType}`} role="status">
          {message}
          {dirty && <span className="muted"> · Unsaved edits present</span>}
        </div>
      )}

      {/* Confirmation and Reference Warning Modal / Panel */}
      {confirm && (
        <div className="confirm-panel" role="alert">
          <div className="confirm-header">
            <AlertTriangle size={20} className={usageWarning ? "text-danger" : ""} />
            <strong>
              {confirm === "publish"
                ? "Publish changes to the live website?"
                : confirm === "unpublish"
                  ? "Unpublish this content from the live website?"
                  : "Delete this record completely?"}
            </strong>
          </div>

          {usageWarning && usageWarning.length > 0 && (
            <div className="usage-warning-box">
              <p>
                <strong>Warning:</strong> This item is referenced in {usageWarning.length} place(s):
              </p>
              <ul>
                {usageWarning.map((u, i) => (
                  <li key={i}>
                    <strong>{u.title}</strong> ({u.kind}) — {u.context}
                  </li>
                ))}
              </ul>
              <small>Unpublishing or deleting this item will hide it from dependent carousels and collections.</small>
            </div>
          )}

          <p>
            {confirm === "publish"
              ? "Verify company details, photography, and links before proceeding."
              : confirm === "unpublish"
                ? "The live website will no longer expose this item. Draft and revisions remain intact."
                : "This cannot be undone. Draft and history will be permanently deleted."}
          </p>

          <div className="confirm-buttons">
            <button
              type="button"
              className="button dark"
              onClick={() => {
                if (confirm === "delete") deleteCurrentRecord();
                else save(confirm);
              }}
            >
              Confirm {confirm}
            </button>
            <button
              type="button"
              className="button outline"
              onClick={() => {
                setConfirm(null);
                setUsageWarning(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ACCURATE DRAFT PREVIEW MODE */}
      {preview ? (
        <div className="editor-live-preview-wrap">
          <div className="preview-toolbar-sticky">
            <div className="preview-badge-status">
              <span className="pulsing-dot" />
              <strong>UNSAVED DRAFT PREVIEW</strong>
              <small>Rendered with live layout components</small>
            </div>

            <div className="viewport-toggle-buttons">
              <button
                type="button"
                className={`button small ${previewViewport === "desktop" ? "dark" : "outline"}`}
                onClick={() => setPreviewViewport("desktop")}
              >
                <Monitor size={15} /> 1440px Desktop
              </button>
              <button
                type="button"
                className={`button small ${previewViewport === "tablet" ? "dark" : "outline"}`}
                onClick={() => setPreviewViewport("tablet")}
              >
                <Tablet size={15} /> 768px Tablet
              </button>
              <button
                type="button"
                className={`button small ${previewViewport === "mobile" ? "dark" : "outline"}`}
                onClick={() => setPreviewViewport("mobile")}
              >
                <Smartphone size={15} /> 390px Mobile
              </button>
            </div>

            <button
              type="button"
              className="button small outline"
              onClick={() => setPreview(false)}
            >
              Close preview
            </button>
          </div>

          <div className={`preview-viewport-frame viewport-${previewViewport}`}>
            <PublicShell
              settings={siteSettings}
              records={allRecords}
              previewBannerText="Draft preview mode · Unsaved changes visible"
            >
              {kind === "page" ? (
                <div className="preview-page-canvas">
                  <SectionRenderer
                    sections={content.sections || []}
                    allRecords={allRecords}
                    settings={siteSettings}
                    previewMode={true}
                  />
                </div>
              ) : kind === "brand" ? (
                <div className="preview-brand-canvas">
                  <section className="brand-detail">
                    <div>
                      <span className="eyebrow">OUR BRAND PORTFOLIO</span>
                      <h1>{content.title}</h1>
                      <p className="large-copy">{content.summary}</p>
                      <div className="prose">
                        <p>{content.body}</p>
                      </div>
                    </div>
                    {content.image && <img src={content.image} alt={content.imageAlt} />}
                  </section>
                </div>
              ) : (
                <div className="preview-general-canvas">
                  <section className="page-intro">
                    <span className="eyebrow">{content.eyebrow || kind.toUpperCase()}</span>
                    <h1>{content.title}</h1>
                    <p>{content.summary}</p>
                  </section>
                  <div className="section">
                    <div className="prose">
                      <p>{content.body}</p>
                    </div>
                  </div>
                </div>
              )}
            </PublicShell>
          </div>
        </div>
      ) : (
        /* STANDARD EDITOR LAYOUT */
        <div className="editor-grid">
          <div className="editor-main-column">
            {/* Core Metadata Panel */}
            <section className="panel form-panel">
              <div className="panel-heading">
                <h2>{kind === "settings" ? "Company Information" : "Core Content"}</h2>
                {current && <StatusBadge record={current} />}
              </div>

              {textInput("title", kind === "settings" ? "Company name" : "Title / Name")}

              {kind !== "settings" && (
                <label>
                  URL identifier / slug
                  <input
                    value={slug}
                    disabled={!!current && ["home", "about", "products", "brands", "network", "contact", "privacy", "capabilities"].includes(current.slug)}
                    placeholder="your-page-slug"
                    onChange={(e) => {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                      setDirty(true);
                    }}
                  />
                  <small>
                    {current && ["home", "about", "products", "brands", "network", "contact", "privacy", "capabilities"].includes(current.slug)
                      ? "Core system slugs are preserved to maintain routing stability."
                      : "Lowercase letters, numbers, and hyphens."}
                  </small>
                </label>
              )}

              {kind === "page" && (
                <label>
                  Page template layout
                  <select
                    value={content.template}
                    onChange={(e) => field("template", e.target.value as PageTemplate)}
                  >
                    {Object.entries(pageTemplateLabels).map(([tmpl, label]) => (
                      <option key={tmpl} value={tmpl}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <small>Select the structural archetype that governs sections for this page.</small>
                </label>
              )}

              {textInput("eyebrow", "Eyebrow tag / small header")}
              {textInput("summary", "Short summary / positioning statement", true)}
              {textInput("body", "Description / body text", true, "Separate paragraphs with a blank line.")}

              {/* Product Specific Technical Fields */}
              {kind === "product" && (
                <div className="product-editor-subfields">
                  <div className="form-grid">
                    {textInput("refCode", "Style code / SKU reference", false, "e.g. MKW-MC-01")}
                    {textInput("category", "Product category", false, "e.g. Sweaters, Cardigans")}
                  </div>

                  <label>
                    Brand affiliation
                    <select
                      value={content.brandId || ""}
                      onChange={(e) => field("brandId", e.target.value)}
                    >
                      <option value="">No brand assigned (General Mack collection)</option>
                      {ownedBrands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.draft.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  {textInput("materials", "Materials and fiber composition", true, "e.g. 100% Extrafine Australian Merino Wool (19.5 micron)")}

                  <div className="form-grid">
                    {textInput("moq", "Minimum order quantity (MOQ)", false, "e.g. 300 pieces per colorway")}
                    {textInput("leadTime", "Production lead time", false, "e.g. 4 – 6 weeks")}
                  </div>

                  <div className="form-grid">
                    {textInput("intendedUse", "Intended use / market", false, "e.g. Luxury retail, private-label")}
                    {textInput("customization", "Customization capabilities", false, "e.g. Custom yarn colors and branded hardware")}
                  </div>

                  {/* Specifications Key-Value Editor */}
                  <ProductSpecificationsEditor
                    specifications={content.specifications || []}
                    onChange={(specs) => field("specifications", specs)}
                  />
                </div>
              )}

              {/* Brand Specific Fields */}
              {kind === "brand" && (
                <div className="brand-editor-subfields">
                  <div className="form-grid">
                    {textInput("website", "Official brand website", false, "Complete https:// URL")}
                    {textInput("store", "Online store URL", false, "Leave blank if store is unlaunched")}
                  </div>

                  <label>
                    Featured collection spotlight
                    <select
                      value={content.featuredCollectionId || ""}
                      onChange={(e) => field("featuredCollectionId", e.target.value)}
                    >
                      <option value="">None selected</option>
                      {availableCollections.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.draft.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Craftsmanship Section */}
                  <fieldset className="sub-editor-panel">
                    <legend>Craftsmanship & Materials Section</legend>
                    {textInput("craftsmanshipTitle", "Craftsmanship heading")}
                    {textInput("craftsmanshipSummary", "Craftsmanship introduction", true)}
                    {textInput("craftsmanshipBody", "Detailed craftsmanship story", true)}
                  </fieldset>

                  {/* Selected Products Carousel Selector */}
                  <BrandSelectedProductsEditor
                    selectedIds={content.selectedProductIds || []}
                    availableProducts={availableProducts}
                    onChange={(ids) => field("selectedProductIds", ids)}
                  />
                </div>
              )}

              {/* Collection Specific Fields */}
              {kind === "collection" && (
                <div className="collection-editor-subfields">
                  <label>
                    Associated owned brand
                    <select
                      value={content.brandId || ""}
                      onChange={(e) => field("brandId", e.target.value)}
                    >
                      <option value="">Select owned brand…</option>
                      {ownedBrands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.draft.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  {textInput("season", "Season / year label", false, "e.g. Autumn / Winter 2026")}

                  {/* Collection Products Selector */}
                  <CollectionProductsEditor
                    productIds={content.productIds || []}
                    availableProducts={availableProducts}
                    onChange={(ids) => field("productIds", ids)}
                  />
                </div>
              )}

              {/* Capability Specific Fields */}
              {kind === "capability" && (
                <div className="capability-editor-subfields">
                  {textInput("category", "Capability category", false, "e.g. Knitting Technology, Raw Materials")}
                  <CapabilityProcessStepsEditor
                    steps={content.processSteps || []}
                    onChange={(steps) => field("processSteps", steps)}
                  />
                  <div className="form-grid">
                    {textInput("ctaLabel", "Call-to-action button label")}
                    {textInput("ctaHref", "Call-to-action link", false, "e.g. /contact?type=Sourcing%20%26%20export")}
                  </div>
                </div>
              )}

              {/* Network Specific Fields */}
              {kind === "network" && (
                <div className="network-editor-subfields">
                  <label>
                    Relationship classification
                    <select
                      value={content.relationship}
                      onChange={(e) => field("relationship", e.target.value as Content["relationship"])}
                    >
                      {Object.entries(relationshipLabels)
                        .filter(([k]) => k !== "owned")
                        .map(([k, lbl]) => (
                          <option key={k} value={k}>
                            {lbl}
                          </option>
                        ))}
                    </select>
                  </label>
                  {textInput("website", "Official partner website", false, "Complete https:// URL")}
                </div>
              )}

              {/* Settings Specific Fields */}
              {kind === "settings" && (
                <div className="settings-editor-subfields">
                  <div className="form-grid">
                    {textInput("email", "Primary contact email")}
                    {textInput("phone", "Telephone number")}
                  </div>
                  {textInput("address", "Company headquarters address", true)}
                  {textInput("footer", "Footer tagline description")}
                  {textInput("footerNote", "Footer copyright / closing line")}
                  {textInput("responsePromise", "Inquiry response promise", false, "Only displayed if configured")}
                  <div className="form-grid">
                    {textInput("linkedin", "LinkedIn company profile URL")}
                    {textInput("facebook", "Facebook page URL")}
                  </div>

                  {/* Locations Manager */}
                  <SettingsLocationsEditor
                    locations={content.locations || []}
                    onChange={(locs) => field("locations", locs)}
                  />

                  {/* Header & Footer Navigation Editors */}
                  <NavigationEditor
                    title="Header Navigation Menu"
                    navItems={content.headerNav || []}
                    allRecords={allRecords}
                    onChange={(items) => field("headerNav", items)}
                  />
                  <NavigationEditor
                    title="Footer Navigation Menu"
                    navItems={content.footerNav || []}
                    allRecords={allRecords}
                    onChange={(items) => field("footerNav", items)}
                  />
                </div>
              )}
            </section>

            {/* SECTION ENGINE (Available for pages) */}
            {kind === "page" && (
              <SectionEditor
                sections={content.sections || []}
                template={content.template}
                allRecords={allRecords}
                onChange={(sections) => field("sections", sections)}
              />
            )}

            {/* Media & Photography Panel */}
            <section className="panel form-panel">
              <h2>{kind === "brand" ? "Hero & Brand Imagery" : "Primary Image"}</h2>

              {kind === "brand" && (
                <div className="brand-logo-field-wrap">
                  <h4>Brand Logo (Stored separately from hero)</h4>
                  {content.brandLogo && (
                    <img className="editor-thumb-preview" src={content.brandLogo} alt={content.brandLogoAlt} />
                  )}
                  <div style={{ display: "flex", gap: "10px", marginTop: "8px", marginBottom: "14px" }}>
                    <button
                      type="button"
                      className="button outline small"
                      onClick={() => openMediaPicker("brandLogo")}
                      disabled={busy}
                    >
                      <ImageIcon size={14} /> Choose Logo from Media Library
                    </button>
                  </div>
                  <div className="form-grid">
                    <label>
                      Logo image URL
                      <input
                        value={content.brandLogo}
                        onChange={(e) => field("brandLogo", e.target.value)}
                        placeholder="Upload or paste image URL"
                      />
                    </label>
                    <label>
                      Logo alternative text
                      <input
                        value={content.brandLogoAlt}
                        onChange={(e) => field("brandLogoAlt", e.target.value)}
                        placeholder="e.g. Brand monogram logo"
                      />
                    </label>
                  </div>
                </div>
              )}

              {content.image && (
                <img
                  className="editor-image"
                  src={content.image}
                  alt={content.imageAlt || "Selected image preview"}
                />
              )}

              <div className="media-picker-trigger-row" style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "15px" }}>
                <button
                  type="button"
                  className="button dark small"
                  onClick={() => openMediaPicker("image")}
                  disabled={busy}
                >
                  <ImageIcon size={16} /> Choose from Media Library
                </button>
                <label className="upload-button" style={{ margin: 0 }}>
                  <Upload size={16} />
                  Quick upload
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={demo || busy}
                    onChange={(e) => upload(e.target.files?.[0], "image")}
                  />
                </label>
              </div>

              <div className="form-grid">
                {textInput("image", "Primary image URL", false, "JPG, PNG, or WebP")}
                {textInput("imageAlt", "Alternative text (Required for publishing)", false, "Describe the photograph for screen readers")}
              </div>

              {/* Gallery Manager for Products and Brands */}
              {["product", "brand"].includes(kind) && (
                <GalleryManager
                  gallery={content.gallery || []}
                  onChange={(gallery) => field("gallery", gallery)}
                  onOpenPicker={(idx) => openMediaPicker({ type: "gallery", index: idx })}
                />
              )}
            </section>

            {/* SEO Metadata Panel */}
            <section className="panel form-panel">
              <h2>Search Engine Optimization (SEO)</h2>
              {textInput("seoTitle", "SEO meta title", false, "Recommended: 50–60 characters")}
              {textInput("seoDescription", "SEO meta description", true, "Recommended: 120–160 characters")}
            </section>
          </div>

          {/* Sidebar Settings Column */}
          <aside className="editor-sidebar-column">
            <section className="panel form-panel">
              <h2>Publication Status</h2>
              <div className="status-overview-card">
                <StatusBadge record={current || { published: null, draft: content } as never} />
                {current?.published_at && (
                  <small className="muted">
                    Published: {new Date(current.published_at).toLocaleDateString()}
                  </small>
                )}
              </div>

              {["brand", "product"].includes(kind) && (
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={content.featured}
                    onChange={(e) => field("featured", e.target.checked)}
                  />
                  Feature prominently on homepage
                </label>
              )}

              <label>
                Display ordering index
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={content.order}
                  onChange={(e) => field("order", Number(e.target.value))}
                />
                <small>Lower numbers display first in catalogues and lists.</small>
              </label>

              {current?.published && (
                <button
                  type="button"
                  disabled={demo || busy}
                  className="text-danger"
                  onClick={() => checkUsageBeforeAction("unpublish")}
                >
                  Unpublish this record
                </button>
              )}

              {current && !["home", "about", "products", "brands", "network", "contact", "privacy", "capabilities"].includes(current.slug) && (
                <button
                  type="button"
                  disabled={demo || busy}
                  className="text-danger"
                  style={{ marginTop: 8 }}
                  onClick={() => checkUsageBeforeAction("delete")}
                >
                  Delete this entry
                </button>
              )}
            </section>

            {/* Revision History Panel */}
            <section className="panel form-panel">
              <h2>
                <History size={16} /> Revision History
              </h2>
              <p className="muted">
                Restore a saved revision into the editor. Restoring does not alter the live published version until you explicitly publish.
              </p>
              <button
                type="button"
                disabled={!current || busy}
                className="button outline small"
                onClick={revisions}
              >
                View previous revisions
              </button>

              {history && (
                <div className="revision-list">
                  {history.length === 0 ? (
                    <small className="muted">No earlier revisions recorded.</small>
                  ) : (
                    history.map((h) => (
                      <button
                        type="button"
                        key={h.id}
                        onClick={() => {
                          setContent(normalizeContent(h.snapshot, kind, slug));
                          setDirty(true);
                          setMessage("Historical version restored into draft. Save or publish to keep.");
                          setMessageType("info");
                        }}
                      >
                        <History size={14} />
                        {new Date(h.created_at).toLocaleString()}
                      </button>
                    ))
                  )}
                </div>
              )}
            </section>
          </aside>
        </div>
      )}

      <MediaPicker
        isOpen={mediaPickerOpen}
        onClose={() => {
          setMediaPickerOpen(false);
          setMediaPickerTarget(null);
        }}
        onSelect={handleMediaSelect}
        demo={demo}
      />
    </>
  );
}

/**
 * Product Technical Specifications Sub-Editor
 */
function ProductSpecificationsEditor({
  specifications,
  onChange,
}: {
  specifications: Specification[];
  onChange: (specs: Specification[]) => void;
}) {
  const addSpec = () => {
    onChange([...specifications, { label: "", value: "" }]);
  };

  const updateSpec = (idx: number, field: "label" | "value", val: string) => {
    const updated = specifications.map((s, i) => (i === idx ? { ...s, [field]: val } : s));
    onChange(updated);
  };

  const removeSpec = (idx: number) => {
    onChange(specifications.filter((_, i) => i !== idx));
  };

  return (
    <div className="sub-editor-panel">
      <h4>Technical Specifications ({specifications.length})</h4>
      {specifications.map((s, idx) => (
        <div className="sub-editor-row" key={idx}>
          <input
            style={{ width: "40%" }}
            placeholder="Specification (e.g. Gauge)"
            value={s.label}
            onChange={(e) => updateSpec(idx, "label", e.target.value)}
          />
          <input
            style={{ width: "50%" }}
            placeholder="Value (e.g. 14-gauge)"
            value={s.value}
            onChange={(e) => updateSpec(idx, "value", e.target.value)}
          />
          <button
            type="button"
            className="icon-action-btn text-danger"
            onClick={() => removeSpec(idx)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button type="button" className="button outline small" onClick={addSpec}>
        <Plus size={14} /> Add specification
      </button>
    </div>
  );
}

/**
 * Brand Selected Products Carousel Selector
 */
function BrandSelectedProductsEditor({
  selectedIds,
  availableProducts,
  onChange,
}: {
  selectedIds: string[];
  availableProducts: RecordItem[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id];
    onChange(next);
  };

  return (
    <div className="sub-editor-panel">
      <h4>Selected Product Carousel ({selectedIds.length})</h4>
      <p className="muted">
        Select products associated with this brand to feature in its dedicated product carousel.
      </p>
      <div className="checkbox-scroll-list">
        {availableProducts.map((p) => {
          const isChecked = selectedIds.includes(p.id);
          return (
            <label key={p.id} className="checkbox-item-row">
              <input type="checkbox" checked={isChecked} onChange={() => toggle(p.id)} />
              <span>
                <strong>{p.draft.title}</strong>
                <small className="muted">/{p.slug} · {p.draft.category || "Product"}</small>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Collection Products Selector
 */
function CollectionProductsEditor({
  productIds,
  availableProducts,
  onChange,
}: {
  productIds: string[];
  availableProducts: RecordItem[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) => {
    const next = productIds.includes(id)
      ? productIds.filter((item) => item !== id)
      : [...productIds, id];
    onChange(next);
  };

  return (
    <div className="sub-editor-panel">
      <h4>Ordered Collection Products ({productIds.length})</h4>
      <div className="checkbox-scroll-list">
        {availableProducts.map((p) => {
          const isChecked = productIds.includes(p.id);
          return (
            <label key={p.id} className="checkbox-item-row">
              <input type="checkbox" checked={isChecked} onChange={() => toggle(p.id)} />
              <span>
                <strong>{p.draft.title}</strong>
                <small className="muted">/{p.slug}</small>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Capability Process Steps Editor
 */
function CapabilityProcessStepsEditor({
  steps,
  onChange,
}: {
  steps: ProcessStep[];
  onChange: (steps: ProcessStep[]) => void;
}) {
  const addStep = () => {
    onChange([
      ...steps,
      { stepNumber: steps.length + 1, title: "New Step", description: "" },
    ]);
  };

  const update = (idx: number, field: "title" | "description", val: string) => {
    const updated = steps.map((s, i) => (i === idx ? { ...s, [field]: val } : s));
    onChange(updated);
  };

  const remove = (idx: number) => {
    const filtered = steps.filter((_, i) => i !== idx);
    onChange(filtered.map((s, i) => ({ ...s, stepNumber: i + 1 })));
  };

  return (
    <div className="sub-editor-panel">
      <h4>Process Steps ({steps.length})</h4>
      {steps.map((st, i) => (
        <div className="sub-editor-card" key={i}>
          <div className="sub-editor-row">
            <span className="step-tag">Step {st.stepNumber}</span>
            <input
              style={{ width: "75%" }}
              placeholder="Step title"
              value={st.title}
              onChange={(e) => update(i, "title", e.target.value)}
            />
            <button
              type="button"
              className="icon-action-btn text-danger"
              onClick={() => remove(i)}
            >
              <Trash2 size={15} />
            </button>
          </div>
          <textarea
            rows={2}
            placeholder="Step description"
            value={st.description}
            onChange={(e) => update(i, "description", e.target.value)}
          />
        </div>
      ))}
      <button type="button" className="button outline small" onClick={addStep}>
        <Plus size={14} /> Add process step
      </button>
    </div>
  );
}

/**
 * Image Gallery Manager
 */
function GalleryManager({
  gallery,
  onChange,
  onOpenPicker,
}: {
  gallery: GalleryItem[];
  onChange: (g: GalleryItem[]) => void;
  onOpenPicker?: (index: number) => void;
}) {
  const add = () => {
    onChange([...gallery, { id: crypto.randomUUID(), image: "", alt: "", caption: "" }]);
  };

  const update = (idx: number, field: "image" | "alt" | "caption", val: string) => {
    const updated = gallery.map((g, i) => (i === idx ? { ...g, [field]: val } : g));
    onChange(updated);
  };

  const remove = (idx: number) => {
    onChange(gallery.filter((_, i) => i !== idx));
  };

  return (
    <div className="sub-editor-panel">
      <h4>Image Gallery & Lookbook ({gallery.length})</h4>
      {gallery.map((g, i) => (
        <div className="sub-editor-card" key={g.id || i}>
          <div className="sub-editor-row" style={{ alignItems: "center" }}>
            {g.image && (
              <img
                src={g.image}
                alt=""
                style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "3px" }}
              />
            )}
            <input
              style={{ flex: "1 1 35%" }}
              placeholder="Image URL"
              value={g.image}
              onChange={(e) => update(i, "image", e.target.value)}
            />
            {onOpenPicker && (
              <button
                type="button"
                className="button outline small"
                style={{ padding: "6px 9px", fontSize: "12px", whiteSpace: "nowrap" }}
                onClick={() => onOpenPicker(i)}
                title="Select photograph from media library"
              >
                <ImageIcon size={13} /> Library
              </button>
            )}
            <input
              style={{ flex: "1 1 35%" }}
              placeholder="Alternative text (Required)"
              value={g.alt}
              onChange={(e) => update(i, "alt", e.target.value)}
            />
            <button
              type="button"
              className="icon-action-btn text-danger"
              onClick={() => remove(i)}
            >
              <Trash2 size={15} />
            </button>
          </div>
          <input
            placeholder="Caption (optional)"
            value={g.caption}
            onChange={(e) => update(i, "caption", e.target.value)}
          />
        </div>
      ))}
      <button type="button" className="button outline small" onClick={add}>
        <Plus size={14} /> Add gallery image
      </button>
    </div>
  );
}

/**
 * Settings Multiple Locations Manager
 */
function SettingsLocationsEditor({
  locations,
  onChange,
}: {
  locations: Location[];
  onChange: (locs: Location[]) => void;
}) {
  const add = () => {
    onChange([
      ...locations,
      {
        id: crypto.randomUUID(),
        name: "New Facility",
        address: "",
        phone: "",
        email: "",
        hours: "",
        directionsUrl: "",
        isHeadquarters: false,
      },
    ]);
  };

  const update = (idx: number, field: keyof Location, val: any) => {
    const updated = locations.map((loc, i) => (i === idx ? { ...loc, [field]: val } : loc));
    onChange(updated);
  };

  const remove = (idx: number) => {
    onChange(locations.filter((_, i) => i !== idx));
  };

  return (
    <div className="sub-editor-panel">
      <h4>Office & Facility Locations ({locations.length})</h4>
      {locations.map((loc, idx) => (
        <div className="sub-editor-card" key={loc.id || idx}>
          <div className="sub-editor-row">
            <input
              style={{ width: "55%" }}
              placeholder="Facility name"
              value={loc.name}
              onChange={(e) => update(idx, "name", e.target.value)}
            />
            <label className="checkbox" style={{ margin: 0 }}>
              <input
                type="checkbox"
                checked={loc.isHeadquarters}
                onChange={(e) => update(idx, "isHeadquarters", e.target.checked)}
              />
              Headquarters
            </label>
            <button
              type="button"
              className="icon-action-btn text-danger"
              onClick={() => remove(idx)}
            >
              <Trash2 size={15} />
            </button>
          </div>
          <textarea
            rows={2}
            placeholder="Full physical address"
            value={loc.address}
            onChange={(e) => update(idx, "address", e.target.value)}
          />
          <div className="sub-editor-row">
            <input
              placeholder="Telephone"
              value={loc.phone}
              onChange={(e) => update(idx, "phone", e.target.value)}
            />
            <input
              placeholder="Email"
              value={loc.email}
              onChange={(e) => update(idx, "email", e.target.value)}
            />
            <input
              placeholder="Hours (e.g. Mon-Fri 9-6)"
              value={loc.hours}
              onChange={(e) => update(idx, "hours", e.target.value)}
            />
          </div>
          <input
            placeholder="Google Maps / Directions complete https:// URL"
            value={loc.directionsUrl}
            onChange={(e) => update(idx, "directionsUrl", e.target.value)}
          />
        </div>
      ))}
      <button type="button" className="button outline small" onClick={add}>
        <Plus size={14} /> Add facility location
      </button>
    </div>
  );
}

/**
 * Header & Footer Navigation Menu Editor
 */
function NavigationEditor({
  title,
  navItems,
  allRecords,
  onChange,
}: {
  title: string;
  navItems: NavItem[];
  allRecords: RecordItem[];
  onChange: (items: NavItem[]) => void;
}) {
  const publishedPages = allRecords.filter((r) => r.kind === "page");

  const add = () => {
    onChange([
      ...navItems,
      {
        id: crypto.randomUUID(),
        label: "New link",
        href: "/",
        isExternal: false,
        visible: true,
        order: navItems.length + 1,
      },
    ]);
  };

  const update = (idx: number, field: keyof NavItem, val: any) => {
    const updated = navItems.map((item, i) => (i === idx ? { ...item, [field]: val } : item));
    onChange(updated);
  };

  const remove = (idx: number) => {
    onChange(navItems.filter((_, i) => i !== idx));
  };

  return (
    <div className="sub-editor-panel">
      <h4>{title} ({navItems.length})</h4>
      {navItems.map((item, idx) => {
        const isInternalUnpublished =
          !item.isExternal &&
          item.href !== "/" &&
          !publishedPages.some(
            (p) => `/${p.slug}` === item.href && p.published !== null,
          );

        return (
          <div className="sub-editor-card" key={item.id || idx}>
            <div className="sub-editor-row">
              <input
                style={{ width: "30%" }}
                placeholder="Link label"
                value={item.label}
                onChange={(e) => update(idx, "label", e.target.value)}
              />
              <input
                style={{ width: "40%" }}
                placeholder="/path or https://..."
                value={item.href}
                onChange={(e) => update(idx, "href", e.target.value)}
              />
              <label className="checkbox" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={item.isExternal}
                  onChange={(e) => update(idx, "isExternal", e.target.checked)}
                />
                External
              </label>
              <label className="checkbox" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={item.visible}
                  onChange={(e) => update(idx, "visible", e.target.checked)}
                />
                Visible
              </label>
              <button
                type="button"
                className="icon-action-btn text-danger"
                onClick={() => remove(idx)}
              >
                <Trash2 size={15} />
              </button>
            </div>
            {isInternalUnpublished && (
              <small className="text-warning">
                Warning: The destination "{item.href}" is currently unpublished or does not exist.
              </small>
            )}
          </div>
        );
      })}
      <button type="button" className="button outline small" onClick={add}>
        <Plus size={14} /> Add navigation link
      </button>
    </div>
  );
}
