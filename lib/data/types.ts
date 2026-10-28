export interface NavItem {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface SiteSettings {
  title: string;
  tagline: string;
  companyName: string;
  description: string;
  email?: string;
  phone?: string;
  address: string;
  headerNav: NavItem[];
  footerNav: NavItem[];
}

export interface Associate {
  number: string;
  name: string;
  role: string;
  location: string;
  description: string;
  website?: string;
  displayMark: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductGalleryItem {
  image: string;
  alt?: string;
  caption?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: "londonBoy";
  category: "Socks" | "Innerwear";
  categorySlug: "socks" | "innerwear";
  refCode: string;
  summary: string;
  description: string;
  image: string;
  imageAlt: string;
  secondaryImage?: string;
  gallery?: ProductGalleryItem[];
  specifications?: ProductSpecification[];
  featured?: boolean;
}

export interface BrandCategory {
  id: string;
  name: string;
  slug: "socks" | "innerwear";
  tagline: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
}

export interface BrandScene {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  cta: { label: string; href: string };
  keyNotes: string[];
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  wordmark?: string;
  category?: string;
  tagline: string;
  summary?: string;
  description: string;
  statement?: string;
  editorialStatement: string;
  heroImage: string;
  heroImageAlt: string;
  inquiryNotice?: string;
  categories: BrandCategory[];
  scenes: {
    socks: BrandScene;
    innerwear: BrandScene;
  };
}

export interface HomeContent {
  headline: string;
  subhead: string;
  heroImage: string;
  heroImageAlt: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  mackIntro: {
    eyebrow: string;
    heading: string;
    body: string;
  };
  londonBoyFeature: {
    eyebrow: string;
    name: string;
    tagline: string;
    description: string;
    cta: { label: string; href: string };
    categories: BrandCategory[];
  };
  associatesPreview: {
    eyebrow: string;
    heading: string;
    description: string;
    cta: { label: string; href: string };
  };
  contactPrompt: {
    eyebrow: string;
    heading: string;
    body: string;
    cta: { label: string; href: string };
  };
}

export interface AboutChapter {
  id: string;
  number: string;
  title: string;
  anchor: string;
  lead?: string;
  content: string[];
  stats?: Array<{ label: string; value: string }>;
}

export interface AboutContent {
  eyebrow: string;
  title: string;
  intro: string;
  chapters: AboutChapter[];
  image: string;
  imageAlt: string;
  caption?: string;
}
