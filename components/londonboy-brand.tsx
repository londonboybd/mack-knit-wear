"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { londonBoyBrand, productsList } from "@/lib/data/site-data";
import {
  SectionReveal,
  HeroEntrance,
  ImageReveal,
  BoundedParallax,
  usePrefersReducedMotion,
} from "./motion";

export function LondonBoyBrand() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // Evaluates button disabled states based on actual scroll metrics
  const checkScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // 2px threshold to absorb browser sub-pixel rounding
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  // Measured step navigation: card width + gap dynamically computed
  const scrollByStep = useCallback(
    (direction: "prev" | "next") => {
      const el = carouselRef.current;
      if (!el) return;

      const firstCard = el.querySelector<HTMLElement>(".lb-showcase-card");
      let step = 320;
      if (firstCard) {
        const cardWidth = firstCard.getBoundingClientRect().width;
        const style = window.getComputedStyle(el);
        const gap = parseFloat(style.columnGap || style.gap) || 24;
        step = cardWidth + gap;
      }

      const offset = direction === "next" ? step : -step;
      el.scrollBy({
        left: offset,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [reducedMotion]
  );

  // Set up listeners and observers for layout changes, initial mount, and resize
  useEffect(() => {
    checkScroll();

    const el = carouselRef.current;
    if (!el) return;

    window.addEventListener("resize", checkScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        checkScroll();
      });
      resizeObserver.observe(el);
    }

    // Secondary check after web fonts / images settle
    const timer = setTimeout(checkScroll, 300);

    return () => {
      window.removeEventListener("resize", checkScroll);
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [checkScroll]);

  return (
    <div className="londonboy-signature-page">
      {/* 1. Opening: Large wordmark, short intro, apparel composition, generous negative space */}
      <section className="lb-hero-section" aria-label="londonBoy Brand Opening">
        <div className="section-container">
          <div className="lb-hero-meta">
            <HeroEntrance delay={40} distance={10}>
              <span className="lb-brand-label">
                SIGNATURE CONSUMER BRAND · BY MACK KNIT WEAR
              </span>
            </HeroEntrance>
            <HeroEntrance delay={80} distance={10}>
              <div className="lb-quick-category-nav" aria-label="Jump to category scene">
                <a href="#scene-socks" className="lb-nav-pill">
                  01 SOCKS
                </a>
                <a href="#scene-innerwear" className="lb-nav-pill">
                  02 INNERWEAR
                </a>
              </div>
            </HeroEntrance>
          </div>

          <div className="lb-hero-title-wrap">
            <HeroEntrance delay={110} distance={18}>
              <h1 className="lb-hero-wordmark">londonBoy</h1>
            </HeroEntrance>
            <HeroEntrance delay={170} distance={14}>
              <p className="lb-hero-tagline">{londonBoyBrand.tagline}</p>
            </HeroEntrance>
          </div>

          <div className="lb-hero-visual-composition">
            <div className="lb-composition-frame">
              {/* Subtle scroll-linked movement strictly bounded within the frame */}
              <BoundedParallax offset={18}>
                <ImageReveal
                  src={londonBoyBrand.heroImage}
                  alt={londonBoyBrand.heroImageAlt}
                  aspectRatio="21/9"
                  priority={true}
                  className="lb-hero-panoramic"
                />
              </BoundedParallax>
              <HeroEntrance delay={240} distance={8}>
                <div className="lb-visual-tagline">
                  <span>Material Architecture & Everyday Comfort</span>
                  <span>Dhaka, Bangladesh</span>
                </div>
              </HeroEntrance>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SOCKS Scene: Sharper, structured, vertical rhythm, high contrast with sticky composition on desktop */}
      <section
        id="scene-socks"
        className="lb-scene-section lb-scene-socks"
        aria-labelledby="scene-socks-heading"
      >
        <div className="section-container">
          <SectionReveal delay={40}>
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
                  <BoundedParallax offset={16}>
                    <ImageReveal
                      src={londonBoyBrand.scenes.socks.image}
                      alt={londonBoyBrand.scenes.socks.imageAlt}
                      aspectRatio="3/4"
                      className="scene-photo-socks"
                      delay={60}
                    />
                  </BoundedParallax>
                  <div className="scene-photo-badge">Vertical Knit Structure</div>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* 3. INNERWEAR Scene: Softer, lighter, relaxed garment framing with subtle bounded shift */}
      <section
        id="scene-innerwear"
        className="lb-scene-section lb-scene-innerwear"
        aria-labelledby="scene-innerwear-heading"
      >
        <div className="section-container">
          <SectionReveal delay={40}>
            <div className="scene-grid scene-grid-innerwear">
              <div className="scene-visual-col">
                <div className="scene-soft-frame">
                  <BoundedParallax offset={14}>
                    <ImageReveal
                      src={londonBoyBrand.scenes.innerwear.image}
                      alt={londonBoyBrand.scenes.innerwear.imageAlt}
                      aspectRatio="4/3"
                      className="scene-photo-innerwear"
                      delay={60}
                    />
                  </BoundedParallax>
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
          </SectionReveal>
        </div>
      </section>

      {/* 4. Selected Product Showcase: Measured step horizontal rail with CSS snap */}
      <section className="lb-showcase-section" aria-labelledby="showcase-heading">
        <div className="section-container">
          <SectionReveal delay={40}>
            <div className="showcase-header-row">
              <div>
                <span className="hero-eyebrow">SELECTED STYLES</span>
                <h2 id="showcase-heading" className="editorial-heading">
                  Everyday Wardrobe Showcase
                </h2>
              </div>

              <div className="showcase-carousel-controls" aria-label="Showcase rail navigation">
                <button
                  type="button"
                  className="carousel-arrow-btn"
                  onClick={() => scrollByStep("prev")}
                  disabled={!canScrollLeft}
                  aria-label="Scroll to previous products"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  className="carousel-arrow-btn"
                  onClick={() => scrollByStep("next")}
                  disabled={!canScrollRight}
                  aria-label="Scroll to next products"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {productsList.length === 0 ? (
              <div className="showcase-empty-state">
                <p>No confirmed products currently displayed.</p>
              </div>
            ) : (
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
                        <img
                          src={prod.image}
                          alt={prod.imageAlt}
                          loading="lazy"
                        />
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
            )}
          </SectionReveal>
        </div>
      </section>

      {/* 5. Editorial Brand Statement & Compact Inquiry Invitation */}
      <section className="lb-statement-section" aria-label="Brand Statement">
        <div className="section-container">
          <SectionReveal delay={40}>
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
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
