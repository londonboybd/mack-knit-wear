import Link from "next/link";
import { ArrowUpRight, ArrowRight, Layers, MoveUpRight } from "lucide-react";
import {
  relationshipLabels,
  type RecordItem,
  type Content,
} from "@/lib/schema";
import { ContactForm } from "./contact-form";
export function Prose({ text }: { text: string }) {
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
  const c = record.published!;
  return (
    <Link href={`/brands/${record.slug}`} className="brand-card">
      <div className="card-photo">
        {c.image ? (
          <img src={c.image} alt={c.imageAlt} />
        ) : (
          <Layers size={64} />
        )}
        <span className="round-link">
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
  const brands = records
    .filter((r) => r.kind === "brand" && r.published)
    .sort((a, b) => a.published!.order - b.published!.order);
  const featured = brands.filter((r) => r.published!.featured);
  const selected = (featured.length ? featured : brands).slice(0, 2);
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
      <div className="ticker">
        {page.ticker
          .split(",")
          .filter(Boolean)
          .map((item, i) => (
            <span key={i}>{item.trim()}</span>
          ))}
        <MoveUpRight size={22} />
      </div>
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
            <div
              className={`brand-grid ${selected.length === 1 ? "single" : ""}`}
            >
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
  demo = false,
}: {
  page: Content;
  records: RecordItem[];
  settings: Content;
  slug: string;
  brand?: string;
  demo?: boolean;
}) {
  const collection =
    slug === "brands"
      ? "brand"
      : slug === "network"
        ? "network"
        : slug === "products"
          ? "product"
          : null;
  const entries = records
    .filter((r) => r.kind === collection && r.published)
    .sort((a, b) => a.published!.order - b.published!.order);
  return (
    <>
      <PageIntro content={page} />
      {slug === "contact" ? (
        <section className="section contact-layout">
          <div>
            <Prose text={page.body} />
            <div className="contact-details">
              {settings.email && (
                <>
                  <span className="eyebrow">EMAIL</span>
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </>
              )}
              {settings.phone && (
                <>
                  <span className="eyebrow">PHONE</span>
                  <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}>
                    {settings.phone}
                  </a>
                </>
              )}
              {settings.address && (
                <>
                  <span className="eyebrow">ADDRESS</span>
                  <p>{settings.address}</p>
                </>
              )}
            </div>
          </div>
          <ContactForm brand={brand} demo={demo} />
        </section>
      ) : (
        <section className="section content-section">
          <Prose text={page.body} />
          {slug === "about" && page.image && (
            <img className="wide-photo" src={page.image} alt={page.imageAlt} />
          )}
          {collection && (
            <div className="collection-grid">
              {entries.map((r) =>
                collection === "brand" ? (
                  <BrandCard key={r.id} record={r} />
                ) : (
                  <article className="info-card" key={r.id}>
                    {r.published!.image && (
                      <img
                        src={r.published!.image}
                        alt={r.published!.imageAlt}
                      />
                    )}
                    <span className="eyebrow">
                      {collection === "network"
                        ? relationshipLabels[r.published!.relationship]
                        : r.published!.category}
                    </span>
                    <h3>{r.published!.title}</h3>
                    <p>{r.published!.summary}</p>
                    <Prose text={r.published!.body} />
                    {r.published!.website && (
                      <a
                        href={r.published!.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link"
                      >
                        Visit website <ArrowUpRight size={16} />
                      </a>
                    )}
                  </article>
                ),
              )}
            </div>
          )}
          {collection && entries.length === 0 && (
            <div className="empty-public">
              <Layers size={28} />
              <p>More information will be shared here soon.</p>
              <Link className="text-link" href="/contact">
                Contact us <ArrowUpRight size={16} />
              </Link>
            </div>
          )}
        </section>
      )}
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
