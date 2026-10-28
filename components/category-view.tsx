"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { londonBoyBrand, type Product } from "@/lib/data/site-data";
import { getProductsByCategory } from "@/lib/data/selectors";
import {
  SectionReveal,
  HeroEntrance,
  ImageReveal,
  BoundedParallax,
  StaggerGroup,
} from "./motion";

interface CategoryViewProps {
  categorySlug: "socks" | "innerwear";
}

export function CategoryView({ categorySlug }: CategoryViewProps) {
  const isSocks = categorySlug === "socks";
  const sceneData = isSocks
    ? londonBoyBrand.scenes.socks
    : londonBoyBrand.scenes.innerwear;

  const categoryProducts = getProductsByCategory(categorySlug);

  return (
    <div className={`category-page category-page-${categorySlug}`}>
      {/* Route back link */}
      <div className="section-container category-back-bar">
        <Link href="/brands/londonboy" className="back-link">
          <ArrowLeft size={16} /> Back to londonBoy
        </Link>
      </div>

      {isSocks ? (
        /* SOCKS EXPERIENCE: Strong vertical framing, category title aligned with narrow intro column */
        <section className="socks-header-section" aria-label="Socks Collection">
          <div className="section-container">
            <div className="socks-intro-grid">
              <div className="socks-narrative-col">
                <HeroEntrance delay={40} distance={10}>
                  <span className="category-subhead">londonBoy · Category 01</span>
                </HeroEntrance>

                <h1 className="category-main-title">SOCKS</h1>

                <HeroEntrance delay={100} distance={12}>
                  <p className="category-essence">
                    Vertical rhythm. Dense structural retention.
                  </p>
                </HeroEntrance>

                <HeroEntrance delay={160} distance={12}>
                  <p className="category-prose">
                    Knitted on precision circular machines in Bangladesh, our socks program is engineered with a continuous vertical rib structure that stays upright without aggressive elastic constriction. Every pair incorporates reinforced heel-and-toe shaping and hand-linked closures for durability and comfort.
                  </p>
                </HeroEntrance>

                <HeroEntrance delay={220} distance={10}>
                  <div className="category-specs-list">
                    <div className="spec-item">
                      <span className="spec-label">KNIT PROFILE</span>
                      <span className="spec-val">Engineered 3x1 Rib & Mercerized Flat</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">FINISHING</span>
                      <span className="spec-val">Hand-Linked Seamless Toe Closures</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">APPLICATION</span>
                      <span className="spec-val">Daily Wardrobe & Formal Tailoring</span>
                    </div>
                  </div>
                </HeroEntrance>

                <HeroEntrance delay={260} distance={10}>
                  <div className="category-inquiry-box">
                    <Link
                      href={`/contact?brand=londonBoy&type=Socks`}
                      className="button primary-dark"
                    >
                      Inquire about socks wholesale <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </HeroEntrance>
              </div>

              <div className="socks-visual-col">
                <div className="socks-vertical-frame">
                  <BoundedParallax offset={14}>
                    <ImageReveal
                      src={sceneData.image}
                      alt={sceneData.imageAlt}
                      aspectRatio="3/4"
                      priority={true}
                      className="socks-hero-image"
                    />
                  </BoundedParallax>
                  <div className="socks-image-annotation">
                    <span>Figure 1: High-gauge vertical rib silhouette</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* INNERWEAR EXPERIENCE: Wider, calmer opening composition, more open image spacing */
        <section className="innerwear-header-section" aria-label="Innerwear Collection">
          <div className="section-container">
            <div className="innerwear-intro-header">
              <HeroEntrance delay={40} distance={10}>
                <span className="category-subhead">londonBoy · Category 02</span>
              </HeroEntrance>
              <h1 className="category-main-title">INNERWEAR</h1>
              <HeroEntrance delay={100} distance={12}>
                <p className="category-essence-calm">
                  Combed natural cotton jersey. Clean garment framing in soft daylight.
                </p>
              </HeroEntrance>
            </div>

            <div className="innerwear-wide-visual-wrap">
              <BoundedParallax offset={14}>
                <ImageReveal
                  src={sceneData.image}
                  alt={sceneData.imageAlt}
                  aspectRatio="21/9"
                  priority={true}
                  className="innerwear-wide-image"
                />
              </BoundedParallax>
              <div className="innerwear-visual-caption">
                <span>Clean folded jersey framing & natural textile drape</span>
                <span>Combed single jersey · Dhaka</span>
              </div>
            </div>

            <SectionReveal delay={60}>
              <div className="innerwear-narrative-row">
                <div className="narrative-lead">
                  <h3>Base Layer Integrity</h3>
                  <p>
                    londonBoy innerwear focuses on the fundamental base layers. Crafted from long-staple combed cotton jersey, each garment features soft flatlock seams to prevent skin friction, stay-flat neck bindings, and comfortable relaxed tailoring.
                  </p>
                </div>

                <div className="narrative-action-box">
                  <p className="inquiry-hint">
                    Available for verified wholesale distributors, department stores, and private label partners.
                  </p>
                  <Link
                    href={`/contact?brand=londonBoy&type=Innerwear`}
                    className="button primary-dark"
                  >
                    Inquire about innerwear production <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>
      )}

      {/* Product Grid Section */}
      <section className="category-products-section" aria-label="Confirmed Products">
        <div className="section-container">
          <SectionReveal delay={40}>
            <div className="category-products-header">
              <h2 className="section-title">Confirmed Product Styles</h2>
              <span className="products-count">
                {categoryProducts.length} Confirmed Styles
              </span>
            </div>
          </SectionReveal>

          <StaggerGroup staggerInterval={60} className="category-product-grid">
            {categoryProducts.map((prod) => (
              <article key={prod.id} className="category-product-card">
                <Link href={`/products/${prod.slug}`} className="product-card-inner">
                  <div className="product-card-image-wrap">
                    <img src={prod.image} alt={prod.imageAlt} loading="lazy" />
                    <span className="product-ref-pill">{prod.refCode}</span>
                  </div>

                  <div className="product-card-body">
                    <span className="product-category-eyebrow">{prod.category}</span>
                    <h3 className="product-card-title">{prod.name}</h3>
                    <p className="product-card-summary">{prod.summary}</p>

                    <div className="product-card-footer">
                      <span className="card-link-text">
                        Inspect specifications <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </StaggerGroup>

          {/* Close-Up Detail Section */}
          <SectionReveal delay={60}>
            <div className="category-detail-callout">
              <div className="detail-callout-text">
                <h3>Tactile Verification & Sampling</h3>
                <p>
                  Physical yarn cards, gauge swatches, and pre-production samples are available upon request for confirmed commercial buyers.
                </p>
              </div>
              <Link
                href={`/contact?product=${encodeURIComponent(categoryProducts[0]?.name || categorySlug)}`}
                className="button secondary-quiet"
              >
                Request sample correspondence <ArrowUpRight size={16} />
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
