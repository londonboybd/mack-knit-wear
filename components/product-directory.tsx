"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowUpRight, X } from "lucide-react";
import { productsList } from "@/lib/data/site-data";
import { getCategoryCounts } from "@/lib/data/selectors";
import { HeroEntrance } from "./motion";

type ValidCategory = "all" | "socks" | "innerwear";

function normalizeCategory(val: string | null): ValidCategory {
  if (!val) return "all";
  const lower = val.trim().toLowerCase();
  if (lower === "socks") return "socks";
  if (lower === "innerwear") return "innerwear";
  return "all";
}

export function ProductDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL params
  const urlCategory = normalizeCategory(searchParams.get("category"));
  const urlQuery = searchParams.get("q") || "";
  const urlBrand = searchParams.get("brand") || "";

  // Local state initialized and synced with URL
  const [activeCategory, setActiveCategory] = useState<ValidCategory>(urlCategory);
  const [searchQuery, setSearchQuery] = useState(urlQuery);

  // Synchronize state when user navigates using browser Back/Forward buttons
  useEffect(() => {
    setActiveCategory(urlCategory);
    setSearchQuery(urlQuery);
  }, [urlCategory, urlQuery]);

  const categoryCounts = useMemo(() => getCategoryCounts(), []);

  const updateUrl = (cat: ValidCategory, query: string) => {
    const params = new URLSearchParams();
    if (cat !== "all") params.set("category", cat);
    if (query.trim()) params.set("q", query.trim());
    if (urlBrand.trim()) params.set("brand", urlBrand.trim());

    const qs = params.toString();
    router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const handleCategoryChange = (cat: ValidCategory) => {
    setActiveCategory(cat);
    updateUrl(cat, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateUrl(activeCategory, query);
  };

  const handleResetFilters = () => {
    setActiveCategory("all");
    setSearchQuery("");
    const params = new URLSearchParams();
    if (urlBrand.trim()) params.set("brand", urlBrand.trim());
    const qs = params.toString();
    router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const matchesCategory =
        activeCategory === "all" || p.categorySlug === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.refCode.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      const matchesBrand =
        !urlBrand || p.brand.toLowerCase() === urlBrand.toLowerCase();
      return matchesCategory && matchesSearch && matchesBrand;
    });
  }, [activeCategory, searchQuery, urlBrand]);

  return (
    <div className="product-directory-page">
      {/* Catalogue Header */}
      <section className="catalogue-header-section" aria-label="Catalogue Header">
        <div className="section-container">
          <HeroEntrance delay={40}>
            <span className="hero-eyebrow">PRACTICAL CATALOGUE</span>
          </HeroEntrance>
          <HeroEntrance delay={100}>
            <h1 className="catalogue-title">
              Confirmed Everyday Apparel.
              <br />
              <span className="serif-accent">Structured socks & combed innerwear.</span>
            </h1>
          </HeroEntrance>
          <HeroEntrance delay={160}>
            <p className="catalogue-intro-text">
              Direct access to confirmed garment specifications. Knitted and finished across our manufacturing network in Bangladesh.
            </p>
          </HeroEntrance>

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
                All Styles <span className="pill-count">({categoryCounts.all})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === "socks"}
                className={`category-pill-btn ${activeCategory === "socks" ? "active" : ""}`}
                onClick={() => handleCategoryChange("socks")}
              >
                Socks <span className="pill-count">({categoryCounts.socks})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === "innerwear"}
                className={`category-pill-btn ${activeCategory === "innerwear" ? "active" : ""}`}
                onClick={() => handleCategoryChange("innerwear")}
              >
                Innerwear <span className="pill-count">({categoryCounts.innerwear})</span>
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
                  aria-label="Clear search query"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Catalogue Product Grid: Instantaneous filter updates without replay layout thrashing */}
      <section className="catalogue-grid-section" aria-label="Product Styles">
        <div className="section-container">
          <div className="catalogue-results-meta">
            <span>
              Showing <strong>{filteredProducts.length}</strong> confirmed style
              {filteredProducts.length === 1 ? "" : "s"}
              {urlBrand && ` for brand ${urlBrand}`}
            </span>
            {(activeCategory !== "all" || searchQuery || urlBrand) && (
              <button
                type="button"
                className="clear-cat-btn"
                onClick={handleResetFilters}
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
                onClick={handleResetFilters}
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
                    {prod.secondaryImage && prod.secondaryImage !== prod.image && (
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

                  <div className="card-body-content">
                    <span className="card-cat-name">{prod.category}</span>
                    <h2 className="card-title-link">
                      <Link href={`/products/${prod.slug}`}>{prod.name}</Link>
                    </h2>
                    <p className="card-summary-desc">{prod.summary}</p>

                    <div className="card-actions-row">
                      <Link
                        href={`/products/${prod.slug}`}
                        className="button primary-dark card-inquire-btn"
                      >
                        Specifications & Inquiry
                      </Link>
                      <Link
                        href={`/contact?brand=${encodeURIComponent(
                          prod.brand
                        )}&product=${encodeURIComponent(
                          prod.name
                        )}&sku=${encodeURIComponent(prod.refCode)}`}
                        className="quick-inquire-link"
                        aria-label={`Inquire about ${prod.name}`}
                      >
                        Inquire <ArrowUpRight size={14} />
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
