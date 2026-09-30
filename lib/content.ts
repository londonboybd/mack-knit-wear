import "server-only";
import {
  siteSettings,
  homeContent,
  aboutContent,
  londonBoyBrand,
  productsList,
  associatesList,
  type Product,
  type Associate,
  type SiteSettings,
} from "./data/site-data";
import {
  contentSchema,
  normalizeContent,
  type Content,
  type RecordItem,
} from "./schema";

export {
  siteSettings,
  homeContent,
  aboutContent,
  londonBoyBrand,
  productsList,
  associatesList,
  type Product,
  type Associate,
  type SiteSettings,
};

export const fallbackSettings = contentSchema.parse({
  title: siteSettings.title,
  tagline: siteSettings.tagline,
  summary: siteSettings.description,
  footer: "Knitwear. Brands. Connections.",
  email: siteSettings.email,
  phone: siteSettings.phone,
  address: siteSettings.address,
  responsePromise: siteSettings.responseNotice,
  headerNav: siteSettings.headerNav.map((item, idx) => ({
    ...item,
    visible: true,
    order: idx + 1,
  })),
  footerNav: siteSettings.footerNav.map((item, idx) => ({
    ...item,
    visible: true,
    order: idx + 1,
  })),
});

// Construct confirmed local records conforming to RecordItem
const localRecords: RecordItem[] = [
  // Settings
  {
    id: "rec-settings",
    kind: "settings",
    slug: "company",
    draft: fallbackSettings,
    published: fallbackSettings,
    updated_at: "2026-09-30T00:00:00.000Z",
    published_at: "2026-09-30T00:00:00.000Z",
  },
  // Home Page
  {
    id: "rec-home",
    kind: "page",
    slug: "home",
    draft: normalizeContent(
      contentSchema.parse({
        title: "Everyday essentials. A distinct point of view.",
        eyebrow: "MACK KNIT WEAR",
        summary: homeContent.subhead,
        image: homeContent.heroImage,
        imageAlt: homeContent.heroImageAlt,
      }),
      "page",
      "home",
    ),
    published: normalizeContent(
      contentSchema.parse({
        title: "Everyday essentials. A distinct point of view.",
        eyebrow: "MACK KNIT WEAR",
        summary: homeContent.subhead,
        image: homeContent.heroImage,
        imageAlt: homeContent.heroImageAlt,
      }),
      "page",
      "home",
    ),
    updated_at: "2026-09-30T00:00:00.000Z",
    published_at: "2026-09-30T00:00:00.000Z",
  },
  // About Page
  {
    id: "rec-about",
    kind: "page",
    slug: "about",
    draft: normalizeContent(
      contentSchema.parse({
        title: aboutContent.title,
        eyebrow: aboutContent.eyebrow,
        summary: aboutContent.intro,
        image: aboutContent.image,
        imageAlt: aboutContent.imageAlt,
      }),
      "page",
      "about",
    ),
    published: normalizeContent(
      contentSchema.parse({
        title: aboutContent.title,
        eyebrow: aboutContent.eyebrow,
        summary: aboutContent.intro,
        image: aboutContent.image,
        imageAlt: aboutContent.imageAlt,
      }),
      "page",
      "about",
    ),
    updated_at: "2026-09-30T00:00:00.000Z",
    published_at: "2026-09-30T00:00:00.000Z",
  },
  // Brands Directory Page
  {
    id: "rec-brands",
    kind: "page",
    slug: "brands",
    draft: normalizeContent(
      contentSchema.parse({
        title: "One distinct brand vision.",
        eyebrow: "BRAND EXHIBITION",
        summary: "Mack Knit Wear's premier consumer apparel label.",
      }),
      "page",
      "brands",
    ),
    published: normalizeContent(
      contentSchema.parse({
        title: "One distinct brand vision.",
        eyebrow: "BRAND EXHIBITION",
        summary: "Mack Knit Wear's premier consumer apparel label.",
      }),
      "page",
      "brands",
    ),
    updated_at: "2026-09-30T00:00:00.000Z",
    published_at: "2026-09-30T00:00:00.000Z",
  },
  // Products Directory Page
  {
    id: "rec-products",
    kind: "page",
    slug: "products",
    draft: normalizeContent(
      contentSchema.parse({
        title: "Practical Catalogue",
        eyebrow: "EVERYDAY APPAREL",
        summary: "Structured socks and combed cotton innerwear engineered for durability.",
      }),
      "page",
      "products",
    ),
    published: normalizeContent(
      contentSchema.parse({
        title: "Practical Catalogue",
        eyebrow: "EVERYDAY APPAREL",
        summary: "Structured socks and combed cotton innerwear engineered for durability.",
      }),
      "page",
      "products",
    ),
    updated_at: "2026-09-30T00:00:00.000Z",
    published_at: "2026-09-30T00:00:00.000Z",
  },
  // Associates / Network Page
  {
    id: "rec-associates",
    kind: "page",
    slug: "associates",
    draft: normalizeContent(
      contentSchema.parse({
        title: "Industrial Associates",
        eyebrow: "ACCREDITED DIRECTORY",
        summary: "Collaborative manufacturing infrastructure in Bangladesh.",
      }),
      "page",
      "associates",
    ),
    published: normalizeContent(
      contentSchema.parse({
        title: "Industrial Associates",
        eyebrow: "ACCREDITED DIRECTORY",
        summary: "Collaborative manufacturing infrastructure in Bangladesh.",
      }),
      "page",
      "associates",
    ),
    updated_at: "2026-09-30T00:00:00.000Z",
    published_at: "2026-09-30T00:00:00.000Z",
  },
  // Contact Page
  {
    id: "rec-contact",
    kind: "page",
    slug: "contact",
    draft: normalizeContent(
      contentSchema.parse({
        title: "Correspondence & Inquiries",
        eyebrow: "DIRECT CONTACT",
        summary: "Prepare direct correspondence for wholesale orders and production partnerships.",
      }),
      "page",
      "contact",
    ),
    published: normalizeContent(
      contentSchema.parse({
        title: "Correspondence & Inquiries",
        eyebrow: "DIRECT CONTACT",
        summary: "Prepare direct correspondence for wholesale orders and production partnerships.",
      }),
      "page",
      "contact",
    ),
    updated_at: "2026-09-30T00:00:00.000Z",
    published_at: "2026-09-30T00:00:00.000Z",
  },
  // Privacy Page
  {
    id: "rec-privacy",
    kind: "page",
    slug: "privacy",
    draft: normalizeContent(
      contentSchema.parse({
        title: "Commercial Confidentiality & Privacy",
        eyebrow: "POLICY",
        summary: "Mack Knit Wear's commitment to commercial privacy and data protection.",
        body: "Mack Knit Wear respects commercial confidentiality. Contact inquiries submitted via our correspondence composer or direct email are processed solely to evaluate and respond to your trade requests. We do not transmit customer or partner details to third-party marketing services.\n\nAll correspondence is handled directly by our trade desk in Dhaka, Bangladesh.",
      }),
      "page",
      "privacy",
    ),
    published: normalizeContent(
      contentSchema.parse({
        title: "Commercial Confidentiality & Privacy",
        eyebrow: "POLICY",
        summary: "Mack Knit Wear's commitment to commercial privacy and data protection.",
        body: "Mack Knit Wear respects commercial confidentiality. Contact inquiries submitted via our correspondence composer or direct email are processed solely to evaluate and respond to your trade requests. We do not transmit customer or partner details to third-party marketing services.\n\nAll correspondence is handled directly by our trade desk in Dhaka, Bangladesh.",
      }),
      "page",
      "privacy",
    ),
    updated_at: "2026-09-30T00:00:00.000Z",
    published_at: "2026-09-30T00:00:00.000Z",
  },
  // Signature Brand: londonBoy
  {
    id: "rec-brand-londonboy",
    kind: "brand",
    slug: "londonboy",
    draft: normalizeContent(
      contentSchema.parse({
        title: londonBoyBrand.name,
        eyebrow: londonBoyBrand.category,
        summary: londonBoyBrand.summary,
        body: londonBoyBrand.statement,
        image: londonBoyBrand.heroImage,
        imageAlt: londonBoyBrand.heroImageAlt,
        relationship: "owned",
        featured: true,
        order: 1,
      }),
      "brand",
      "londonboy",
    ),
    published: normalizeContent(
      contentSchema.parse({
        title: londonBoyBrand.name,
        eyebrow: londonBoyBrand.category,
        summary: londonBoyBrand.summary,
        body: londonBoyBrand.statement,
        image: londonBoyBrand.heroImage,
        imageAlt: londonBoyBrand.heroImageAlt,
        relationship: "owned",
        featured: true,
        order: 1,
      }),
      "brand",
      "londonboy",
    ),
    updated_at: "2026-09-30T00:00:00.000Z",
    published_at: "2026-09-30T00:00:00.000Z",
  },
  // Products
  ...productsList.map((p, idx) => {
    const parsed = normalizeContent(
      contentSchema.parse({
        title: p.name,
        eyebrow: p.brand,
        refCode: p.refCode,
        category: p.category,
        summary: p.summary,
        body: p.description,
        image: p.image,
        imageAlt: p.imageAlt,
        featured: p.featured ?? false,
        order: idx + 1,
        specifications: p.specifications,
      }),
      "product",
      p.slug,
    );
    return {
      id: p.id,
      kind: "product" as const,
      slug: p.slug,
      draft: parsed,
      published: parsed,
      updated_at: "2026-09-30T00:00:00.000Z",
      published_at: "2026-09-30T00:00:00.000Z",
    };
  }),
  // Network / Associates
  ...associatesList.map((a, idx) => {
    const parsed = normalizeContent(
      contentSchema.parse({
        title: a.name,
        eyebrow: a.number,
        category: a.role,
        summary: a.location,
        body: a.description,
        website: a.website || undefined,
        relationship: "partner",
        order: idx + 1,
      }),
      "network",
      `associate-${a.number}`,
    );
    return {
      id: `assoc-${a.number}`,
      kind: "network" as const,
      slug: `associate-${a.number}`,
      draft: parsed,
      published: parsed,
      updated_at: "2026-09-30T00:00:00.000Z",
      published_at: "2026-09-30T00:00:00.000Z",
    };
  }),
];

export async function publicRecords(): Promise<RecordItem[]> {
  return localRecords;
}

export async function adminRecords(): Promise<RecordItem[]> {
  return localRecords;
}
