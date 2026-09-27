import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Content, RecordItem } from "@/lib/schema";
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
  records,
  demo = false,
}: {
  children: React.ReactNode;
  settings: Content;
  records: RecordItem[];
  demo?: boolean;
}) {
  const pages = new Set(
    records.filter((r) => r.kind === "page" && r.published).map((r) => r.slug),
  );
  const nav = [
    ["About us", "about"],
    ["Products & services", "products"],
    ["Our brands", "brands"],
    ...(records.some((r) => r.kind === "network" && r.published)
      ? [["Our network", "network"]]
      : []),
  ];
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      {demo && (
        <div className="demo-strip">
          Design preview · Company details and brand names are illustrative.{" "}
          <Link href="/admin">
            Explore admin <ArrowUpRight size={13} />
          </Link>
        </div>
      )}
      <header className="site-header">
        <Link href="/" aria-label={`${settings.title} home`}>
          <Logo
            name={settings.title}
            tagline={settings.logoTagline}
            image={settings.image}
            alt={settings.imageAlt}
          />
        </Link>
        <nav aria-label="Main navigation">
          {nav
            .filter(([, s]) => pages.has(s))
            .map(([label, s]) => (
              <Link href={`/${s}`} key={s}>
                {label}
              </Link>
            ))}
        </nav>
        <Link href="/contact" className="button small dark desktop-contact">
          Let’s talk <ArrowUpRight size={16} />
        </Link>
        <details className="mobile-nav">
          <summary>Menu</summary>
          <nav aria-label="Mobile navigation">
            {nav
              .filter(([, s]) => pages.has(s))
              .map(([label, s]) => (
                <Link href={`/${s}`} key={s}>
                  {label}
                </Link>
              ))}
            <Link href="/contact">Contact</Link>
          </nav>
        </details>
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
        </div>
        <div>
          <span className="eyebrow">EXPLORE</span>
          <Link href="/about">About us</Link>
          <Link href="/brands">Our brands</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <span className="eyebrow">CONNECT</span>
          {settings.email && (
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
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
          <Link href="/privacy">Privacy</Link>
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
