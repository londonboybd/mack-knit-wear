"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ArrowLeft, Menu, X } from "lucide-react";
import { siteSettings } from "@/lib/data/site-data";
import { ScrollProgress } from "./motion";

interface PublicShellProps {
  children: React.ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const menuDrawerRef = useRef<HTMLDivElement>(null);

  const isLondonBoyRoute = pathname.startsWith("/brands/londonboy");

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle Escape key and focus management for mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
        toggleBtnRef.current?.focus();
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      // Focus first focusable link in the drawer
      setTimeout(() => {
        const firstLink = menuDrawerRef.current?.querySelector("a");
        firstLink?.focus();
      }, 50);
    } else {
      document.body.style.overflow = "";
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = siteSettings.headerNav;

  return (
    <div className="site-shell">
      <ScrollProgress />

      <a className="skip-to-content-link" href="#main-content">
        Skip to main content
      </a>

      {/* Primary Site Header: Mack Knit Wear */}
      <header className="site-header" role="banner">
        <div className="header-container">
          <Link href="/" className="header-brand-link" aria-label="Mack Knit Wear Home">
            <span className="wordmark">
              <span className="wordmark-monogram" aria-hidden="true">
                M
              </span>
              <span className="wordmark-text-wrap">
                <span className="wordmark-title">Mack Knit Wear</span>
                <span className="wordmark-tagline">DHAKA · TEXTILES</span>
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Contact Action */}
          <div className="header-cta-wrap">
            <Link href="/contact" className="button contact-cta-btn">
              Let’s talk <ArrowUpRight size={15} />
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              ref={toggleBtnRef}
              type="button"
              className="mobile-nav-toggle"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Navigation on londonBoy Routes */}
      {isLondonBoyRoute && (
        <nav
          className="londonboy-subnav-bar"
          aria-label="londonBoy Brand Navigation"
        >
          <div className="subnav-container">
            <div className="subnav-brand-side">
              <Link href="/brands/londonboy" className="subnav-wordmark">
                <strong>londonBoy</strong>
                <span className="subnav-badge">Signature Brand</span>
              </Link>
            </div>

            <div className="subnav-links-side">
              <Link
                href="/brands/londonboy"
                className={`subnav-link ${
                  pathname === "/brands/londonboy" ? "active" : ""
                }`}
              >
                Overview
              </Link>
              <Link
                href="/brands/londonboy/socks"
                className={`subnav-link ${
                  pathname === "/brands/londonboy/socks" ? "active" : ""
                }`}
              >
                Socks
              </Link>
              <Link
                href="/brands/londonboy/innerwear"
                className={`subnav-link ${
                  pathname === "/brands/londonboy/innerwear" ? "active" : ""
                }`}
              >
                Innerwear
              </Link>
              <Link
                href="/products?brand=londonBoy"
                className="subnav-link"
              >
                All Products
              </Link>

              <span className="subnav-sep" aria-hidden="true">|</span>

              <Link href="/" className="subnav-return-link">
                <ArrowLeft size={13} /> Back to Mack
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          ref={menuDrawerRef}
          className="mobile-menu-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="drawer-inner">
            <div className="drawer-header">
              <span className="drawer-title">Navigation</span>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="mobile-nav-list" aria-label="Mobile Navigation List">
              <Link
                href="/"
                className={`mobile-nav-item ${pathname === "/" ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mobile-nav-item ${
                    pathname.startsWith(item.href) ? "active" : ""
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="mobile-nav-divider" />

              <span className="mobile-subhead">SIGNATURE BRAND</span>
              <Link
                href="/brands/londonboy"
                className="mobile-nav-item special-brand-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                londonBoy Overview
              </Link>
              <Link
                href="/brands/londonboy/socks"
                className="mobile-nav-subitem"
                onClick={() => setMobileMenuOpen(false)}
              >
                ↳ londonBoy Socks
              </Link>
              <Link
                href="/brands/londonboy/innerwear"
                className="mobile-nav-subitem"
                onClick={() => setMobileMenuOpen(false)}
              >
                ↳ londonBoy Innerwear
              </Link>
            </nav>

            <div className="drawer-footer">
              <Link
                href="/contact"
                className="button primary-dark mobile-contact-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Trade Desk <ArrowUpRight size={16} />
              </Link>
              <p className="drawer-footnote">
                {siteSettings.address} · {siteSettings.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Landmark: Only single <main> on page */}
      <main id="main-content" className="site-main-content">
        {children}
      </main>

      {/* Site Editorial Footer */}
      <footer className="site-footer" role="contentinfo">
        <div className="section-container footer-grid">
          <div className="footer-brand-col">
            <span className="footer-wordmark">{siteSettings.companyName}</span>
            <p className="footer-motto">{siteSettings.description}</p>
            <div className="footer-meta-info">
              {siteSettings.email && <span>Direct: {siteSettings.email}</span>}
              {siteSettings.phone && <span>Phone: {siteSettings.phone}</span>}
            </div>
          </div>

          <div className="footer-nav-col">
            <span className="footer-col-title">NAVIGATION</span>
            <ul className="footer-link-list">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/brands">Brands Portfolio</Link></li>
              <li><Link href="/products">Product Catalogue</Link></li>
              <li><Link href="/associates">Industrial Associates</Link></li>
              <li><Link href="/contact">Commercial Correspondence</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <span className="footer-col-title">SIGNATURE BRAND</span>
            <ul className="footer-link-list">
              <li><Link href="/brands/londonboy">londonBoy Overview</Link></li>
              <li><Link href="/brands/londonboy/socks">Socks Line</Link></li>
              <li><Link href="/brands/londonboy/innerwear">Innerwear Line</Link></li>
              <li><Link href="/contact?brand=londonBoy">Wholesale Sourcing</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <span className="footer-col-title">GOVERNANCE</span>
            <ul className="footer-link-list">
              <li><Link href="/privacy">Commercial Confidentiality</Link></li>
              <li><Link href="/contact?type=Factory%20Verification">Associate Verification</Link></li>
            </ul>
            <div className="footer-note-box">
              <span>{siteSettings.address}</span>
              <small>All specifications derived from confirmed production.</small>
            </div>
          </div>
        </div>

        <div className="section-container footer-bottom-bar">
          <p className="copyright-text">
            © {new Date().getFullYear()} {siteSettings.companyName}. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <Link href="/privacy">Privacy Notice</Link>
            <span>·</span>
            <Link href="/contact">Trade Desk</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
