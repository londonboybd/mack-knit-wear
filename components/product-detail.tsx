"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Product, ProductGalleryItem } from "@/lib/data/types";
import { getRelatedProducts } from "@/lib/data/selectors";
import { SectionReveal, StaggerGroup } from "./motion";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  // Related products
  const relatedProducts = getRelatedProducts(product, 2);

  // Compile image gallery
  const allImages: ProductGalleryItem[] = [];
  if (product.gallery && product.gallery.length > 0) {
    allImages.push(...product.gallery);
  } else {
    allImages.push({
      image: product.image,
      alt: product.imageAlt || product.name,
      caption: product.name,
    });
    if (product.secondaryImage && product.secondaryImage !== product.image) {
      allImages.push({
        image: product.secondaryImage,
        alt: `${product.name} detail view`,
        caption: "Secondary View",
      });
    }
  }

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const activeImage = allImages[activeImageIndex] || allImages[0];

  // Handle lightbox keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") {
        setLightboxOpen(false);
        triggerButtonRef.current?.focus();
      } else if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) => (prev + 1) % allImages.length);
      } else if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      }
    };

    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, allImages.length]);

  return (
    <div className="product-detail-page">
      {/* Breadcrumb Navigation */}
      <nav className="product-breadcrumb-nav" aria-label="Breadcrumb">
        <div className="section-container">
          <ol className="breadcrumb-list">
            <li>
              <Link href="/products">Product catalogue</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/brands/${product.brand.toLowerCase()}/${product.categorySlug}`}>
                {product.category}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="active-crumb">
              {product.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* Main Product Overview */}
      <section className="product-overview-section" aria-label="Product Specifications">
        <div className="section-container product-overview-layout">
          {/* Left Column: Visuals & Gallery */}
          <div className="product-visuals-col">
            <div className="main-image-wrap">
              {/* Short image crossfade on gallery changes */}
              <img
                key={activeImage.image}
                src={activeImage.image}
                alt={activeImage.alt || product.name}
                className="main-display-img gallery-crossfade-img"
              />
              <button
                ref={triggerButtonRef}
                type="button"
                className="enlarge-image-btn"
                onClick={() => setLightboxOpen(true)}
                aria-label={`Enlarge ${activeImage.caption || product.name}`}
              >
                <Maximize2 size={16} /> Enlarge
              </button>
            </div>

            {/* Thumbnail Strip (if multiple images) */}
            {allImages.length > 1 && (
              <div
                className="product-thumbnails-strip"
                role="tablist"
                aria-label="Product Image Views"
              >
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={activeImageIndex === idx}
                    className={`thumbnail-btn ${
                      activeImageIndex === idx ? "selected" : ""
                    }`}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View photo ${idx + 1}: ${img.caption || ""}`}
                  >
                    <img src={img.image} alt="" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Specifications */}
          <div className="product-info-col">
            <div className="product-meta-header">
              <span className="card-cat-name">{product.category}</span>
              <span className="ref-code-tag">REF: {product.refCode}</span>
            </div>

            <h1 className="product-primary-title">{product.name}</h1>

            <p className="product-summary large-copy">{product.summary}</p>

            {/* Commercial Action Box */}
            <div className="product-cta-box">
              <Link
                href={`/contact?brand=${encodeURIComponent(
                  product.brand
                )}&product=${encodeURIComponent(
                  product.name
                )}&sku=${encodeURIComponent(product.refCode)}`}
                className="button primary-dark"
              >
                Inquire about this product <ArrowRight size={16} />
              </Link>
              <span className="cta-assurance">
                Direct trade correspondence with our Dhaka production desk.
              </span>
            </div>

            {/* Editorial Description */}
            <div className="product-description-block">
              <h3>Description & Construction</h3>
              <p>{product.description}</p>
            </div>

            {/* Technical Specifications (Conditional Rendering) */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="product-spec-block">
                <h3>Technical Specifications</h3>
                <dl className="specs-dl-grid">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="spec-row">
                      <dt>{spec.label}</dt>
                      <dd>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products from same category */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section" aria-label="Related Styles">
          <div className="section-container">
            <SectionReveal delay={40}>
              <div className="related-header">
                <h2 className="related-title">
                  Related {product.category} Styles
                </h2>
                <Link
                  href={`/products?category=${product.categorySlug}`}
                  className="view-category-link"
                >
                  View all {product.category.toLowerCase()} <ArrowRight size={14} />
                </Link>
              </div>
            </SectionReveal>

            <StaggerGroup staggerInterval={60} className="related-grid">
              {relatedProducts.map((rel) => (
                <article key={rel.id} className="related-product-card">
                  <div className="related-card-img-wrap">
                    <img src={rel.image} alt={rel.imageAlt} loading="lazy" />
                    <span className="card-badge-code">{rel.refCode}</span>
                  </div>
                  <div className="related-card-info">
                    <h3>
                      <Link href={`/products/${rel.slug}`}>{rel.name}</Link>
                    </h3>
                    <p>{rel.summary}</p>
                    <Link
                      href={`/products/${rel.slug}`}
                      className="related-action-link"
                    >
                      View style <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Image Lightbox"
        >
          <div className="lightbox-backdrop" onClick={() => setLightboxOpen(false)} />
          <div className="lightbox-container">
            <button
              ref={closeButtonRef}
              type="button"
              className="lightbox-close-btn"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close lightbox"
            >
              <X size={24} />
            </button>

            <div className="lightbox-image-box">
              <img
                src={activeImage.image}
                alt={activeImage.alt || product.name}
              />
              {activeImage.caption && (
                <div className="lightbox-caption">
                  <span>{activeImage.caption}</span>
                  <small>
                    {activeImageIndex + 1} / {allImages.length}
                  </small>
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="lightbox-nav-controls">
                <button
                  type="button"
                  className="lightbox-prev-btn"
                  onClick={() =>
                    setActiveImageIndex(
                      (prev) => (prev - 1 + allImages.length) % allImages.length
                    )
                  }
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  className="lightbox-next-btn"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev + 1) % allImages.length)
                  }
                  aria-label="Next photo"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
