"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowUpRight, Filter, X } from "lucide-react";
import { productsList, type Product } from "@/lib/data/site-data";
import { Reveal } from "./motion";

interface ProductDirectoryProps {
  page?: any;
  products?: any[];
  allRecords?: any[];
}

export function ProductDirectory({ page, products, allRecords }: ProductDirectoryProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState<"all" | "socks" | "innerwear">(
    (searchParams.get("category") as "all" | "socks" | "innerwear") || "all"
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const handleCategoryChange = (cat: "all" | "socks" | "innerwear") => {
    setActiveCategory(cat);
    const params = new URLSearchParams();
    if (cat !== "all") params.set("category", cat);
    if (searchQuery) params.set("q", searchQuery);
    router.replace(`/products${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (query) params.set("q", query);
    router.replace(`/products${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const matchesCategory =
        activeCategory === "all" || p.categorySlug === activeCategory;
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.refCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="product-directory-page">
      {/* Catalogue Header */}
      <section className="catalogue-header-section" aria-label="Catalogue Header">
        <div className="section-container">
          <Reveal delay={50}>
            <span className="hero-eyebrow">PRACTICAL CATALOGUE</span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="catalogue-title">
              Confirmed Everyday Apparel.
              <br />
              <span className="serif-accent">Structured socks & combed innerwear.</span>
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="catalogue-intro-text">
              Direct access to confirmed garment specifications. Knitted and finished across our manufacturing network in Bangladesh.
            </p>
          </Reveal>

          {/* Practical Category Navigation & Search */}
          <div className="catalogue-controls-bar">
            <div className="category-pills-wrap" role="tablist" aria-label="Filter by Category">
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === "all"}
                className={`category-pill-btn ${activeCategory === "all" ? "active" : ""}`}
                onClick={() => handleCategoryChange("all")}
              >
                All Styles <span className="pill-count">({productsList.length})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === "socks"}
                className={`category-pill-btn ${activeCategory === "socks" ? "active" : ""}`}
                onClick={() => handleCategoryChange("socks")}
              >
                Socks <span className="pill-count">(2)</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === "innerwear"}
                className={`category-pill-btn ${activeCategory === "innerwear" ? "active" : ""}`}
                onClick={() => handleCategoryChange("innerwear")}
              >
                Innerwear <span className="pill-count">(2)</span>
              </button>
            </div>

            <div className="catalogue-search-wrap">
              <Search size={16} className="search-icon" aria-hidden="true" />
              <input
                type="search"
                className="catalogue-search-input"
                placeholder="Search style or SKU..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                aria-label="Filter products by name or code"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => handleSearchChange("")}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Catalogue Product Grid */}
      <section className="catalogue-grid-section" aria-label="Product Styles">
        <div className="section-container">
          <div className="catalogue-results-meta">
            <span>
              Showing <strong>{filteredProducts.length}</strong> confirmed style{filteredProducts.length === 1 ? "" : "s"}
            </span>
            {activeCategory !== "all" && (
              <button
                type="button"
                className="clear-cat-btn"
                onClick={() => handleCategoryChange("all")}
              >
                Reset filters
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="catalogue-empty-state">
              <p>No confirmed products matched your search criteria.</p>
              <button
                type="button"
                className="button secondary-quiet"
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
              >
                View all confirmed styles
              </button>
            </div>
          ) : (
            <div className="catalogue-product-grid">
              {filteredProducts.map((prod) => (
                <article key={prod.id} className="catalogue-product-card">
                  <div className="card-photo-box">
                    <img
                      src={prod.image}
                      alt={prod.imageAlt}
                      loading="lazy"
                      className="primary-product-img"
                    />
                    {prod.secondaryImage && (
                      <img
                        src={prod.secondaryImage}
                        alt=""
                        loading="lazy"
                        className="hover-secondary-img"
                        aria-hidden="true"
                      />
                    )}
                    <span className="card-badge-code">{prod.refCode}</span>
                  </div>

                  <div className="card-details-box">
                    <div className="card-top-row">
                      <span className="card-brand-tag">{prod.brand} · {prod.category}</span>
                    </div>

                    <h2 className="card-product-name">{prod.name}</h2>
                    <p className="card-product-summary">{prod.summary}</p>

                    <div className="card-actions-row">
                      <Link
                        href={`/products/${prod.slug}`}
                        className="button primary-dark card-specs-btn"
                      >
                        Inspect Specifications <ArrowUpRight size={15} />
                      </Link>

                      <Link
                        href={`/contact?product=${encodeURIComponent(prod.name)}&sku=${encodeURIComponent(prod.refCode)}&brand=${encodeURIComponent(prod.brand)}&type=Wholesale`}
                        className="button secondary-quiet card-inquire-btn"
                      >
                        Inquire
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
