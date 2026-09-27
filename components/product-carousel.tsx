"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import type { RecordItem } from "@/lib/schema";

export function ProductCarousel({
  products,
  title,
  viewAllHref = "/products",
  viewAllLabel = "Browse all products",
  autoRotate = false,
  intervalMs = 5000,
}: {
  products: RecordItem[];
  title?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  autoRotate?: boolean;
  intervalMs?: number;
}) {
  // If zero products, render nothing
  if (!products || products.length === 0) return null;

  // If exactly one product, render static card without carousel controls
  if (products.length === 1) {
    const p = products[0];
    const c = p.published || p.draft;
    return (
      <div className="product-single-card-wrap">
        <article className="product-card static-card">
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
              <span className="product-category">{c.category || "Knitwear"}</span>
              {c.refCode && <span className="product-ref">{c.refCode}</span>}
            </div>
            <h3 className="product-title">{c.title}</h3>
            {c.materials && <p className="product-materials">{c.materials}</p>}
            <span className="product-link">
              View specifications <ArrowUpRight size={15} />
            </span>
          </Link>
        </article>
      </div>
    );
  }

  return (
    <ActiveProductCarousel
      products={products}
      title={title}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
      autoRotate={autoRotate}
      intervalMs={intervalMs}
    />
  );
}

function ActiveProductCarousel({
  products,
  title,
  viewAllHref,
  viewAllLabel,
  autoRotate: initialAutoRotate,
  intervalMs,
}: {
  products: RecordItem[];
  title?: string;
  viewAllHref: string;
  viewAllLabel: string;
  autoRotate: boolean;
  intervalMs: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(initialAutoRotate);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = products.length;

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Handle keyboard arrow keys
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
      setIsPlaying(false); // require explicit play after keyboard interaction
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
      setIsPlaying(false);
    }
  };

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchDelta(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const current = e.targetTouches[0].clientX;
    setTouchDelta(current - touchStart);
  };

  const handleTouchEnd = () => {
    if (touchStart === null) return;
    if (touchDelta < -40) {
      next();
    } else if (touchDelta > 40) {
      prev();
    }
    setTouchStart(null);
    setTouchDelta(0);
  };

  // Autoplay management respecting prefers-reduced-motion and document visibility
  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsPlaying(false);
      return;
    }

    const handleVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    if (isPlaying && !isHovered && !isFocused && !document.hidden) {
      timerRef.current = setInterval(next, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isPlaying, isHovered, isFocused, next, intervalMs]);

  return (
    <div
      className="product-carousel-wrapper"
      ref={containerRef}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={title || "Product Showcase Carousel"}
    >
      <div className="carousel-controls-bar">
        <div className="carousel-status" aria-live="polite">
          <span className="status-current">{currentIndex + 1}</span>
          <span className="status-divider">/</span>
          <span className="status-total">{total}</span>
        </div>

        <div className="carousel-nav-buttons">
          {initialAutoRotate && (
            <button
              type="button"
              className="carousel-btn play-pause-btn"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause automatic slide rotation" : "Play automatic slide rotation"}
              title={isPlaying ? "Pause rotation" : "Play rotation"}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            </button>
          )}

          <button
            type="button"
            className="carousel-btn"
            onClick={prev}
            aria-label="Previous product card"
            title="Previous product"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            className="carousel-btn"
            onClick={next}
            aria-label="Next product card"
            title="Next product"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {viewAllHref && (
          <Link href={viewAllHref} className="carousel-view-all text-link">
            {viewAllLabel} <ArrowUpRight size={15} />
          </Link>
        )}
      </div>

      <div
        className="carousel-track-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="carousel-track"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {products.map((p, idx) => {
            const c = p.published || p.draft;
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={p.id}
                className={`carousel-slide ${isCurrent ? "active-slide" : ""}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${idx + 1} of ${total}: ${c.title}`}
                aria-hidden={!isCurrent}
              >
                <article className="product-card">
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
                      <span className="product-category">{c.category || "Knitwear"}</span>
                      {c.refCode && <span className="product-ref">{c.refCode}</span>}
                    </div>
                    <h3 className="product-title">{c.title}</h3>
                    {c.materials && <p className="product-materials">{c.materials}</p>}
                    <span className="product-link">
                      View specifications <ArrowUpRight size={15} />
                    </span>
                  </Link>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
