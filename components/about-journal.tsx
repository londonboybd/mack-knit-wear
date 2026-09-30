"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { aboutContent } from "@/lib/data/site-data";
import { ImageReveal, Reveal } from "./motion";

export function AboutJournal() {
  const [activeChapter, setActiveChapter] = useState(aboutContent.chapters[0].id);

  useEffect(() => {
    const handleScroll = () => {
      const chapterElements = aboutContent.chapters.map((ch) => ({
        id: ch.id,
        el: document.getElementById(`chapter-${ch.id}`),
      }));

      const scrollPosition = window.scrollY + 200;

      for (let i = chapterElements.length - 1; i >= 0; i--) {
        const item = chapterElements[i];
        if (item.el && item.el.offsetTop <= scrollPosition) {
          setActiveChapter(item.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="about-journal-page">
      {/* Editorial Header */}
      <section className="journal-header-section" aria-label="Journal Introduction">
        <div className="section-container">
          <Reveal delay={50}>
            <span className="hero-eyebrow">{aboutContent.eyebrow}</span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="journal-title">{aboutContent.title}</h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="journal-intro-text">{aboutContent.intro}</p>
          </Reveal>
        </div>
      </section>

      {/* Main Journal Reading Layout */}
      <section className="journal-reading-section">
        <div className="section-container journal-grid">
          {/* Desktop Sticky Chapter Index / Mobile Anchors */}
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
          <main className="journal-content-col">
            {aboutContent.chapters.map((ch, idx) => (
              <article
                key={ch.id}
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
                    />
                    <div className="image-footnote">
                      <span>Detail: Tactile knit structure & loop definition</span>
                      <span className="footnote-tag">Dhaka Studio</span>
                    </div>
                  </div>
                )}
              </article>
            ))}

            {/* Closing Editorial Note */}
            <div className="journal-end-note">
              <span className="end-symbol">—</span>
              <p>
                Mack Knit Wear is registered in Dhaka, Bangladesh. For trade inquiries, wholesale access to londonBoy, or associate manufacturing verification, please reach out to our corporate desk.
              </p>
              <Link href="/contact" className="button primary-dark">
                Contact the trade desk <ArrowUpRight size={16} />
              </Link>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
