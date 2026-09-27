"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X, ExternalLink } from "lucide-react";
import type { Content, RecordItem, NavItem } from "@/lib/schema";

export function Logo({
  name = "Mack Knit Wear",
  tagline = "KNITWEAR & BEYOND",
  image = "",
  alt = "",
}: {
  name?: string;
  tagline?: string;
  image?: string;
  alt?: string;
}) {
  if (image)
    return <img className="company-logo" src={image} alt={alt || name} />;
  return (
    <span className="wordmark">
      <span className="monogram" aria-hidden="true">
        M
      </span>
      <span>
        {name}
        <small>{tagline}</small>
      </span>
    </span>
  );
}

export function PublicShell({
  children,
  settings,
  records = [],
  demo = false,
  previewBannerText,
}: {
  children: React.ReactNode;
  settings: Content;
  records: RecordItem[];
  demo?: boolean;
  previewBannerText?: string;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key press or route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Set of published page slugs to ensure we never display broken internal links
  const publishedPages = new Set(
    records.filter((r) => r.kind === "page" && r.published).map((r) => r.slug),
  );
  const hasPublishedNetwork = records.some((r) => r.kind === "network" && r.published);

  // Determine navigation items from settings or sensible default
  let headerNavItems: NavItem[] =
    settings.headerNav && settings.headerNav.length > 0
      ? settings.headerNav
      : [
          { id: "1", label: "About us", href: "/about", isExternal: false, visible: true, order: 1 },
          { id: "2", label: "Our brands", href: "/brands", isExternal: false, visible: true, order: 2 },
          { id: "3", label: "Products", href: "/products", isExternal: false, visible: true, order: 3 },
          { id: "4", label: "Capabilities", href: "/capabilities", isExternal: false, visible: true, order: 4 },
          { id: "5", label: "Our network", href: "/network", isExternal: false, visible: hasPublishedNetwork, order: 5 },
        ];

  // Filter out invisible items or internal links pointing to unpublished pages
  const validHeaderNav = headerNavItems
    .filter((item) => item.visible)
    .filter((item) => {
      if (item.isExternal) return true;
      const cleanSlug = item.href.replace(/^\//, "");
      if (!cleanSlug || cleanSlug === "home") return true;
      if (cleanSlug === "network" && !hasPublishedNetwork) return false;
      return publishedPages.has(cleanSlug) || cleanSlug === "contact" || cleanSlug === "capabilities";
    })
    .sort((a, b) => a.order - b.order);

  // Determine footer navigation items
  let footerNavItems: NavItem[] =
    settings.footerNav && settings.footerNav.length > 0
      ? settings.footerNav
      : [
          { id: "f1", label: "About us", href: "/about", isExternal: false, visible: true, order: 1 },
          { id: "f2", label: "Our brands", href: "/brands", isExternal: false, visible: true, order: 2 },
          { id: "f3", label: "Product catalogue", href: "/products", isExternal: false, visible: true, order: 3 },
          { id: "f4", label: "Capabilities", href: "/capabilities", isExternal: false, visible: true, order: 4 },
          { id: "f5", label: "Contact & Inquiries", href: "/contact", isExternal: false, visible: true, order: 5 },
          { id: "f6", label: "Privacy policy", href: "/privacy", isExternal: false, visible: true, order: 6 },
        ];

  const validFooterNav = footerNavItems
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>

      {previewBannerText ? (
        <div className="preview-indicator-bar" role="status">
          <strong>PREVIEW MODE</strong> · {previewBannerText}
        </div>
      ) : demo ? (
        <div className="demo-strip">
          Design preview · Company details and brand names are illustrative.{" "}
          <Link href="/admin">
            Explore admin <ArrowUpRight size={13} />
          </Link>
        </div>
      ) : null}

      <header className="site-header">
        <Link href="/" aria-label={`${settings.title} home`}>
          <Logo
            name={settings.title}
            tagline={settings.logoTagline}
            image={settings.image}
            alt={settings.imageAlt}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main navigation" className="desktop-nav-wrap">
          {validHeaderNav.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return item.isExternal ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
              >
                {item.label} <ExternalLink size={13} />
              </a>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/contact" className="button small dark desktop-contact">
          Let’s talk <ArrowUpRight size={16} />
        </Link>

        {/* Mobile Navigation Trigger */}
        <div className="mobile-nav-container">
          <button
            type="button"
            className="mobile-nav-toggle-btn"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {mobileMenuOpen && (
            <div className="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="Mobile menu">
              <nav aria-label="Mobile navigation">
                {validHeaderNav.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="mobile-nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/contact"
                  className="mobile-nav-link highlight"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact & Inquiries
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main id="main">{children}</main>

      <footer className="site-footer">
        <div>
          <Logo
            name={settings.title}
            tagline={settings.logoTagline}
            image={settings.image}
            alt={settings.imageAlt}
          />
          <p>{settings.footer}</p>
          {settings.address && <p className="footer-address">{settings.address}</p>}
        </div>

        <div>
          <span className="eyebrow">NAVIGATION</span>
          {validFooterNav.map((item) =>
            item.isExternal ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label} ↗
              </a>
            ) : (
              <Link key={item.id} href={item.href}>
                {item.label}
              </Link>
            ),
          )}
        </div>

        <div>
          <span className="eyebrow">CONNECT</span>
          {settings.email && (
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          )}
          {settings.phone && (
            <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}>{settings.phone}</a>
          )}
          {settings.linkedin && (
            <a
              href={settings.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn ↗
            </a>
          )}
          {settings.facebook && (
            <a
              href={settings.facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook ↗
            </a>
          )}
          {settings.responsePromise && (
            <small className="muted response-promise-note">{settings.responsePromise}</small>
          )}
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {settings.title}
          </span>
          <span>{settings.footerNote}</span>
        </div>
      </footer>
    </>
  );
}
