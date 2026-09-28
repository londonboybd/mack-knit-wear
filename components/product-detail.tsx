"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Maximize2,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import type { Content, RecordItem, GalleryItem } from "@/lib/schema";
import { ProductCarousel } from "./product-carousel";

export function ProductDetail({
  product,
  allRecords = [],
}: {
  product: RecordItem;
  allRecords?: RecordItem[];
}) {
  const content = product.published || product.draft;

  // Resolve brand if assigned
  const brand = allRecords.find(
    (r) => r.kind === "brand" && r.id === content.brandId && r.published,
  );
  const brandContent = brand ? (brand.published || brand.draft) : null;

  // Compile image gallery (main image + gallery items)
  const allImages: GalleryItem[] = [];
  if (content.image) {
    allImages.push({
      id: "main-photo",
      image: content.image,
      alt: content.imageAlt || content.title,
      caption: content.title,
    });
  }
  if (content.gallery && content.gallery.length > 0) {
    content.gallery.forEach((g, idx) => {
      if (g.image) {
        allImages.push({
          id: g.id || `gallery-${idx}`,
          image: g.image,
          alt: g.alt || `${content.title} photograph ${idx + 1}`,
          caption: g.caption || "",
        });
      }
    });
  }

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Accessible lightbox keyboard navigation (Escape to close, Left/Right arrow to cycle)
  useEffect(() => {
    if (!lightboxOpen) return;

    // Focus the close button when lightbox opens
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        triggerButtonRef.current?.focus();
      } else if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      } else if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) => (prev + 1) % allImages.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, allImages.length]);

  const activeImage = allImages[activeImageIndex] || allImages[0];

  // Resolve related products in the same category or brand
  const relatedProducts = allRecords.filter(
    (r) =>
      r.kind === "product" &&
      r.id !== product.id &&
      r.published &&
      ((r.published.category && r.published.category === content.category) ||
        (content.brandId && r.published.brandId === content.brandId)),
  );

  return (
    <article className="product-detail-page">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/products">Product catalogue</Link>
        <span aria-hidden="true">/</span>
        {content.category && (
          <>
            <Link href={`/products?category=${encodeURIComponent(content.category)}`}>
              {content.category}
            </Link>
            <span aria-hidden="true">/</span>
          </>
        )}
        <span aria-current="page">{content.title}</span>
      </nav>

      <div className="product-overview-layout">
        {/* Gallery Column */}
        <section className="product-visuals-col" aria-label="Product photography">
          <div className="product-main-display">
            {activeImage?.image ? (
              <div className="main-image-wrap">
                <img
                  src={activeImage.image}
                  alt={activeImage.alt}
                  fetchPriority="high"
                />
                <button
                  type="button"
                  ref={triggerButtonRef}
                  className="enlarge-image-btn"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Enlarge image view"
                  title="View enlarged photograph"
                >
                  <Maximize2 size={16} /> Enlarge
                </button>
              </div>
            ) : (
              <div className="product-main-placeholder">
                <Layers size={64} />
              </div>
            )}
            {activeImage?.caption && (
              <p className="image-caption-note">{activeImage.caption}</p>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {allImages.length > 1 && (
            <div className="product-thumbnails-strip" role="tablist" aria-label="Thumbnail gallery">
              {allImages.map((img, idx) => (
                <button
                  type="button"
                  key={img.id || idx}
                  role="tab"
                  aria-selected={idx === activeImageIndex}
                  aria-label={`Show image ${idx + 1}: ${img.alt}`}
                  className={`thumbnail-btn ${idx === activeImageIndex ? "selected" : ""}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={img.image} alt="" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Specifications & Details Column */}
        <section className="product-info-col">
          <div className="product-meta-header">
            {brand && brandContent ? (
              <Link href={`/brands/${brand.slug}`} className="brand-affiliation-badge">
                {brandContent.title}
              </Link>
            ) : (
              <span className="eyebrow">{content.category || "KNITWEAR"}</span>
            )}
            {content.refCode && <span className="ref-code-tag">REF: {content.refCode}</span>}
          </div>

          <h1 className="product-primary-title">{content.title}</h1>

          {content.summary && <p className="large-copy">{content.summary}</p>}

          {/* Inquiry Action Bar */}
          <div className="product-cta-box">
            <Link
              href={`/contact?product=${encodeURIComponent(content.title)}&sku=${encodeURIComponent(content.refCode || "")}&brand=${encodeURIComponent(brandContent?.title || "")}&type=Wholesale`}
              className="button dark"
            >
              Inquire about this product <ArrowRight size={17} />
            </Link>
            <span className="cta-assurance">Direct response from our Dhaka production desk</span>
          </div>

          {/* Materials & Composition */}
          {content.materials && (
            <div className="product-spec-block">
              <h3>Materials & Composition</h3>
              <p>{content.materials}</p>
            </div>
          )}

          {/* Available Sizes & Colors */}
          {(content.sizes?.length > 0 || content.colors?.length > 0) && (
            <div className="product-options-grid">
              {content.sizes?.length > 0 && (
                <div className="options-group">
                  <h4>Available Sizes</h4>
                  <div className="chips-row">
                    {content.sizes.map((s) => (
                      <span className="size-chip" key={s}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {content.colors?.length > 0 && (
                <div className="options-group">
                  <h4>Available Colourways</h4>
                  <div className="chips-row">
                    {content.colors.map((c) => (
                      <span className="color-chip" key={c}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {content.body && (
            <div className="product-spec-block">
              <h3>Description & Construction</h3>
              <div className="prose">
                {content.body.split("\n").filter(Boolean).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specifications Table */}
          {content.specifications && content.specifications.length > 0 && (
            <div className="product-spec-block">
              <h3>Structured Specifications</h3>
              <dl className="specs-dl-grid">
                {content.specifications.map((spec, idx) => (
                  <div className="spec-row" key={idx}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Manufacturing Parameters (MOQ & Lead Time) */}
          {(content.moq || content.leadTime) && (
            <div className="product-commercial-parameters">
              {content.moq && (
                <div className="param-item">
                  <span className="param-label">Minimum Order Quantity (MOQ)</span>
                  <strong>{content.moq}</strong>
                </div>
              )}
              {content.leadTime && (
                <div className="param-item">
                  <span className="param-label">Estimated Lead Time</span>
                  <strong>{content.leadTime}</strong>
                </div>
              )}
            </div>
          )}

          {/* Customization & Private Label */}
          {content.customization && (
            <div className="product-spec-block">
              <h3>Private Label & Customization</h3>
              <p>{content.customization}</p>
            </div>
          )}

          {/* Intended Use */}
          {content.intendedUse && (
            <div className="product-spec-block">
              <h3>Recommended Applications</h3>
              <p>{content.intendedUse}</p>
            </div>
          )}
        </section>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="section related-products-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">RELATED PRODUCTS</span>
              <h2>Complementary Knitwear</h2>
            </div>
          </div>
          <ProductCarousel products={relatedProducts} title="Related Products" />
        </section>
      )}

      {/* Accessible Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Enlarged view: ${activeImage?.alt}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setLightboxOpen(false);
              triggerButtonRef.current?.focus();
            }
          }}
        >
          <div className="lightbox-content-box">
            <div className="lightbox-top-bar">
              <span className="lightbox-counter">
                {activeImageIndex + 1} of {allImages.length}
              </span>
              <button
                type="button"
                ref={closeButtonRef}
                className="lightbox-close-btn"
                onClick={() => {
                  setLightboxOpen(false);
                  triggerButtonRef.current?.focus();
                }}
                aria-label="Close enlarged photograph view"
              >
                <X size={22} />
              </button>
            </div>

            <div className="lightbox-main-image-wrap">
              {allImages.length > 1 && (
                <button
                  type="button"
                  className="lightbox-nav-btn prev"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
                  }
                  aria-label="Previous photograph"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <img src={activeImage?.image} alt={activeImage?.alt} />

              {allImages.length > 1 && (
                <button
                  type="button"
                  className="lightbox-nav-btn next"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev + 1) % allImages.length)
                  }
                  aria-label="Next photograph"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {activeImage?.caption && (
              <p className="lightbox-caption">{activeImage.caption}</p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
