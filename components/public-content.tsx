import React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Layers, MoveUpRight, MapPin, Clock, Phone, Mail } from "lucide-react";
import {
  relationshipLabels,
  type RecordItem,
  type Content,
  type RelationshipType,
} from "@/lib/schema";
import { ContactForm } from "./contact-form";
import { SectionRenderer } from "./section-renderer";

export function Prose({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="prose">
      {text
        .split("\n")
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </div>
  );
}

export function BrandCard({ record }: { record: RecordItem }) {
  const c = record.published || record.draft;
  return (
    <Link href={`/brands/${record.slug}`} className="brand-card">
      <div className="card-photo">
        {c.image ? (
          <img src={c.image} alt={c.imageAlt || c.title} loading="lazy" />
        ) : (
          <Layers size={64} />
        )}
        <span className="round-link" aria-hidden="true">
          <ArrowUpRight />
        </span>
      </div>
      <div className="card-meta">
        <span className="eyebrow">{c.category || "OUR BRAND"}</span>
        <span>{relationshipLabels[c.relationship]}</span>
      </div>
      <h3>{c.title}</h3>
      <p>{c.summary}</p>
    </Link>
  );
}

export function PageIntro({ content }: { content: Content }) {
  return (
    <section className="page-intro">
      <div className="eyebrow">
        <span className="line" />
        {content.eyebrow}
      </div>
      <h1>{content.title}</h1>
      <p>{content.summary}</p>
    </section>
  );
}

export function Home({
  page,
  records,
}: {
  page: Content;
  records: RecordItem[];
}) {
  // If modern sections are defined, render using SectionRenderer
  if (page.sections && page.sections.length > 0) {
    return (
      <div className="home-canvas">
        <SectionRenderer
          sections={page.sections}
          allRecords={records}
          previewMode={false}
        />
      </div>
    );
  }

  // Fallback rendering for unmigrated legacy homepage content
  const brands = records
    .filter((r) => r.kind === "brand" && r.published)
    .sort((a, b) => a.published!.order - b.published!.order);
  const featured = brands.filter((r) => r.published!.featured);
  // Removed hardcoded 2-brand limit
  const selected = featured.length ? featured : brands;
  const about = records.find(
    (r) => r.kind === "page" && r.slug === "about",
  )?.published;

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="line" />
            {page.eyebrow}
          </div>
          <h1>{page.title}</h1>
          <p>{page.summary}</p>
          <div className="hero-buttons">
            <Link href={page.ctaHref || "/brands"} className="button dark">
              {page.ctaLabel || "Explore our brands"}
              <ArrowUpRight size={18} />
            </Link>
            <Link href="/about" className="text-link">
              Meet the company <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-foot">
            <span>{page.heroFooter}</span>
            <span>01 / INTRODUCTION</span>
          </div>
        </div>
        <div className="hero-photo">
          {page.image && (
            <img src={page.image} alt={page.imageAlt} fetchPriority="high" />
          )}
          <span className="photo-label">{page.photoLabel}</span>
        </div>
      </section>

      {page.ticker && (
        <div className="ticker">
          {page.ticker
            .split(",")
            .filter(Boolean)
            .map((item, i) => (
              <span key={i}>{item.trim()}</span>
            ))}
          <MoveUpRight size={22} />
        </div>
      )}

      {page.homeSections.map((section) =>
        section === "about" && about ? (
          <section key="about" className="section about-strip">
            <div>
              <span className="eyebrow">{page.aboutLabel}</span>
              <h2>{about.title}</h2>
            </div>
            <div>
              <p className="large-copy">{about.summary}</p>
              <p>{page.body}</p>
              <Link href="/about" className="text-link">
                Get to know Mack <ArrowUpRight size={18} />
              </Link>
            </div>
          </section>
        ) : section === "brands" && selected.length > 0 ? (
          <section key="brands" className="section brand-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{page.brandsLabel}</span>
                <h2>{page.brandsTitle}</h2>
              </div>
              <Link href="/brands" className="text-link">
                Explore all brands <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="brand-grid">
              {selected.map((r) => (
                <BrandCard key={r.id} record={r} />
              ))}
            </div>
          </section>
        ) : section === "contact" ? (
          <section key="contact" className="contact-band">
            <span className="eyebrow">{page.contactLabel}</span>
            <div>
              <h2>{page.contactTitle}</h2>
              <Link href="/contact" className="button light">
                {page.contactButton} <ArrowUpRight size={18} />
              </Link>
            </div>
          </section>
        ) : null,
      )}
    </>
  );
}

export function ContentPage({
  page,
  records,
  settings,
  slug,
  brand = "",
  product = "",
  sku = "",
  inquiryType = "",
  demo = false,
}: {
  page: Content;
  records: RecordItem[];
  settings: Content;
  slug: string;
  brand?: string;
  product?: string;
  sku?: string;
  inquiryType?: string;
  demo?: boolean;
}) {
  // If page has modular sections configured (e.g. customized About or Capabilities)
  if (page.sections && page.sections.length > 0 && slug !== "contact") {
    return (
      <div className="custom-page-canvas">
        <PageIntro content={page} />
        <SectionRenderer
          sections={page.sections}
          allRecords={records}
          settings={settings}
          previewMode={false}
        />
      </div>
    );
  }

  // Dedicated Contact Page Layout
  if (slug === "contact") {
    const locations = settings.locations && settings.locations.length > 0
      ? settings.locations
      : [];

    return (
      <>
        <PageIntro content={page} />
        <section className="section contact-layout">
          <div className="contact-info-column">
            <Prose text={page.body} />

            {/* Direct Contact Details */}
            <div className="contact-details">
              {settings.email && (
                <div className="contact-detail-item">
                  <span className="eyebrow">EMAIL INQUIRIES</span>
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </div>
              )}
              {settings.phone && (
                <div className="contact-detail-item">
                  <span className="eyebrow">TELEPHONE</span>
                  <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}>
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings.responsePromise && (
                <div className="contact-detail-item">
                  <span className="eyebrow">COMMERCIAL ASSURANCE</span>
                  <p className="response-promise">{settings.responsePromise}</p>
                </div>
              )}
            </div>

            {/* Multiple Locations */}
            {locations.length > 0 && (
              <div className="locations-column-wrap">
                <span className="eyebrow">OFFICES & FACILITIES</span>
                <div className="locations-compact-list">
                  {locations.map((loc) => (
                    <article className="location-compact-card" key={loc.id}>
                      <h4>
                        {loc.name} {loc.isHeadquarters && <span className="hq-tag">(HQ)</span>}
                      </h4>
                      <p className="loc-text">{loc.address}</p>
                      {loc.hours && <small className="loc-hours"><Clock size={12} /> {loc.hours}</small>}
                      {loc.directionsUrl && (
                        <a href={loc.directionsUrl} target="_blank" rel="noopener noreferrer" className="directions-link">
                          Directions ↗
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="contact-form-column">
            <ContactForm
              brand={brand}
              initialProduct={product}
              initialSku={sku}
              initialType={inquiryType}
              demo={demo}
            />
          </div>
        </section>
      </>
    );
  }

  // Dedicated Network Page Layout (Grouped by Relationship)
  if (slug === "network") {
    const networkRecords = records.filter(
      (r) => r.kind === "network" && r.published,
    );

    const groups: Array<{ key: RelationshipType; title: string; items: RecordItem[] }> = [
      { key: "represented", title: "Represented Brands", items: [] },
      { key: "client", title: "Client & Supply Relationships", items: [] },
      { key: "sister", title: "Sister Concerns", items: [] },
      { key: "partner", title: "Business Partners", items: [] },
    ];

    networkRecords.forEach((r) => {
      const rel = r.published!.relationship;
      const g = groups.find((grp) => grp.key === rel);
      if (g) g.items.push(r);
    });

    return (
      <>
        <PageIntro content={page} />
        <section className="section network-section">
          <Prose text={page.body} />

          {networkRecords.length === 0 ? (
            <div className="empty-public">
              <Layers size={28} />
              <p>Confirmed business relationships will be published here.</p>
              <Link className="text-link" href="/contact">
                Contact us <ArrowUpRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="network-groups-flow">
              {groups
                .filter((g) => g.items.length > 0)
                .map((group) => (
                  <div className="network-group-block" key={group.key}>
                    <div className="network-group-heading">
                      <span className="eyebrow">{group.title.toUpperCase()}</span>
                      <h2>{group.title}</h2>
                    </div>
                    <div className="collection-grid">
                      {group.items.map((r) => {
                        const c = r.published!;
                        return (
                          <article className="info-card network-card" key={r.id}>
                            {c.image && (
                              <img src={c.image} alt={c.imageAlt || c.title} loading="lazy" />
                            )}
                            <span className="eyebrow">{c.category || relationshipLabels[c.relationship]}</span>
                            <h3>{c.title}</h3>
                            <p>{c.summary}</p>
                            <Prose text={c.body} />
                            {c.website && (
                              <a
                                href={c.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-link"
                              >
                                Visit website <ArrowUpRight size={16} />
                              </a>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </>
    );
  }

  // Dedicated Capabilities Page Layout
  if (slug === "capabilities") {
    const capabilities = records
      .filter((r) => r.kind === "capability" && r.published)
      .sort((a, b) => a.published!.order - b.published!.order);

    return (
      <>
        <PageIntro content={page} />
        <section className="section capabilities-section">
          <Prose text={page.body} />

          {capabilities.length > 0 && (
            <div className="capabilities-entries-list">
              {capabilities.map((cap) => {
                const c = cap.published!;
                return (
                  <article className="capability-entry-card" key={cap.id}>
                    <div className="capability-card-grid">
                      <div className="capability-copy">
                        <span className="eyebrow">{c.category || "CAPABILITY"}</span>
                        <h2>{c.title}</h2>
                        <p className="large-copy">{c.summary}</p>
                        <Prose text={c.body} />

                        {c.processSteps && c.processSteps.length > 0 && (
                          <div className="capability-process-steps">
                            <h4>Standard Process Flow</h4>
                            <div className="steps-flow">
                              {c.processSteps.map((st) => (
                                <div className="step-point" key={st.stepNumber}>
                                  <span className="step-num">{st.stepNumber}</span>
                                  <div>
                                    <strong>{st.title}</strong>
                                    <p>{st.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {c.outputs && c.outputs.length > 0 && (
                          <div className="capability-outputs-chips">
                            <h4>Key Production Outputs</h4>
                            <div className="chips-row">
                              {c.outputs.map((out, i) => (
                                <span className="output-chip" key={i}>
                                  {out}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {c.ctaLabel && (
                          <Link href={c.ctaHref || "/contact"} className="button dark small">
                            {c.ctaLabel} <ArrowUpRight size={16} />
                          </Link>
                        )}
                      </div>

                      {c.image && (
                        <div className="capability-visual">
                          <img src={c.image} alt={c.imageAlt || c.title} loading="lazy" />
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </>
    );
  }

  // Dedicated Privacy Policy Page Layout
  if (slug === "privacy") {
    return (
      <>
        <PageIntro content={page} />
        <section className="section privacy-content-section">
          <div className="editorial-container">
            <div className="privacy-header-meta">
              <span className="eyebrow">Mack Knit Wear Data Governance</span>
              <p className="muted">
                Last reviewed: {new Date(page.seoTitle ? page.seoTitle : Date.now()).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <Prose text={page.body} />
          </div>
        </section>
      </>
    );
  }

  // General Editorial Page Layout
  return (
    <>
      <PageIntro content={page} />
      <section className="section content-section">
        <Prose text={page.body} />
        {page.image && (
          <img className="wide-photo" src={page.image} alt={page.imageAlt} />
        )}
      </section>
    </>
  );
}

export function BrandPage({ content }: { content: Content }) {
  return (
    <>
      <div className="breadcrumb">
        <Link href="/brands">Our brands</Link>
        <span>/</span>
        <span>{content.title}</span>
      </div>
      <section className="brand-detail">
        <div>
          <span className="eyebrow">
            {relationshipLabels[content.relationship]}
          </span>
          <h1>{content.title}</h1>
          <p className="large-copy">{content.summary}</p>
          <Prose text={content.body} />
          <div className="brand-actions">
            {content.website && (
              <a
                className="button dark"
                href={content.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content.website === content.store
                  ? "Visit website & shop"
                  : "Visit brand website"}{" "}
                <ArrowUpRight size={18} />
              </a>
            )}
            {content.store && content.store !== content.website && (
              <a
                className="button outline"
                href={content.store}
                target="_blank"
                rel="noopener noreferrer"
              >
                Shop online <ArrowUpRight size={18} />
              </a>
            )}
            <Link
              href={`/contact?brand=${encodeURIComponent(content.title)}`}
              className="text-link"
            >
              {content.website
                ? "Wholesale inquiry"
                : "Contact about this brand"}{" "}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        {content.image && <img src={content.image} alt={content.imageAlt} />}
      </section>
    </>
  );
}
