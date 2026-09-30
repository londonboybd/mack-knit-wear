"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { associatesList } from "@/lib/data/site-data";
import { Reveal } from "./motion";

export function AssociatesDirectory() {
  return (
    <div className="associates-directory-page">
      {/* Directory Editorial Header */}
      <section className="directory-header-section" aria-label="Industrial Directory Intro">
        <div className="section-container">
          <Reveal delay={50}>
            <span className="hero-eyebrow">ACCREDITED MANUFACTURING NETWORK</span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="directory-title">
              Industrial Associates.
              <br />
              <span className="serif-accent">Collaborative capability in Bangladesh.</span>
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="directory-intro-text">
              Mack Knit Wear collaborates directly with three independent, accredited manufacturing associates in Bangladesh. Each partner brings specialized production discipline across composite knitting, large-scale assembly, and precision garment finishing.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Directory Listing Section */}
      <section className="directory-list-section" aria-label="Industrial Associates Directory">
        <div className="section-container">
          <div className="directory-table-head">
            <span className="th-number">INDEX</span>
            <span className="th-entity">ASSOCIATE ENTITY</span>
            <span className="th-location">FACILITY LOCATION</span>
            <span className="th-scope">MANUFACTURING SCOPE</span>
            <span className="th-action">OFFICIAL LINK</span>
          </div>

          <div className="directory-list-wrap">
            {associatesList.map((assoc, idx) => (
              <article
                key={assoc.number}
                className="associate-row-item"
                aria-labelledby={`assoc-name-${assoc.number}`}
              >
                {/* Number */}
                <div className="assoc-col-num">
                  <span className="assoc-number-text">{assoc.number}</span>
                </div>

                {/* Name & Typographic Mark */}
                <div className="assoc-col-name">
                  <div className="assoc-mark-wrap" aria-hidden="true">
                    <span className="assoc-mark">{assoc.displayMark}</span>
                  </div>
                  <div>
                    <h2 id={`assoc-name-${assoc.number}`} className="assoc-title">
                      {assoc.name}
                    </h2>
                    <span className="assoc-role-badge">{assoc.role}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="assoc-col-location">
                  <span className="col-mobile-label">LOCATION</span>
                  <span className="location-val">{assoc.location}</span>
                </div>

                {/* Confirmed Description */}
                <div className="assoc-col-desc">
                  <span className="col-mobile-label">SCOPE & OVERVIEW</span>
                  <p className="desc-text">{assoc.description}</p>
                </div>

                {/* Link */}
                <div className="assoc-col-link">
                  {assoc.website ? (
                    <a
                      href={assoc.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="assoc-external-btn"
                      aria-label={`Visit official website of ${assoc.name}`}
                    >
                      <span>Official Website</span>
                      <ArrowUpRight size={15} className="link-arrow-icon" />
                    </a>
                  ) : (
                    <span className="assoc-private-tag">Direct Facility Partner</span>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Relationship Transparency Notice */}
          <div className="directory-transparency-card">
            <div className="transparency-content">
              <h3>Governance & Partnership Integrity</h3>
              <p>
                Mack Knit Wear maintains direct contractual and technical collaboration with each named associate. We do not claim corporate ownership or exclusive production control over these independent facilities; relationships are founded on audited compliance, technical alignment, and reliable commercial execution.
              </p>
            </div>
            <div className="transparency-action">
              <Link href="/contact?type=Factory%20verification" className="button secondary-quiet">
                Verify associate capacity <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
