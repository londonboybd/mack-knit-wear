"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Layers } from "lucide-react";
import { londonBoyBrand } from "@/lib/data/site-data";
import { Reveal, ImageReveal } from "./motion";

export function BrandsPortfolio() {
  return (
    <div className="brands-portfolio-page">
      {/* Editorial Header */}
      <section className="portfolio-header-section" aria-label="Brand Exhibition Intro">
        <div className="section-container">
          <Reveal delay={50}>
            <span className="hero-eyebrow">PORTFOLIO EXHIBITION</span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="portfolio-title">
              One distinct brand vision.
              <br />
              <span className="serif-accent">Everyday essentials.</span>
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="portfolio-intro-text">
              Mack Knit Wear develops focused consumer brands with clear product mandates. Rather than diluting attention across generic labels, we engineer one premier signature brand: londonBoy.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Featured Brand Exhibition: londonBoy */}
      <section className="featured-brand-exhibition" aria-label="Featured Brand londonBoy">
        <div className="section-container">
          <div className="brand-exhibition-card">
            {/* Top Identity Row */}
            <div className="brand-exhibition-top">
              <div className="brand-id-group">
                <span className="brand-category-badge">{londonBoyBrand.category}</span>
                <h2 className="brand-wordmark-display">{londonBoyBrand.wordmark}</h2>
              </div>
              <p className="brand-tagline-display">{londonBoyBrand.tagline}</p>
            </div>

            {/* Split Composition: Imagery + Strategic Narrative */}
            <div className="brand-exhibition-split">
              <div className="brand-visual-feature">
                <ImageReveal
                  src={londonBoyBrand.heroImage}
                  alt={londonBoyBrand.heroImageAlt}
                  aspectRatio="16/10"
                  className="brand-hero-visual"
                />
                <div className="brand-visual-caption">
                  <span>londonBoy Material & Form Study</span>
                  <span className="visual-tag">Proprietary Label</span>
                </div>
              </div>

              <div className="brand-narrative-feature">
                <h3 className="narrative-heading">Focused Everyday Wardrobe</h3>
                <p className="narrative-body">{londonBoyBrand.summary}</p>
                <p className="narrative-statement">{londonBoyBrand.statement}</p>

                <div className="brand-primary-action">
                  <Link href="/brands/londonboy" className="button primary-dark">
                    Explore londonBoy <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Deliberate Category Entrances: SOCKS & INNERWEAR */}
            <div className="brand-categories-exhibition">
              <div className="categories-header-row">
                <h3 className="categories-label">CONFIRMED CATEGORIES</h3>
                <span className="categories-count">2 ESSENTIAL LINES</span>
              </div>

              <div className="categories-split-grid">
                {/* SOCKS */}
                <Link
                  href="/brands/londonboy/socks"
                  className="category-exhibition-item category-item-socks"
                  aria-label="Explore londonBoy Socks Collection"
                >
                  <div className="cat-image-box">
                    <img
                      src={londonBoyBrand.scenes.socks.image}
                      alt={londonBoyBrand.scenes.socks.imageAlt}
                      loading="lazy"
                    />
                    <span className="cat-badge">SOCKS</span>
                  </div>
                  <div className="cat-details">
                    <div className="cat-title-row">
                      <h4>{londonBoyBrand.scenes.socks.title}</h4>
                      <span className="cat-arrow" aria-hidden="true">
                        <ArrowUpRight size={18} />
                      </span>
                    </div>
                    <p className="cat-sub">{londonBoyBrand.scenes.socks.subtitle}</p>
                    <p className="cat-desc">{londonBoyBrand.scenes.socks.description}</p>
                    <span className="cat-enter-link">
                      View Socks Experience &rarr;
                    </span>
                  </div>
                </Link>

                {/* INNERWEAR */}
                <Link
                  href="/brands/londonboy/innerwear"
                  className="category-exhibition-item category-item-innerwear"
                  aria-label="Explore londonBoy Innerwear Collection"
                >
                  <div className="cat-image-box">
                    <img
                      src={londonBoyBrand.scenes.innerwear.image}
                      alt={londonBoyBrand.scenes.innerwear.imageAlt}
                      loading="lazy"
                    />
                    <span className="cat-badge">INNERWEAR</span>
                  </div>
                  <div className="cat-details">
                    <div className="cat-title-row">
                      <h4>{londonBoyBrand.scenes.innerwear.title}</h4>
                      <span className="cat-arrow" aria-hidden="true">
                        <ArrowUpRight size={18} />
                      </span>
                    </div>
                    <p className="cat-sub">{londonBoyBrand.scenes.innerwear.subtitle}</p>
                    <p className="cat-desc">{londonBoyBrand.scenes.innerwear.description}</p>
                    <span className="cat-enter-link">
                      View Innerwear Experience &rarr;
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Wholesale Notice */}
          <div className="brand-exhibition-footer-note">
            <div className="note-content">
              <h4>Wholesale & Stockist Inquiries</h4>
              <p>{londonBoyBrand.inquiryNotice}</p>
            </div>
            <Link href="/contact?brand=londonBoy" className="button secondary-quiet">
              Inquire regarding londonBoy <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
