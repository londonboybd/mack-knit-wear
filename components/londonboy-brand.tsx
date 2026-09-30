"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { londonBoyBrand, productsList } from "@/lib/data/site-data";
import { Reveal, ImageReveal, InteractiveLink } from "./motion";

export function LondonBoyBrand() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollBy = (offset: number) => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div className="londonboy-signature-page">
      {/* 1. Opening: Large wordmark, short intro, apparel composition, generous negative space */}
      <section className="lb-hero-section" aria-label="londonBoy Brand Opening">
        <div className="section-container">
          <div className="lb-hero-meta">
            <span className="lb-brand-label">SIGNATURE CONSUMER BRAND · BY MACK KNIT WEAR</span>
            <div className="lb-quick-category-nav" aria-label="Jump to category scene">
              <a href="#scene-socks" className="lb-nav-pill">
                01 SOCKS
              </a>
              <a href="#scene-innerwear" className="lb-nav-pill">
                02 INNERWEAR
              </a>
            </div>
          </div>

          <div className="lb-hero-title-wrap">
            <h1 className="lb-hero-wordmark">londonBoy</h1>
            <p className="lb-hero-tagline">{londonBoyBrand.tagline}</p>
          </div>

          <div className="lb-hero-visual-composition">
            <div className="lb-composition-frame">
              <ImageReveal
                src={londonBoyBrand.heroImage}
                alt={londonBoyBrand.heroImageAlt}
                aspectRatio="21/9"
                className="lb-hero-panoramic"
              />
              <div className="lb-visual-tagline">
                <span>Material Architecture & Everyday Comfort</span>
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SOCKS Scene: Sharper, structured, vertical rhythm, high contrast */}
      <section
        id="scene-socks"
        className="lb-scene-section lb-scene-socks"
        aria-labelledby="scene-socks-heading"
      >
        <div className="section-container">
          <div className="scene-grid scene-grid-socks">
            <div className="scene-content-col">
              <span className="scene-eyebrow">CATEGORY 01</span>
              <h2 id="scene-socks-heading" className="scene-title">
                {londonBoyBrand.scenes.socks.title}
              </h2>
              <p className="scene-subtitle">{londonBoyBrand.scenes.socks.subtitle}</p>
              <p className="scene-description">{londonBoyBrand.scenes.socks.description}</p>

              <div className="scene-key-notes">
                <span className="notes-header">DESIGN CRITERIA</span>
                <ul>
                  {londonBoyBrand.scenes.socks.keyNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>

              <div className="scene-cta-wrap">
                <Link
                  href={londonBoyBrand.scenes.socks.cta.href}
                  className="button lb-white-btn"
                >
                  {londonBoyBrand.scenes.socks.cta.label} <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            <div className="scene-visual-col">
              <div className="scene-vertical-frame">
                <img
                  src={londonBoyBrand.scenes.socks.image}
                  alt={londonBoyBrand.scenes.socks.imageAlt}
                  loading="lazy"
                  className="scene-photo-socks"
                />
                <div className="scene-photo-badge">Vertical Knit Structure</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INNERWEAR Scene: Softer, lighter, relaxed garment framing */}
      <section
        id="scene-innerwear"
        className="lb-scene-section lb-scene-innerwear"
        aria-labelledby="scene-innerwear-heading"
      >
        <div className="section-container">
          <div className="scene-grid scene-grid-innerwear">
            <div className="scene-visual-col">
              <div className="scene-soft-frame">
                <img
                  src={londonBoyBrand.scenes.innerwear.image}
                  alt={londonBoyBrand.scenes.innerwear.imageAlt}
                  loading="lazy"
                  className="scene-photo-innerwear"
                />
                <div className="scene-photo-badge-light">Combed Cotton Jersey</div>
              </div>
            </div>

            <div className="scene-content-col">
              <span className="scene-eyebrow-light">CATEGORY 02</span>
              <h2 id="scene-innerwear-heading" className="scene-title-light">
                {londonBoyBrand.scenes.innerwear.title}
              </h2>
              <p className="scene-subtitle-light">{londonBoyBrand.scenes.innerwear.subtitle}</p>
              <p className="scene-description-light">
                {londonBoyBrand.scenes.innerwear.description}
              </p>

              <div className="scene-key-notes-light">
                <span className="notes-header">DESIGN CRITERIA</span>
                <ul>
                  {londonBoyBrand.scenes.innerwear.keyNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>

              <div className="scene-cta-wrap">
                <Link
                  href={londonBoyBrand.scenes.innerwear.cta.href}
                  className="button primary-dark"
                >
                  {londonBoyBrand.scenes.innerwear.cta.label} <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Selected Product Showcase: Manual draggable / accessible carousel */}
      <section className="lb-showcase-section" aria-labelledby="showcase-heading">
        <div className="section-container">
          <div className="showcase-header-row">
            <div>
              <span className="hero-eyebrow">SELECTED STYLES</span>
              <h2 id="showcase-heading" className="editorial-heading">
                Everyday Wardrobe Showcase
              </h2>
            </div>

            <div className="showcase-carousel-controls" aria-label="Showcase navigation">
              <button
                type="button"
                className="carousel-arrow-btn"
                onClick={() => scrollBy(-340)}
                disabled={!canScrollLeft}
                aria-label="Scroll previous products"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="carousel-arrow-btn"
                onClick={() => scrollBy(340)}
                disabled={!canScrollRight}
                aria-label="Scroll next products"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="lb-showcase-track"
            onScroll={checkScroll}
            tabIndex={0}
            role="region"
            aria-label="londonBoy Product Showcase Carousel"
          >
            {productsList.map((prod) => (
              <div key={prod.id} className="lb-showcase-card">
                <Link href={`/products/${prod.slug}`} className="showcase-card-link">
                  <div className="showcase-img-wrap">
                    <img src={prod.image} alt={prod.imageAlt} loading="lazy" />
                    <span className="showcase-category-tag">{prod.category}</span>
                  </div>
                  <div className="showcase-info">
                    <div className="showcase-code">{prod.refCode}</div>
                    <h3 className="showcase-title">{prod.name}</h3>
                    <p className="showcase-summary">{prod.summary}</p>
                    <span className="showcase-action">
                      View details <ArrowUpRight size={14} />
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Editorial Brand Statement & Compact Inquiry Invitation */}
      <section className="lb-statement-section" aria-label="Brand Statement">
        <div className="section-container">
          <div className="statement-card">
            <span className="statement-eyebrow">EDITORIAL STATEMENT</span>
            <blockquote className="statement-quote">
              “{londonBoyBrand.statement}”
            </blockquote>

            <div className="statement-divider" />

            <div className="statement-inquiry-box">
              <div className="inquiry-text-block">
                <h3>Commercial & Wholesale Partnerships</h3>
                <p>
                  Interested in stocking londonBoy socks or innerwear, or collaborating on private label distribution?
                </p>
              </div>
              <Link href="/contact?brand=londonBoy" className="button primary-dark">
                Prepare trade inquiry <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
