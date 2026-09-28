"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, ArrowUpRight, Layers, SlidersHorizontal } from "lucide-react";
import type { Content, RecordItem } from "@/lib/schema";

const ITEMS_PER_PAGE = 9;

export function ProductDirectory({
  page,
  products,
  allRecords = [],
}: {
  page: Content;
  products: RecordItem[];
  allRecords?: RecordItem[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filter state from URL query parameters
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [brandFilter, setBrandFilter] = useState(searchParams.get("brand") || "all");
  const [pageNumber, setPageNumber] = useState(Number(searchParams.get("p")) || 1);

  // Sync state when URL searchParams change (handles Browser Back / Forward)
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setCategory(searchParams.get("category") || "all");
    setBrandFilter(searchParams.get("brand") || "all");
    setPageNumber(Number(searchParams.get("p")) || 1);
  }, [searchParams]);

  // Push state updates to URL so filters are shareable and survive back navigation
  const updateUrl = (newQuery: string, newCat: string, newBrand: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newQuery) params.set("q", newQuery);
    if (newCat && newCat !== "all") params.set("category", newCat);
    if (newBrand && newBrand !== "all") params.set("brand", newBrand);
    if (newPage > 1) params.set("p", String(newPage));

    const stringified = params.toString();
    router.replace(`/products${stringified ? `?${stringified}` : ""}`, { scroll: false });
  };

  // Extract unique categories and owned brands
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const c = p.published || p.draft;
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [products]);

  const brands = useMemo(() => {
    return allRecords.filter((r) => r.kind === "brand");
  }, [allRecords]);

  // Filter and sort products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const c = p.published || p.draft;
      const matchesSearch =
        !query ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.refCode?.toLowerCase().includes(query.toLowerCase()) ||
        c.materials?.toLowerCase().includes(query.toLowerCase()) ||
        c.summary?.toLowerCase().includes(query.toLowerCase());

      const matchesCategory = category === "all" || c.category === category;

      let matchesBrand = true;
      if (brandFilter !== "all") {
        const matchedBrand = brands.find(
          (b) => b.id === brandFilter || (b.published || b.draft).title === brandFilter,
        );
        matchesBrand = Boolean(matchedBrand && c.brandId === matchedBrand.id);
      }

      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [products, query, category, brandFilter, brands]);

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const currentPage = Math.min(pageNumber, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setBrandFilter("all");
    setPageNumber(1);
    updateUrl("", "all", "all", 1);
  };

  const hasActiveFilters = query !== "" || category !== "all" || brandFilter !== "all";

  return (
    <div className="product-directory-page">
      {/* Editorial Header */}
      <section className="page-intro">
        <div className="eyebrow">
          <span className="line" />
          {page.eyebrow || "PRODUCTS & CATALOGUE"}
        </div>
        <h1>{page.title || "Knitwear Production Catalogue"}</h1>
        <p>{page.summary || "Explore our confirmed technical specifications, gauges, and wholesale collections."}</p>
      </section>

      {/* Filter and Search Bar */}
      <section className="section product-filter-section">
        <div className="catalog-toolbar">
          <div className="search-field catalog-search">
            <Search size={17} />
            <input
              placeholder="Search by name, SKU reference, or yarn fiber…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPageNumber(1);
                updateUrl(e.target.value, category, brandFilter, 1);
              }}
              aria-label="Search product catalogue"
            />
            {query && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setQuery("");
                  updateUrl("", category, brandFilter, 1);
                }}
                aria-label="Clear search query"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="filter-dropdowns-group">
            {/* Category Dropdown */}
            <select
              aria-label="Filter by product category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPageNumber(1);
                updateUrl(query, e.target.value, brandFilter, 1);
              }}
            >
              <option value="all">All categories ({products.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Brand Affiliation Dropdown */}
            {brands.length > 0 && (
              <select
                aria-label="Filter by brand"
                value={brandFilter}
                onChange={(e) => {
                  setBrandFilter(e.target.value);
                  setPageNumber(1);
                  updateUrl(query, category, e.target.value, 1);
                }}
              >
                <option value="all">All brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={(b.published || b.draft).title}>
                    {(b.published || b.draft).title}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Results Count & Clear Filters */}
        <div className="filter-feedback-row">
          <span className="results-count-text">
            Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? "product" : "products"}
            {hasActiveFilters && " matching your criteria"}
          </span>

          {hasActiveFilters && (
            <button type="button" className="clear-filters-link" onClick={clearFilters}>
              <X size={14} /> Clear all filters
            </button>
          )}
        </div>

        {/* Product Grid */}
        <div className="product-catalog-grid">
          {paginated.map((p) => {
            const c = p.published || p.draft;
            const itemBrand = brands.find((b) => b.id === c.brandId);
            const brandTitle = itemBrand ? (itemBrand.published || itemBrand.draft).title : null;

            return (
              <article className="product-card" key={p.id}>
                <Link href={`/products/${p.slug}`} className="product-card-inner">
                  <div className="product-image-box">
                    {c.image ? (
                      <img src={c.image} alt={c.imageAlt || c.title} loading="lazy" />
                    ) : (
                      <div className="product-placeholder">
                        <Layers size={40} />
                      </div>
                    )}
                  </div>

                  <div className="product-card-meta">
                    <span className="product-category">{brandTitle || c.category || "Knitwear"}</span>
                    {c.refCode && <span className="product-ref">{c.refCode}</span>}
                  </div>

                  <h3 className="product-title">{c.title}</h3>
                  {c.materials && <p className="product-materials">{c.materials}</p>}

                  <span className="product-link">
                    View specifications <ArrowUpRight size={15} />
                  </span>
                </Link>
              </article>
            );
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="empty-public">
            <Layers size={32} />
            <h3>No products found</h3>
            <p>We could not find any knitwear matching your filter selections.</p>
            <button type="button" className="button dark small" onClick={clearFilters}>
              Reset search & filters
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-bar" role="navigation" aria-label="Product pagination">
            <button
              type="button"
              className="button outline small"
              disabled={currentPage <= 1}
              onClick={() => {
                const prev = currentPage - 1;
                setPageNumber(prev);
                updateUrl(query, category, brandFilter, prev);
              }}
            >
              Previous
            </button>

            <span className="pagination-page-indicator">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="button outline small"
              disabled={currentPage >= totalPages}
              onClick={() => {
                const next = currentPage + 1;
                setPageNumber(next);
                updateUrl(query, category, brandFilter, next);
              }}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
