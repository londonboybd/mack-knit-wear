"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { aboutContent } from "@/lib/data/site-data";
import {
  SectionReveal,
  HeroEntrance,
  ImageReveal,
  InteractiveLink,
} from "./motion";

export function AboutJournal() {
  const [activeChapter, setActiveChapter] = useState(aboutContent.chapters[0].id);

  // Efficient active chapter tracking using IntersectionObserver instead of continuous scroll handlers
  useEffect(() => {
    const chapterEls = aboutContent.chapters
      .map((ch) => document.getElementById(`chapter-${ch.id}`))
      .filter(Boolean) as HTMLElement[];

    if (chapterEls.length === 0) return;

    const visibleMap = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id.replace("chapter-", "");
          if (entry.isIntersecting) {
            visibleMap.set(id, entry.boundingClientRect.top);
          } else {
            visibleMap.delete(id);
          }
        });

        if (visibleMap.size > 0) {
          let closestId = "";
          let closestDist = Infinity;
          visibleMap.forEach((top, id) => {
            const dist = Math.abs(top - 100);
            if (dist < closestDist) {
              closestDist = dist;
              closestId = id;
            }
          });
          if (closestId) {
            setActiveChapter(closestId);
          }
        }
      },
      {
        rootMargin: "-80px 0px -40% 0px",
        threshold: [0, 0.1, 0.5],
      }
    );

    chapterEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-journal-page">
      {/* Editorial Header */}
      <section className="journal-header-section" aria-label="Journal Introduction">
        <div className="section-container">
          <HeroEntrance delay={50}>
            <span className="hero-eyebrow">{aboutContent.eyebrow}</span>
          </HeroEntrance>
          <HeroEntrance delay={110}>
            <h1 className="journal-title">{aboutContent.title}</h1>
          </HeroEntrance>
          <HeroEntrance delay={170}>
            <p className="journal-intro-text">{aboutContent.intro}</p>
          </HeroEntrance>
        </div>
      </section>

      {/* Main Journal Reading Layout */}
      <section className="journal-reading-section">
        <div className="section-container journal-grid">
          {/* Desktop Sticky Chapter Index */}
          <aside className="journal-index-col" aria-label="Table of Contents">
            <div className="sticky-index-box">
              <span className="index-title">INDEX</span>
              <nav className="chapter-nav" aria-label="Chapters">
                <ol className="chapter-list">
                  {aboutContent.chapters.map((ch) => {
                    const isActive = activeChapter === ch.id;
                    return (
                      <li key={ch.id} className="chapter-nav-item">
                        <a
                          href={`#chapter-${ch.id}`}
                          className={`chapter-nav-link ${isActive ? "active" : ""}`}
                          aria-current={isActive ? "location" : undefined}
                          onClick={() => setActiveChapter(ch.id)}
                        >
                          <span className="ch-num">{ch.number}</span>
                          <span className="ch-name">{ch.title}</span>
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </nav>

              <div className="index-direct-contact">
                <span className="direct-label">Direct Correspondence</span>
                <p>inquiries@mackknitwear.com</p>
                <Link href="/contact" className="index-contact-link">
                  Prepare message <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </aside>

          {/* Reading Column */}
          <div className="journal-content-col">
            {/* Simple, readable mobile chapter chip navigation */}
            <nav className="mobile-chapter-nav" aria-label="Quick Chapters Navigation">
              {aboutContent.chapters.map((ch) => {
                const isActive = activeChapter === ch.id;
                return (
                  <a
                    key={ch.id}
                    href={`#chapter-${ch.id}`}
                    className={`mobile-chapter-chip ${isActive ? "active" : ""}`}
                    aria-current={isActive ? "location" : undefined}
                    onClick={() => setActiveChapter(ch.id)}
                  >
                    <span>{ch.number}</span>
                    <span>{ch.title}</span>
                  </a>
                );
              })}
            </nav>

            {aboutContent.chapters.map((ch, idx) => (
              <SectionReveal
                key={ch.id}
                delay={idx === 0 ? 40 : 60}
                className="journal-chapter-wrapper"
              >
                <article
                  id={`chapter-${ch.id}`}
                  className="journal-chapter-block"
                  aria-labelledby={`heading-${ch.id}`}
                >
                  <div className="chapter-marker-row">
                    <span className="chapter-badge">CHAPTER {ch.number}</span>
                    <div className="chapter-divider-line" />
                  </div>

                  <h2 id={`heading-${ch.id}`} className="chapter-heading">
                    {ch.title}
                  </h2>

                  <div className="chapter-prose">
                    {ch.content.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Offset Image after Chapter 01 */}
                  {idx === 0 && (
                    <div className="journal-offset-image-wrap">
                      <ImageReveal
                        src={aboutContent.image}
                        alt={aboutContent.imageAlt}
                        aspectRatio="16/9"
                        className="journal-detail-photo"
                        delay={80}
                      />
                      <div className="image-footnote">
                        <span>Detail: Tactile knit structure & loop definition</span>
                        <span className="footnote-tag">Dhaka Studio</span>
                      </div>
                    </div>
                  )}
                </article>
              </SectionReveal>
            ))}

            {/* Closing Editorial Note */}
            <SectionReveal delay={60}>
              <div className="journal-end-note">
                <span className="end-symbol">—</span>
                <p>
                  Mack Knit Wear is registered in Dhaka, Bangladesh. For trade inquiries, wholesale access to londonBoy, or associate manufacturing verification, please reach out to our corporate desk.
                </p>
                <Link href="/contact" className="button primary-dark">
                  Contact the trade desk <ArrowUpRight size={16} />
                </Link>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
