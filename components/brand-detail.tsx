import React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, ExternalLink, Layers, Sparkles } from "lucide-react";
import type { Content, RecordItem } from "@/lib/schema";
import { ProductCarousel } from "./product-carousel";
import { SafeRichText } from "./section-renderer";

export function BrandDetail({
  brand,
  allRecords = [],
}: {
  brand: RecordItem;
  allRecords?: RecordItem[];
}) {
  const content = brand.published || brand.draft;

  // Find featured collection if assigned
  const collection = allRecords.find(
    (r) =>
      r.kind === "collection" &&
      (r.id === content.featuredCollectionId || r.slug === content.featuredCollectionId) &&
      r.published,
  );
  const collectionContent = collection ? (collection.published || collection.draft) : null;

  // Resolve selected products for this brand (only published ones for public visitors)
  const selectedProductIds = content.selectedProductIds || [];
  const brandProducts = allRecords.filter(
    (r) =>
      r.kind === "product" &&
      r.published &&
      (selectedProductIds.includes(r.id) ||
        (r.published.brandId === brand.id && selectedProductIds.length === 0)),
  );

  // If a featured collection exists, resolve its products
  const collectionProductIds = collectionContent?.productIds || [];
  const collectionProducts = allRecords.filter(
    (r) => r.kind === "product" && r.published && collectionProductIds.includes(r.id),
  );

  // External link handling: combine if identical, hide if empty
  const hasWebsite = Boolean(content.website);
  const hasStore = Boolean(content.store);
  const sameDestination = hasWebsite && hasStore && content.website === content.store;

  const galleryItems = content.gallery || [];

  return (
    <article className="brand-detail-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/brands">Our brands</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{content.title}</span>
      </nav>

      {/* Brand Hero & Positioning */}
      <section className="brand-hero-section">
        <div className="brand-hero-header">
          <div className="brand-identity-box">
            {content.brandLogo ? (
              <img
                src={content.brandLogo}
                alt={content.brandLogoAlt || `${content.title} logo`}
                className="brand-official-logo"
              />
            ) : (
              <span className="brand-logo-text-monogram">{content.title.slice(0, 2).toUpperCase()}</span>
            )}
            <div>
              <span className="eyebrow">{content.eyebrow || "OWNED BRAND"}</span>
              <h1>{content.title}</h1>
            </div>
          </div>

          <p className="brand-lead-summary">{content.summary}</p>

          {/* External Links & Inquiries */}
          <div className="brand-actions-bar">
            {sameDestination ? (
              <a
                className="button dark"
                href={content.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit official website & shop <ExternalLink size={16} />
              </a>
            ) : (
              <>
                {hasWebsite && (
                  <a
                    className="button dark"
                    href={content.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit official website <ExternalLink size={16} />
                  </a>
                )}
                {hasStore && (
                  <a
                    className="button outline"
                    href={content.store}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Online shop <ArrowUpRight size={16} />
                  </a>
                )}
              </>
            )}

            <Link
              href={`/contact?brand=${encodeURIComponent(content.title)}&type=Wholesale`}
              className="text-link"
            >
              Wholesale & stockist inquiry <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        {content.image && (
          <div className="brand-hero-imagery">
            <img
              src={content.image}
              alt={content.imageAlt || content.title}
              fetchPriority="high"
            />
          </div>
        )}
      </section>

      {/* Brand Story Prose */}
      {content.body && (
        <section className="section brand-story-section">
          <div className="editorial-container">
            <span className="eyebrow">THE BRAND STORY</span>
            <div className="prose">
              {content.body.split("\n").filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Collection Spotlight */}
      {collectionContent && (
        <section className="section featured-collection-spotlight">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{collectionContent.season || "FEATURED COLLECTION"}</span>
              <h2>{collectionContent.title}</h2>
              {collectionContent.summary && <p>{collectionContent.summary}</p>}
            </div>
          </div>

          <div className="collection-spotlight-grid">
            {collectionContent.image && (
              <div className="collection-cover">
                <img
                  src={collectionContent.image}
                  alt={collectionContent.imageAlt || collectionContent.title}
                  loading="lazy"
                />
              </div>
            )}
            <div className="collection-prose-col">
              <SafeRichText content={collectionContent.body} />
              <Link
                href={`/contact?brand=${encodeURIComponent(content.title)}&type=Wholesale`}
                className="button dark small"
              >
                Inquire about this collection <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          {collectionProducts.length > 0 && (
            <div className="collection-carousel-wrap">
              <ProductCarousel
                products={collectionProducts}
                title={`${collectionContent.title} Collection Products`}
              />
            </div>
          )}
        </section>
      )}

      {/* Selected Products Carousel */}
      {brandProducts.length > 0 && (
        <section className="section brand-products-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SELECTED PIECES</span>
              <h2>Knitwear from {content.title}</h2>
              <p>Explore technical craftsmanship and available retail designs.</p>
            </div>
            <Link
              href={`/products?brand=${encodeURIComponent(content.title)}`}
              className="text-link"
            >
              All {content.title} products <ArrowUpRight size={16} />
            </Link>
          </div>
          <ProductCarousel products={brandProducts} title={`${content.title} Products`} />
        </section>
      )}

      {/* Materials & Craftsmanship Section */}
      {content.craftsmanshipTitle && (
        <section className="section craftsmanship-section">
          <div className="craftsmanship-grid">
            <div className="craftsmanship-copy">
              <span className="eyebrow">MATERIALS & CRAFTSMANSHIP</span>
              <h2>{content.craftsmanshipTitle}</h2>
              {content.craftsmanshipSummary && (
                <p className="large-copy">{content.craftsmanshipSummary}</p>
              )}
              {content.craftsmanshipBody && (
                <div className="prose">
                  {content.craftsmanshipBody.split("\n").filter(Boolean).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
            </div>
            {content.craftsmanshipImage && (
              <div className="craftsmanship-image">
                <img
                  src={content.craftsmanshipImage}
                  alt={content.craftsmanshipImageAlt || content.craftsmanshipTitle}
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Lookbook / Gallery */}
      {galleryItems.length > 0 && (
        <section className="section lookbook-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">LOOKBOOK & DETAILS</span>
              <h2>Visual Catalogue</h2>
            </div>
          </div>
          <div className="gallery-masonry">
            {galleryItems.map((g, idx) => (
              <figure className="gallery-figure" key={g.id || idx}>
                <img src={g.image} alt={g.alt || `${content.title} lookbook`} loading="lazy" />
                {g.caption && <figcaption>{g.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Wholesale / Partnership Action Footer Band */}
      <section className="contact-band">
        <span className="eyebrow">COLLABORATION & WHOLESALE</span>
        <div>
          <h2>Partner with {content.title}.</h2>
          <Link
            href={`/contact?brand=${encodeURIComponent(content.title)}&type=Wholesale`}
            className="button light"
          >
            Submit wholesale inquiry <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </article>
  );
}
