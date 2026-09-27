import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  FileText,
  Clock,
  MapPin,
  ChevronDown,
  Layers,
  Sparkles,
} from "lucide-react";
import type { Section, RecordItem, Content, Location } from "@/lib/schema";
import { ProductCarousel } from "./product-carousel";

/**
 * Restricted, safe rich-text formatting renderer.
 * Converts markdown-style text into sanitized React elements without dangerouslySetInnerHTML.
 */
export function SafeRichText({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="safe-list">
          {listItems.map((item, idx) => (
            <li key={idx}>{formatInline(item)}</li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  const formatInline = (text: string): React.ReactNode => {
    // Basic bold/italic inline parsing
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_)/g);
    return parts.map((part, i) => {
      if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushList();
      elements.push(<h4 key={`h4-${i}`}>{formatInline(line.slice(4))}</h4>);
    } else if (line.startsWith("## ")) {
      flushList();
      elements.push(<h3 key={`h3-${i}`}>{formatInline(line.slice(3))}</h3>);
    } else if (line.startsWith("# ")) {
      flushList();
      elements.push(<h2 key={`h2-${i}`}>{formatInline(line.slice(2))}</h2>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(line.slice(2));
    } else if (line.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote key={`quote-${i}`} className="safe-quote">
          {formatInline(line.slice(2))}
        </blockquote>,
      );
    } else {
      flushList();
      elements.push(<p key={`p-${i}`}>{formatInline(line)}</p>);
    }
  }
  flushList();

  return <div className="prose safe-rich-text">{elements}</div>;
}

export function SectionRenderer({
  sections,
  allRecords = [],
  settings,
  previewMode = false,
}: {
  sections: Section[];
  allRecords?: RecordItem[];
  settings?: Content;
  previewMode?: boolean;
}) {
  const publishedProducts = allRecords.filter(
    (r) => r.kind === "product" && (previewMode ? r.draft : r.published),
  );
  const publishedBrands = allRecords.filter(
    (r) => r.kind === "brand" && (previewMode ? r.draft : r.published),
  );

  const sorted = [...sections]
    .filter((s) => previewMode || s.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="page-sections-flow">
      {sorted.map((sec) => (
        <RenderSingleSection
          key={sec.id}
          section={sec}
          products={publishedProducts}
          brands={publishedBrands}
          settings={settings}
          previewMode={previewMode}
        />
      ))}
    </div>
  );
}

function RenderSingleSection({
  section,
  products,
  brands,
  settings,
  previewMode,
}: {
  section: Section;
  products: RecordItem[];
  brands: RecordItem[];
  settings?: Content;
  previewMode?: boolean;
}) {
  const isHidden = !section.enabled;

  return (
    <div className={`section-block-wrapper ${isHidden ? "section-disabled-preview" : ""}`}>
      {previewMode && isHidden && (
        <div className="section-hidden-badge">
          <span>HIDDEN SECTION (Disabled in draft)</span>
        </div>
      )}

      {renderSectionContent(section, products, brands, settings)}
    </div>
  );
}

function renderSectionContent(
  sec: Section,
  products: RecordItem[],
  brands: RecordItem[],
  settings?: Content,
) {
  switch (sec.type) {
    case "editorial_hero":
      return (
        <section className="hero editorial-hero-section">
          <div className="hero-copy">
            {sec.eyebrow && (
              <div className="eyebrow">
                <span className="line" />
                {sec.eyebrow}
              </div>
            )}
            <h1>{sec.title}</h1>
            {sec.content && <p>{sec.content}</p>}
            {sec.ctaLabel && (
              <div className="hero-buttons">
                <Link href={sec.ctaHref || "/brands"} className="button dark">
                  {sec.ctaLabel} <ArrowUpRight size={18} />
                </Link>
              </div>
            )}
          </div>
          {sec.image && (
            <div className="hero-photo">
              <img src={sec.image} alt={sec.imageAlt || sec.title} fetchPriority="high" />
              {sec.eyebrow && <span className="photo-label">{sec.eyebrow}</span>}
            </div>
          )}
        </section>
      );

    case "image_text":
      return (
        <section className="section image-text-section">
          <div className="image-text-grid">
            {sec.image && (
              <div className="image-col">
                <img src={sec.image} alt={sec.imageAlt || sec.title} loading="lazy" />
              </div>
            )}
            <div className="text-col">
              {sec.eyebrow && (
                <div className="eyebrow">
                  <span className="line" />
                  {sec.eyebrow}
                </div>
              )}
              <h2>{sec.title}</h2>
              <SafeRichText content={sec.content} />
              {sec.ctaLabel && (
                <Link href={sec.ctaHref || "/contact"} className="button dark">
                  {sec.ctaLabel} <ArrowUpRight size={17} />
                </Link>
              )}
            </div>
          </div>
        </section>
      );

    case "rich_text":
      return (
        <section className="section rich-text-section">
          <div className="editorial-container">
            {sec.eyebrow && (
              <div className="eyebrow">
                <span className="line" />
                {sec.eyebrow}
              </div>
            )}
            {sec.title && <h2>{sec.title}</h2>}
            <SafeRichText content={sec.content} />
          </div>
        </section>
      );

    case "brand_showcase": {
      const limit = Number(sec.data?.limit) || 6;
      const displayBrands = brands.slice(0, limit);
      if (displayBrands.length === 0) return null;

      return (
        <section className="section brand-section">
          <div className="section-heading">
            <div>
              {sec.eyebrow && <span className="eyebrow">{sec.eyebrow}</span>}
              <h2>{sec.title || "Our Brands"}</h2>
              {sec.content && <p>{sec.content}</p>}
            </div>
            {sec.ctaLabel && (
              <Link href={sec.ctaHref || "/brands"} className="text-link">
                {sec.ctaLabel} <ArrowUpRight size={18} />
              </Link>
            )}
          </div>
          <div className={`brand-grid ${displayBrands.length === 1 ? "single" : ""}`}>
            {displayBrands.map((b) => {
              const c = b.published || b.draft;
              return (
                <Link href={`/brands/${b.slug}`} className="brand-card" key={b.id}>
                  <div className="card-photo">
                    {c.image ? <img src={c.image} alt={c.imageAlt} /> : <Layers size={64} />}
                    <span className="round-link">
                      <ArrowUpRight />
                    </span>
                  </div>
                  <div className="card-meta">
                    <span className="eyebrow">{c.category || "OUR BRAND"}</span>
                    <span>Owned brand</span>
                  </div>
                  <h3>{c.title}</h3>
                  <p>{c.summary}</p>
                </Link>
              );
            })}
          </div>
        </section>
      );
    }

    case "product_showcase": {
      const itemIds: string[] = Array.isArray(sec.data?.itemIds) ? sec.data.itemIds : [];
      let selectedProds = products;
      if (itemIds.length > 0) {
        selectedProds = itemIds
          .map((id) => products.find((p) => p.id === id))
          .filter((p): p is RecordItem => Boolean(p));
      }

      if (selectedProds.length === 0) return null;

      return (
        <section className="section product-showcase-section">
          <div className="section-heading">
            <div>
              {sec.eyebrow && <span className="eyebrow">{sec.eyebrow}</span>}
              <h2>{sec.title || "Featured Knitwear"}</h2>
              {sec.content && <p>{sec.content}</p>}
            </div>
            {sec.ctaLabel && (
              <Link href={sec.ctaHref || "/products"} className="text-link">
                {sec.ctaLabel} <ArrowUpRight size={18} />
              </Link>
            )}
          </div>
          <ProductCarousel products={selectedProds} />
        </section>
      );
    }

    case "company_facts": {
      const facts: Array<{ value: string; label: string; note?: string }> =
        Array.isArray(sec.data?.facts) ? sec.data.facts : [];
      if (facts.length === 0) return null;

      return (
        <section className="section company-facts-section">
          <div className="section-heading">
            <div>
              {sec.eyebrow && <span className="eyebrow">{sec.eyebrow}</span>}
              <h2>{sec.title || "Company Metrics"}</h2>
              {sec.content && <p>{sec.content}</p>}
            </div>
          </div>
          <div className="facts-grid">
            {facts.map((f, i) => (
              <div className="fact-card" key={i}>
                <strong>{f.value}</strong>
                <span>{f.label}</span>
                {f.note && <small>{f.note}</small>}
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "timeline": {
      const milestones: Array<{ year: string; title: string; description: string }> =
        Array.isArray(sec.data?.milestones) ? sec.data.milestones : [];
      if (milestones.length === 0) return null;

      return (
        <section className="section timeline-section">
          <div className="section-heading">
            <div>
              {sec.eyebrow && <span className="eyebrow">{sec.eyebrow}</span>}
              <h2>{sec.title || "Company Timeline"}</h2>
              {sec.content && <p>{sec.content}</p>}
            </div>
          </div>
          <div className="timeline-flow">
            {milestones.map((m, i) => (
              <div className="timeline-item" key={i}>
                <div className="timeline-year">
                  <span>{m.year}</span>
                </div>
                <div className="timeline-content">
                  <h3>{m.title}</h3>
                  <p>{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "capabilities_process": {
      const steps: Array<{ stepNumber: number; title: string; description: string }> =
        Array.isArray(sec.data?.steps) ? sec.data.steps : [];
      if (steps.length === 0) return null;

      return (
        <section className="section process-section">
          <div className="section-heading">
            <div>
              {sec.eyebrow && <span className="eyebrow">{sec.eyebrow}</span>}
              <h2>{sec.title || "Manufacturing Process"}</h2>
              {sec.content && <p>{sec.content}</p>}
            </div>
          </div>
          <div className="process-grid">
            {steps.map((st, i) => (
              <div className="process-card" key={i}>
                <span className="step-num">{String(st.stepNumber || i + 1).padStart(2, "0")}</span>
                <h3>{st.title}</h3>
                <p>{st.description}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "faqs": {
      const faqs: Array<{ question: string; answer: string }> = Array.isArray(sec.data?.faqs)
        ? sec.data.faqs
        : [];
      if (faqs.length === 0) return null;

      return (
        <section className="section faqs-section">
          <div className="section-heading">
            <div>
              {sec.eyebrow && <span className="eyebrow">{sec.eyebrow}</span>}
              <h2>{sec.title || "Frequently Asked Questions"}</h2>
              {sec.content && <p>{sec.content}</p>}
            </div>
          </div>
          <div className="faq-accordion">
            {faqs.map((faq, i) => (
              <details className="faq-item" key={i}>
                <summary>
                  <span>{faq.question}</span>
                  <ChevronDown size={18} />
                </summary>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      );
    }

    case "locations": {
      const locationsList: Location[] =
        Array.isArray(sec.data?.locations) && sec.data.locations.length > 0
          ? sec.data.locations
          : settings?.locations || [];

      if (locationsList.length === 0) return null;

      return (
        <section className="section locations-section">
          <div className="section-heading">
            <div>
              {sec.eyebrow && <span className="eyebrow">{sec.eyebrow}</span>}
              <h2>{sec.title || "Offices & Manufacturing Facilities"}</h2>
              {sec.content && <p>{sec.content}</p>}
            </div>
          </div>
          <div className="locations-grid">
            {locationsList.map((loc) => (
              <article className="location-card" key={loc.id}>
                {loc.isHeadquarters && <span className="badge draft">Headquarters</span>}
                <h3>{loc.name}</h3>
                <p className="loc-address">
                  <MapPin size={16} />
                  {loc.address}
                </p>
                {loc.phone && (
                  <p className="loc-phone">
                    <a href={`tel:${loc.phone.replace(/[^+\d]/g, "")}`}>{loc.phone}</a>
                  </p>
                )}
                {loc.email && (
                  <p className="loc-email">
                    <a href={`mailto:${loc.email}`}>{loc.email}</a>
                  </p>
                )}
                {loc.hours && (
                  <p className="loc-hours">
                    <Clock size={15} />
                    {loc.hours}
                  </p>
                )}
                {loc.directionsUrl && (
                  <a
                    href={loc.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                  >
                    Get directions <ArrowUpRight size={15} />
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>
      );
    }

    case "document_links": {
      const docs: Array<{ title: string; url: string; description?: string; format?: string }> =
        Array.isArray(sec.data?.documents) ? sec.data.documents : [];
      if (docs.length === 0) return null;

      return (
        <section className="section documents-section">
          <div className="section-heading">
            <div>
              {sec.eyebrow && <span className="eyebrow">{sec.eyebrow}</span>}
              <h2>{sec.title || "Company Resources & Specifications"}</h2>
              {sec.content && <p>{sec.content}</p>}
            </div>
          </div>
          <div className="documents-list">
            {docs.map((d, i) => (
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="document-card"
                key={i}
              >
                <FileText size={24} />
                <div>
                  <strong>{d.title}</strong>
                  {d.description && <p>{d.description}</p>}
                  {d.format && <small>{d.format.toUpperCase()} Document</small>}
                </div>
                <ArrowUpRight size={18} />
              </a>
            ))}
          </div>
        </section>
      );
    }

    case "gallery": {
      const items: Array<{ image: string; alt: string; caption?: string }> =
        Array.isArray(sec.data?.items) ? sec.data.items : [];
      if (items.length === 0) return null;

      return (
        <section className="section lookbook-gallery-section">
          <div className="section-heading">
            <div>
              {sec.eyebrow && <span className="eyebrow">{sec.eyebrow}</span>}
              <h2>{sec.title || "Lookbook & Imagery"}</h2>
              {sec.content && <p>{sec.content}</p>}
            </div>
          </div>
          <div className="gallery-masonry">
            {items.map((it, i) => (
              <figure className="gallery-figure" key={i}>
                <img src={it.image} alt={it.alt || sec.title} loading="lazy" />
                {it.caption && <figcaption>{it.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      );
    }

    case "contact_banner":
      return (
        <section className="contact-band">
          {sec.eyebrow && <span className="eyebrow">{sec.eyebrow}</span>}
          <div>
            <h2>{sec.title || "Let’s start a conversation."}</h2>
            <Link href={sec.ctaHref || "/contact"} className="button light">
              {sec.ctaLabel || "Get in touch"} <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>
      );

    default:
      return null;
  }
}
