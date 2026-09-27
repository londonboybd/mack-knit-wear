"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  HelpCircle,
  FileText,
  MapPin,
  ListOrdered,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import {
  sectionTypes,
  sectionTypeLabels,
  type Section,
  type SectionType,
  type PageTemplate,
  type RecordItem,
} from "@/lib/schema";
import { MediaPicker } from "./media-picker";

/**
 * Maps which sections are permitted or recommended for each page template.
 */
const templateAllowedSections: Record<PageTemplate, SectionType[]> = {
  company: [
    "editorial_hero",
    "image_text",
    "rich_text",
    "brand_showcase",
    "product_showcase",
    "timeline",
    "company_facts",
    "gallery",
    "faqs",
    "locations",
    "contact_banner",
  ],
  brand_directory: [
    "editorial_hero",
    "brand_showcase",
    "image_text",
    "rich_text",
    "contact_banner",
  ],
  brand_detail: [
    "editorial_hero",
    "image_text",
    "rich_text",
    "collection_intro",
    "product_showcase",
    "gallery",
    "contact_banner",
  ],
  product_directory: [
    "editorial_hero",
    "product_showcase",
    "image_text",
    "rich_text",
    "contact_banner",
  ],
  product_detail: [
    "product_showcase",
    "image_text",
    "rich_text",
    "gallery",
    "faqs",
    "contact_banner",
  ],
  capabilities: [
    "editorial_hero",
    "capabilities_process",
    "image_text",
    "rich_text",
    "company_facts",
    "document_links",
    "gallery",
    "faqs",
    "contact_banner",
  ],
  network: [
    "editorial_hero",
    "image_text",
    "rich_text",
    "locations",
    "contact_banner",
  ],
  contact: [
    "editorial_hero",
    "locations",
    "faqs",
    "rich_text",
  ],
  policy: [
    "editorial_hero",
    "rich_text",
    "document_links",
  ],
  editorial: [...sectionTypes],
};

export function SectionEditor({
  sections,
  template = "editorial",
  allRecords = [],
  onChange,
}: {
  sections: Section[];
  template?: PageTemplate;
  allRecords?: RecordItem[];
  onChange: (updated: Section[]) => void;
}) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    sections[0]?.id || null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  const allowedTypes = templateAllowedSections[template] || sectionTypes;

  const addSection = (type: SectionType) => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      type,
      enabled: true,
      order: sections.length,
      title: `New ${sectionTypeLabels[type]}`,
      eyebrow: "",
      content: "",
      image: "",
      imageAlt: "",
      ctaLabel: "",
      ctaHref: "",
      data: getDefaultSectionData(type),
    };

    const updated = [...sections, newSection];
    onChange(updated);
    setActiveSectionId(newSection.id);
  };

  const removeSection = (id: string) => {
    const filtered = sections.filter((s) => s.id !== id);
    const reordered = filtered.map((s, idx) => ({ ...s, order: idx }));
    onChange(reordered);
    if (activeSectionId === id) {
      setActiveSectionId(reordered[0]?.id || null);
    }
  };

  const duplicateSection = (sec: Section) => {
    const index = sections.findIndex((s) => s.id === sec.id);
    const clone: Section = {
      ...JSON.parse(JSON.stringify(sec)),
      id: crypto.randomUUID(),
      title: `${sec.title} (Copy)`,
      order: index + 1,
    };

    const nextSections = [...sections];
    nextSections.splice(index + 1, 0, clone);
    const reordered = nextSections.map((s, idx) => ({ ...s, order: idx }));
    onChange(reordered);
    setActiveSectionId(clone.id);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    )
      return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const finalized = reordered.map((s, idx) => ({ ...s, order: idx }));
    onChange(finalized);
  };

  const toggleVisibility = (id: string) => {
    const updated = sections.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s,
    );
    onChange(updated);
  };

  const updateSectionField = <K extends keyof Section>(
    id: string,
    key: K,
    val: Section[K],
  ) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, [key]: val } : s));
    onChange(updated);
  };

  const activeSection = sections.find((s) => s.id === activeSectionId);

  return (
    <div className="section-editor-container">
      <div className="section-editor-header">
        <div>
          <h3>Page Layout & Reusable Sections</h3>
          <p className="muted">
            Manage section order, toggle visibility, and configure custom content blocks.
          </p>
        </div>

        <div className="add-section-dropdown-wrap">
          <label className="button outline small">
            <Plus size={16} />
            Add section
            <select
              className="sr-only-dropdown"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  addSection(e.target.value as SectionType);
                  e.target.value = "";
                }
              }}
            >
              <option value="">Choose section type…</option>
              {allowedTypes.map((type) => (
                <option key={type} value={type}>
                  {sectionTypeLabels[type]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="section-editor-layout">
        {/* Section List / Sidebar */}
        <aside className="section-manager-list" aria-label="Section hierarchy">
          {sections.length === 0 ? (
            <div className="empty-subpanel">
              <Layers size={24} />
              <p>No sections added yet.</p>
              <small>Click "Add section" above to begin composing this page.</small>
            </div>
          ) : (
            sections.map((sec, idx) => {
              const isSelected = sec.id === activeSectionId;
              return (
                <div
                  key={sec.id}
                  className={`section-item-pill ${isSelected ? "selected" : ""} ${!sec.enabled ? "disabled" : ""}`}
                >
                  <button
                    type="button"
                    className="section-title-btn"
                    onClick={() => setActiveSectionId(sec.id)}
                  >
                    <span className="section-num">{idx + 1}</span>
                    <span className="section-name">
                      <strong>{sec.title || "Untitled section"}</strong>
                      <small>{sectionTypeLabels[sec.type]}</small>
                    </span>
                  </button>

                  <div className="section-actions-inline">
                    <button
                      type="button"
                      className="icon-action-btn"
                      onClick={() => toggleVisibility(sec.id)}
                      title={sec.enabled ? "Hide section" : "Show section"}
                      aria-label={sec.enabled ? "Hide section" : "Show section"}
                    >
                      {sec.enabled ? <Eye size={15} /> : <EyeOff size={15} className="muted" />}
                    </button>
                    <button
                      type="button"
                      disabled={idx === 0}
                      className="icon-action-btn"
                      onClick={() => moveSection(idx, "up")}
                      title="Move section up"
                      aria-label="Move section up"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      className="icon-action-btn"
                      onClick={() => moveSection(idx, "down")}
                      title="Move section down"
                      aria-label="Move section down"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-action-btn"
                      onClick={() => duplicateSection(sec)}
                      title="Duplicate section"
                      aria-label="Duplicate section"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-action-btn text-danger"
                      onClick={() => removeSection(sec.id)}
                      title="Delete section"
                      aria-label="Delete section"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </aside>

        {/* Selected Section Detail Editor */}
        <main className="section-detail-pane">
          {activeSection ? (
            <div className="panel form-panel active-section-form">
              <div className="panel-heading">
                <div>
                  <span className="badge draft">{sectionTypeLabels[activeSection.type]}</span>
                  <h2>{activeSection.title || "Section settings"}</h2>
                </div>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={activeSection.enabled}
                    onChange={(e) => updateSectionField(activeSection.id, "enabled", e.target.checked)}
                  />
                  Visible on public page
                </label>
              </div>

              <div className="form-grid">
                <label>
                  Section heading / title
                  <input
                    value={activeSection.title}
                    onChange={(e) => updateSectionField(activeSection.id, "title", e.target.value)}
                    placeholder="Enter section title…"
                  />
                </label>
                <label>
                  Eyebrow label
                  <input
                    value={activeSection.eyebrow}
                    onChange={(e) => updateSectionField(activeSection.id, "eyebrow", e.target.value)}
                    placeholder="e.g. 01 — OUR STORY"
                  />
                </label>
              </div>

              <label>
                Body text / description
                <textarea
                  rows={4}
                  value={activeSection.content}
                  onChange={(e) => updateSectionField(activeSection.id, "content", e.target.value)}
                  placeholder="Supports clean formatting: # Heading, - Bullet point, **bold**, _italic_..."
                />
              </label>

              {/* Action Button Fields */}
              <div className="form-grid">
                <label>
                  Call-to-action button label
                  <input
                    value={activeSection.ctaLabel}
                    onChange={(e) => updateSectionField(activeSection.id, "ctaLabel", e.target.value)}
                    placeholder="e.g. Discover our brands"
                  />
                </label>
                <label>
                  Call-to-action destination URL
                  <input
                    value={activeSection.ctaHref}
                    onChange={(e) => updateSectionField(activeSection.id, "ctaHref", e.target.value)}
                    placeholder="/brands or https://..."
                  />
                </label>
              </div>

              {/* Image fields for hero, image_text, rich_text */}
              {["editorial_hero", "image_text", "rich_text"].includes(activeSection.type) && (
                <div className="section-image-control-wrap">
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                    <button
                      type="button"
                      className="button outline small"
                      onClick={() => setPickerOpen(true)}
                    >
                      <ImageIcon size={14} /> Choose from Media Library
                    </button>
                    {activeSection.image && (
                      <span className="muted" style={{ fontSize: "12px" }}>
                        Selected: <img src={activeSection.image} alt="" style={{ height: "24px", width: "24px", objectFit: "cover", display: "inline-block", verticalAlign: "middle", borderRadius: "2px", marginLeft: "4px" }} />
                      </span>
                    )}
                  </div>
                  <div className="form-grid">
                    <label>
                      Section image URL
                      <input
                        value={activeSection.image}
                        onChange={(e) => updateSectionField(activeSection.id, "image", e.target.value)}
                        placeholder="/images/knitwear.jpg or HTTPS URL"
                      />
                    </label>
                    <label>
                      Image alternative text
                      <input
                        value={activeSection.imageAlt}
                        onChange={(e) => updateSectionField(activeSection.id, "imageAlt", e.target.value)}
                        placeholder="Describe the image for screen readers"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Custom Sub-Editors based on Section Type */}
              <SectionCustomDataEditor
                section={activeSection}
                allRecords={allRecords}
                onUpdateData={(newData) =>
                  updateSectionField(activeSection.id, "data", newData)
                }
              />
            </div>
          ) : (
            <div className="panel empty-state">
              <p>Select a section on the left to edit its content.</p>
            </div>
          )}
        </main>
      </div>

      <MediaPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => {
          if (activeSection) {
            updateSectionField(activeSection.id, "image", asset.url);
            if (asset.alt) updateSectionField(activeSection.id, "imageAlt", asset.alt);
          }
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

function getDefaultSectionData(type: SectionType): Record<string, any> {
  switch (type) {
    case "company_facts":
      return {
        facts: [
          { value: "100%", label: "Traceable fiber sources", note: "" },
          { value: "48+", label: "Gauge capabilities", note: "" },
        ],
      };
    case "timeline":
      return {
        milestones: [
          { year: "2026", title: "Milestone", description: "Milestone description." },
        ],
      };
    case "capabilities_process":
      return {
        steps: [
          { stepNumber: 1, title: "Initial Yarn Inspecion", description: "Batch test." },
          { stepNumber: 2, title: "Knitting & Linking", description: "Precision shaping." },
        ],
      };
    case "faqs":
      return {
        faqs: [
          { question: "What is the standard production lead time?", answer: "Typically 4 to 6 weeks from approved lab dips." },
        ],
      };
    case "document_links":
      return {
        documents: [
          { title: "Technical Knitwear Guide", url: "https://example.com/guide.pdf", format: "PDF", description: "Gauge specifications and wash care." },
        ],
      };
    case "gallery":
      return {
        items: [
          { image: "/images/knitwear.jpg", alt: "Knitted fabric detail", caption: "Close-up stitch inspection" },
        ],
      };
    case "product_showcase":
      return { itemIds: [] };
    case "brand_showcase":
      return { limit: 4 };
    default:
      return {};
  }
}

/**
 * Dedicated Sub-Editors for structured data inside sections
 */
function SectionCustomDataEditor({
  section,
  allRecords,
  onUpdateData,
}: {
  section: Section;
  allRecords: RecordItem[];
  onUpdateData: (data: Record<string, any>) => void;
}) {
  const data = section.data || {};

  if (section.type === "company_facts") {
    const facts: Array<{ value: string; label: string; note?: string }> =
      Array.isArray(data.facts) ? data.facts : [];

    const addFact = () => {
      onUpdateData({
        ...data,
        facts: [...facts, { value: "New Value", label: "Metric label", note: "" }],
      });
    };

    const updateFact = (idx: number, field: "value" | "label" | "note", val: string) => {
      const updated = facts.map((f, i) => (i === idx ? { ...f, [field]: val } : f));
      onUpdateData({ ...data, facts: updated });
    };

    const removeFact = (idx: number) => {
      onUpdateData({ ...data, facts: facts.filter((_, i) => i !== idx) });
    };

    return (
      <div className="sub-editor-panel">
        <h4>Verified Company Facts ({facts.length})</h4>
        {facts.map((f, i) => (
          <div className="sub-editor-row" key={i}>
            <input
              style={{ width: "25%" }}
              placeholder="Value (e.g. 1.2M)"
              value={f.value}
              onChange={(e) => updateFact(i, "value", e.target.value)}
            />
            <input
              style={{ width: "35%" }}
              placeholder="Label (e.g. Annual capacity)"
              value={f.label}
              onChange={(e) => updateFact(i, "label", e.target.value)}
            />
            <input
              style={{ width: "35%" }}
              placeholder="Note (optional)"
              value={f.note || ""}
              onChange={(e) => updateFact(i, "note", e.target.value)}
            />
            <button
              type="button"
              className="icon-action-btn text-danger"
              onClick={() => removeFact(i)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <button type="button" className="button outline small" onClick={addFact}>
          <Plus size={14} /> Add company fact
        </button>
      </div>
    );
  }

  if (section.type === "timeline") {
    const milestones: Array<{ year: string; title: string; description: string }> =
      Array.isArray(data.milestones) ? data.milestones : [];

    const addMilestone = () => {
      onUpdateData({
        ...data,
        milestones: [...milestones, { year: "2026", title: "New Milestone", description: "" }],
      });
    };

    const updateMilestone = (idx: number, field: string, val: string) => {
      const updated = milestones.map((m, i) => (i === idx ? { ...m, [field]: val } : m));
      onUpdateData({ ...data, milestones: updated });
    };

    const removeMilestone = (idx: number) => {
      onUpdateData({ ...data, milestones: milestones.filter((_, i) => i !== idx) });
    };

    return (
      <div className="sub-editor-panel">
        <h4>Company Milestones ({milestones.length})</h4>
        {milestones.map((m, i) => (
          <div className="sub-editor-card" key={i}>
            <div className="sub-editor-row">
              <input
                style={{ width: "20%" }}
                placeholder="Year"
                value={m.year}
                onChange={(e) => updateMilestone(i, "year", e.target.value)}
              />
              <input
                style={{ width: "70%" }}
                placeholder="Milestone title"
                value={m.title}
                onChange={(e) => updateMilestone(i, "title", e.target.value)}
              />
              <button
                type="button"
                className="icon-action-btn text-danger"
                onClick={() => removeMilestone(i)}
              >
                <Trash2 size={15} />
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="Milestone description"
              value={m.description}
              onChange={(e) => updateMilestone(i, "description", e.target.value)}
            />
          </div>
        ))}
        <button type="button" className="button outline small" onClick={addMilestone}>
          <Plus size={14} /> Add milestone
        </button>
      </div>
    );
  }

  if (section.type === "faqs") {
    const faqs: Array<{ question: string; answer: string }> =
      Array.isArray(data.faqs) ? data.faqs : [];

    const addFaq = () => {
      onUpdateData({
        ...data,
        faqs: [...faqs, { question: "Frequently asked question?", answer: "Clear, helpful answer." }],
      });
    };

    const updateFaq = (idx: number, field: "question" | "answer", val: string) => {
      const updated = faqs.map((f, i) => (i === idx ? { ...f, [field]: val } : f));
      onUpdateData({ ...data, faqs: updated });
    };

    const removeFaq = (idx: number) => {
      onUpdateData({ ...data, faqs: faqs.filter((_, i) => i !== idx) });
    };

    return (
      <div className="sub-editor-panel">
        <h4>FAQs ({faqs.length})</h4>
        {faqs.map((f, i) => (
          <div className="sub-editor-card" key={i}>
            <div className="sub-editor-row">
              <input
                style={{ width: "90%" }}
                placeholder="Question"
                value={f.question}
                onChange={(e) => updateFaq(i, "question", e.target.value)}
              />
              <button
                type="button"
                className="icon-action-btn text-danger"
                onClick={() => removeFaq(i)}
              >
                <Trash2 size={15} />
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="Answer"
              value={f.answer}
              onChange={(e) => updateFaq(i, "answer", e.target.value)}
            />
          </div>
        ))}
        <button type="button" className="button outline small" onClick={addFaq}>
          <Plus size={14} /> Add question & answer
        </button>
      </div>
    );
  }

  if (section.type === "product_showcase") {
    const availableProducts = allRecords.filter((r) => r.kind === "product");
    const selectedIds: string[] = Array.isArray(data.itemIds) ? data.itemIds : [];

    const toggleProduct = (prodId: string) => {
      const next = selectedIds.includes(prodId)
        ? selectedIds.filter((id) => id !== prodId)
        : [...selectedIds, prodId];
      onUpdateData({ ...data, itemIds: next });
    };

    return (
      <div className="sub-editor-panel">
        <h4>Selected Showcase Products ({selectedIds.length})</h4>
        <p className="muted">
          Choose which products appear in this carousel. If none are selected, all published products will display.
        </p>
        <div className="checkbox-scroll-list">
          {availableProducts.map((p) => {
            const isChecked = selectedIds.includes(p.id);
            return (
              <label key={p.id} className="checkbox-item-row">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleProduct(p.id)}
                />
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

  return null;
}
