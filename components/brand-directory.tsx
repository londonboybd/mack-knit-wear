"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Layers } from "lucide-react";
import type { Content, RecordItem } from "@/lib/schema";

export function BrandDirectory({
  page,
  brands,
}: {
  page: Content;
  brands: RecordItem[];
}) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Extract unique categories
  const categories = Array.from(
    new Set(
      brands
        .map((b) => (b.published || b.draft).category)
        .filter((c): c is string => Boolean(c)),
    ),
  );

  const sortedBrands = [...brands].sort(
    (a, b) => (a.published || a.draft).order - (b.published || b.draft).order,
  );

  const filtered = sortedBrands.filter((b) => {
    if (selectedCategory === "all") return true;
    return (b.published || b.draft).category === selectedCategory;
  });

  return (
    <div className="brand-directory-wrap">
      {/* Editorial Introduction */}
      <section className="page-intro">
        <div className="eyebrow">
          <span className="line" />
          {page.eyebrow || "OUR BRANDS"}
        </div>
        <h1>{page.title || "The Mack Brand Portfolio"}</h1>
        <p>{page.summary || "Explore our independently directed fashion and knitwear labels."}</p>
      </section>

      {/* Category Filter Pills (if multiple categories exist) */}
      {categories.length > 1 && (
        <div className="category-filter-bar">
          <button
            type="button"
            className={`filter-pill ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            All brands ({brands.length})
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              className={`filter-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Brand Grid */}
      <section className="section brand-grid-section">
        <div className="brand-grid">
          {filtered.map((r) => {
            const c = r.published || r.draft;
            return (
              <article className="brand-card" key={r.id}>
                <Link href={`/brands/${r.slug}`} className="brand-card-link-wrap">
                  <div className="card-photo">
                    {c.image ? (
                      <img src={c.image} alt={c.imageAlt || c.title} loading="lazy" />
                    ) : (
                      <Layers size={64} />
                    )}
                    <span className="round-link" aria-hidden="true">
                      <ArrowUpRight />
                    </span>
                  </div>

                  <div className="card-meta">
                    <span className="eyebrow">{c.category || "OUR BRAND"}</span>
                    <span>Owned brand</span>
                  </div>

                  <h3>{c.title}</h3>
                  <p>{c.summary}</p>
                  <span className="text-link">
                    Explore brand <ArrowUpRight size={15} />
                  </span>
                </Link>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="empty-public">
            <Layers size={28} />
            <p>No brands currently found in this category.</p>
            <button
              type="button"
              className="text-link"
              onClick={() => setSelectedCategory("all")}
            >
              View all brands
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
