"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import {
  homeContent,
  londonBoyBrand,
  associatesList,
} from "@/lib/data/site-data";
import { Reveal, StaggerGroup, ImageReveal, InteractiveLink } from "./motion";

export function HomeView() {
  return (
    <div className="home-editorial">
      {/* 1. Asymmetric Opening Screen */}
      <section className="home-hero-section" aria-label="Introduction">
        <div className="home-hero-container">
          <div className="home-hero-left">
            <Reveal delay={50} direction="up" distance={16}>
              <span className="hero-eyebrow">MACK KNIT WEAR · DHAKA</span>
            </Reveal>

            <Reveal delay={120} direction="up" distance={20}>
              <h1 className="home-hero-headline">
                Everyday essentials.
                <br />
                <span className="serif-accent">A distinct point of view.</span>
              </h1>
            </Reveal>

            <Reveal delay={200} direction="up" distance={16}>
              <p className="home-hero-subhead">
                A composed textile portfolio with a distinct consumer-brand
                experience inside it. Engineered in Dhaka for international
                distribution.
              </p>
            </Reveal>

            <Reveal delay={280} direction="up" distance={16}>
              <div className="home-hero-actions">
                <Link
                  href="/brands/londonboy"
                  className="button primary-dark"
                  aria-label="Explore londonBoy brand"
                >
                  Explore londonBoy <ArrowUpRight size={16} />
                </Link>
                <a
                  href="#mack-intro"
                  className="button secondary-quiet"
                  aria-label="Meet Mack Knit Wear enterprise"
                >
                  Meet Mack Knit Wear
                </a>
              </div>
            </Reveal>
          </div>

          <div className="home-hero-right">
            <Reveal delay={200} direction="none">
              <div className="hero-image-frame">
                <ImageReveal
                  src={homeContent.heroImage}
                  alt={homeContent.heroImageAlt}
                  aspectRatio="16/10"
                  className="hero-main-photo"
                />
                <div className="hero-image-caption">
                  <span>Tactile Knitwear & Cotton Essentials</span>
                  <span className="caption-tag">Dhaka Studio</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 2. Mack Knit Wear Introduction: Well-Spaced Text Section */}
      <section
        id="mack-intro"
        className="mack-intro-section"
        aria-labelledby="mack-intro-heading"
      >
        <div className="section-container">
          <Reveal delay={50}>
            <div className="section-eyebrow">
              <span className="eyebrow-line" />
              <span>{homeContent.mackIntro.eyebrow}</span>
            </div>
          </Reveal>

          <div className="mack-intro-grid">
            <Reveal delay={100} className="intro-title-col">
              <h2 id="mack-intro-heading" className="editorial-heading">
                {homeContent.mackIntro.heading}
              </h2>
            </Reveal>

            <Reveal delay={180} className="intro-text-col">
              <p className="lead-paragraph">{homeContent.mackIntro.body}</p>
              <div className="intro-link-wrap">
                <InteractiveLink href="/about" className="link-subtle">
                  Read the company journal
                </InteractiveLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. Substantial londonBoy Feature with Contrasting Dark Surface */}
      <section
        className="londonboy-feature-section"
        aria-labelledby="londonboy-feature-title"
      >
        <div className="section-container">
          <div className="londonboy-feature-card">
            <div className="lb-feature-header">
              <div>
                <span className="lb-eyebrow">
                  {homeContent.londonBoyFeature.eyebrow}
                </span>
                <h2 id="londonboy-feature-title" className="lb-display-title">
                  {homeContent.londonBoyFeature.name}
                </h2>
              </div>
              <p className="lb-tagline">
                {homeContent.londonBoyFeature.tagline}
              </p>
            </div>

            <div className="lb-feature-body">
              <p>{homeContent.londonBoyFeature.description}</p>
              <div className="lb-action-wrap">
                <Link
                  href="/brands/londonboy"
                  className="button lb-action-btn"
                  aria-label="Enter londonBoy brand experience"
                >
                  Enter londonBoy <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Deliberate Category Entrances: Socks & Innerwear */}
            <div className="lb-categories-grid">
              {homeContent.londonBoyFeature.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className={`lb-category-card lb-category-${cat.id}`}
                  aria-label={`Explore ${cat.name} category`}
                >
                  <div className="category-photo-wrapper">
                    <img
                      src={cat.image}
                      alt={cat.imageAlt}
                      loading="lazy"
                      className="category-photo"
                    />
                    <span className="category-badge">Category Entrance</span>
                  </div>
                  <div className="category-card-content">
                    <div className="category-title-row">
                      <h3 className="category-name">{cat.name}</h3>
                      <span className="category-arrow" aria-hidden="true">
                        <ArrowUpRight size={18} />
                      </span>
                    </div>
                    <p className="category-tagline">{cat.tagline}</p>
                    <p className="category-desc">{cat.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Compact Associates Preview */}
      <section
        className="associates-preview-section"
        aria-labelledby="associates-preview-title"
      >
        <div className="section-container">
          <div className="preview-header-row">
            <div>
              <div className="section-eyebrow">
                <span className="eyebrow-line" />
                <span>{homeContent.associatesPreview.eyebrow}</span>
              </div>
              <h2 id="associates-preview-title" className="editorial-heading">
                {homeContent.associatesPreview.heading}
              </h2>
            </div>
            <p className="preview-header-desc">
              {homeContent.associatesPreview.description}
            </p>
          </div>

          <div className="associates-preview-grid">
            {associatesList.map((assoc) => (
              <div key={assoc.number} className="associate-preview-item">
                <div className="assoc-num">{assoc.number}</div>
                <div className="assoc-body">
                  <h3 className="assoc-name">{assoc.name}</h3>
                  <span className="assoc-location">{assoc.location}</span>
                  <p className="assoc-summary">{assoc.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="preview-cta-wrap">
            <InteractiveLink
              href={homeContent.associatesPreview.cta.href}
              className="link-subtle"
            >
              {homeContent.associatesPreview.cta.label}
            </InteractiveLink>
          </div>
        </div>
      </section>

      {/* 5. Concise Contact Invitation */}
      <section
        className="home-contact-section"
        aria-labelledby="home-contact-title"
      >
        <div className="section-container">
          <div className="home-contact-card">
            <div>
              <div className="section-eyebrow">
                <span className="eyebrow-line" />
                <span>{homeContent.contactPrompt.eyebrow}</span>
              </div>
              <h2 id="home-contact-title" className="editorial-heading">
                {homeContent.contactPrompt.heading}
              </h2>
              <p className="home-contact-desc">
                {homeContent.contactPrompt.body}
              </p>
            </div>
            <div className="home-contact-action">
              <Link
                href={homeContent.contactPrompt.cta.href}
                className="button primary-dark"
              >
                {homeContent.contactPrompt.cta.label} <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
