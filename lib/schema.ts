import { z } from "zod";

const short = z.string().trim().max(240);

export const safeUrl = z
  .string()
  .trim()
  .max(2000)
  .refine(
    (v) => !v || /^https:\/\/[^\s]+$/i.test(v),
    "Use a complete https:// URL.",
  );

export const imageUrl = z
  .string()
  .max(2000)
  .refine(
    (v) =>
      !v ||
      /^\/images\/[a-zA-Z0-9_.-]+$/.test(v) ||
      /^https:\/\/[^\s]+$/i.test(v),
    "Use an uploaded image or HTTPS URL.",
  );

export const safeSiteOrExternalUrl = z
  .string()
  .max(2000)
  .refine(
    (v) =>
      !v ||
      /^\/(?!\/)[a-zA-Z0-9/?=&_%#.-]*$/.test(v) ||
      /^https:\/\/[^\s]+$/.test(v),
    "Use a site path or complete HTTPS URL.",
  );

export const kinds = [
  "page",
  "brand",
  "product",
  "collection",
  "capability",
  "network",
  "settings",
] as const;

export type Kind = (typeof kinds)[number];

export const relationshipLabels = {
  owned: "Owned brand",
  represented: "Represented brand",
  client: "Client / supply relationship",
  sister: "Sister concern",
  partner: "Business partner",
} as const;

export type RelationshipType = keyof typeof relationshipLabels;

export const inquiryTypes = [
  "General",
  "Wholesale",
  "Brand partnership",
  "Sourcing & export",
  "Sample request",
] as const;

export type InquiryType = (typeof inquiryTypes)[number];

export const inquiryStatuses = [
  "new",
  "read",
  "in_progress",
  "replied",
  "closed",
] as const;

export type InquiryStatus = (typeof inquiryStatuses)[number];

export const inquiryStatusLabels: Record<InquiryStatus, string> = {
  new: "New",
  read: "Read",
  in_progress: "In progress",
  replied: "Replied",
  closed: "Closed",
};

export const pageTemplates = [
  "company",
  "brand_directory",
  "brand_detail",
  "product_directory",
  "product_detail",
  "capabilities",
  "network",
  "contact",
  "policy",
  "editorial",
] as const;

export type PageTemplate = (typeof pageTemplates)[number];

export const pageTemplateLabels: Record<PageTemplate, string> = {
  company: "Company & Story",
  brand_directory: "Brand Directory",
  brand_detail: "Brand Detail",
  product_directory: "Product Directory",
  product_detail: "Product Detail",
  capabilities: "Capabilities & Services",
  network: "Business Network",
  contact: "Contact & Inquiries",
  policy: "Policy & Information",
  editorial: "General Editorial",
};

export const sectionTypes = [
  "editorial_hero",
  "image_text",
  "rich_text",
  "brand_showcase",
  "product_showcase",
  "collection_intro",
  "gallery",
  "timeline",
  "company_facts",
  "capabilities_process",
  "faqs",
  "locations",
  "document_links",
  "contact_banner",
] as const;

export type SectionType = (typeof sectionTypes)[number];

export const sectionTypeLabels: Record<SectionType, string> = {
  editorial_hero: "Editorial Hero",
  image_text: "Image & Text",
  rich_text: "Rich Text",
  brand_showcase: "Brand Showcase",
  product_showcase: "Product Showcase Carousel",
  collection_intro: "Collection Introduction",
  gallery: "Lookbook Gallery",
  timeline: "Company Timeline",
  company_facts: "Verified Company Facts",
  capabilities_process: "Capabilities & Process Flow",
  faqs: "Frequently Asked Questions",
  locations: "Offices & Facilities",
  document_links: "Approved Document Downloads",
  contact_banner: "Contact / Call to Action Banner",
};

export const sectionSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  type: z.enum(sectionTypes),
  enabled: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
  title: short.optional().default(""),
  eyebrow: short.optional().default(""),
  content: z.string().trim().max(16000).optional().default(""),
  image: imageUrl.optional().default(""),
  imageAlt: short.optional().default(""),
  ctaLabel: short.optional().default(""),
  ctaHref: safeSiteOrExternalUrl.optional().default(""),
  data: z.record(z.string(), z.any()).optional().default({}),
});

export type Section = z.infer<typeof sectionSchema>;

export const locationSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  name: short.min(1, "Location name is required"),
  address: z.string().trim().max(1000).default(""),
  phone: short.default(""),
  email: z.union([z.email(), z.literal("")]).default(""),
  hours: short.default(""),
  directionsUrl: safeUrl.default(""),
  isHeadquarters: z.boolean().default(false),
});

export type Location = z.infer<typeof locationSchema>;

export const navItemSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  label: short.min(1, "Label is required"),
  href: safeSiteOrExternalUrl.default("/"),
  isExternal: z.boolean().default(false),
  visible: z.boolean().default(true),
  order: z.number().int().default(0),
});

export type NavItem = z.infer<typeof navItemSchema>;

export const galleryItemSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  image: imageUrl,
  alt: short.default(""),
  caption: short.default(""),
});

export type GalleryItem = z.infer<typeof galleryItemSchema>;

export const specificationSchema = z.object({
  label: short.min(1, "Specification label is required"),
  value: short.min(1, "Specification value is required"),
});

export type Specification = z.infer<typeof specificationSchema>;

export const processStepSchema = z.object({
  stepNumber: z.number().int().default(1),
  title: short.min(1, "Step title is required"),
  description: z.string().trim().max(2000).default(""),
});

export type ProcessStep = z.infer<typeof processStepSchema>;

export const contentSchema = z.object({
  _v: z.number().int().default(2),
  title: short.min(1, "A title is required."),
  eyebrow: short.default(""),
  summary: z.string().trim().max(1200).default(""),
  body: z.string().trim().max(16000).default(""),
  image: imageUrl.default(""),
  imageAlt: short.default(""),
  website: safeUrl.default(""),
  store: safeUrl.default(""),
  relationship: z
    .enum(["owned", "represented", "client", "sister", "partner"])
    .default("owned"),
  category: short.default(""),
  order: z.number().int().min(0).max(999).default(0),
  featured: z.boolean().default(false),
  seoTitle: short.default(""),
  seoDescription: z.string().max(320).default(""),
  seoImage: imageUrl.default(""),
  email: z.union([z.email(), z.literal("")]).default(""),
  phone: short.default(""),
  address: z.string().max(1000).default(""),
  footer: z.string().max(600).default(""),
  linkedin: safeUrl.default(""),
  facebook: safeUrl.default(""),
  footerNote: short.default("A world of possibilities, woven together."),
  logoTagline: short.default("KNITWEAR & BEYOND"),
  aboutLabel: short.default("01 — THE COMPANY"),
  brandsLabel: short.default("02 — OUR BRAND PORTFOLIO"),
  brandsTitle: short.default("A character of its own."),
  contactLabel: short.default("THE NEXT CHAPTER STARTS WITH A CONVERSATION"),
  contactTitle: short.default("Let’s make a connection."),
  contactButton: short.default("Get in touch"),
  photoLabel: short.default("A CLOSER LOOK AT KNITWEAR"),
  heroFooter: short.default("THE MACK KNIT WEAR PORTFOLIO"),
  ticker: short.default("KNITWEAR, BRANDS, CONNECTIONS"),
  homeSections: z
    .array(z.string())
    .default(["about", "brands", "contact"]),
  ctaLabel: short.default(""),
  ctaHref: safeSiteOrExternalUrl.default(""),

  // Upgraded V2 Fields
  template: z.enum(pageTemplates).default("editorial"),
  sections: z.array(sectionSchema).default([]),
  locations: z.array(locationSchema).default([]),
  headerNav: z.array(navItemSchema).default([]),
  footerNav: z.array(navItemSchema).default([]),

  // Product specific fields
  refCode: short.default(""),
  brandId: z.string().default(""),
  collectionId: z.string().default(""),
  gallery: z.array(galleryItemSchema).default([]),
  specifications: z.array(specificationSchema).default([]),
  materials: z.string().trim().max(2000).default(""),
  sizes: z.array(short).default([]),
  colors: z.array(short).default([]),
  intendedUse: z.string().trim().max(1000).default(""),
  customization: z.string().trim().max(1000).default(""),
  moq: short.default(""),
  leadTime: short.default(""),

  // Brand specific fields
  brandLogo: imageUrl.default(""),
  brandLogoAlt: short.default(""),
  craftsmanshipTitle: short.default(""),
  craftsmanshipSummary: z.string().trim().max(1200).default(""),
  craftsmanshipBody: z.string().trim().max(8000).default(""),
  craftsmanshipImage: imageUrl.default(""),
  craftsmanshipImageAlt: short.default(""),
  selectedProductIds: z.array(z.string()).default([]),
  featuredCollectionId: z.string().default(""),

  // Collection specific fields
  productIds: z.array(z.string()).default([]),
  season: short.default(""),

  // Capability specific fields
  processSteps: z.array(processStepSchema).default([]),
  outputs: z.array(short).default([]),

  // Settings specific
  responsePromise: short.default(""),
  enableSampleRequests: z.boolean().default(false),
});

export type Content = z.infer<typeof contentSchema>;

export type RecordItem = {
  id: string;
  kind: Kind;
  slug: string;
  draft: Content;
  published: Content | null;
  updated_at: string;
  published_at: string | null;
};

export const saveSchema = z.object({
  id: z.uuid().optional(),
  kind: z.enum(kinds),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(100),
  content: contentSchema,
  action: z.enum(["save", "publish", "unpublish"]),
  updatedAt: z.string().optional(),
});

export const inquiryConditionalDetailsSchema = z
  .object({
    country: short.optional().default(""),
    quantity: short.optional().default(""),
    timeline: short.optional().default(""),
    proposal: z.string().max(2000).optional().default(""),
    sampleRequirements: z.string().max(2000).optional().default(""),
    productName: short.optional().default(""),
    productRefCode: short.optional().default(""),
    companyWebsite: safeUrl.optional().default(""),
  })
  .default({
    country: "",
    quantity: "",
    timeline: "",
    proposal: "",
    sampleRequirements: "",
    productName: "",
    productRefCode: "",
    companyWebsite: "",
  });

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.email("Enter a valid email address").max(200),
  company: z.string().trim().max(200).default(""),
  type: z.enum(inquiryTypes),
  brand: z.string().max(200).default(""),
  message: z.string().trim().min(20, "Message must be at least 20 characters").max(5000),
  website: z.string().max(500).default(""), // Honeypot
  token: z.string().max(4000).default(""), // Turnstile token
  idempotencyKey: z.string().max(100).optional().default(""),
  brandRef: z.string().uuid().optional().or(z.literal("")),
  productRef: z.string().uuid().optional().or(z.literal("")),
  sourceUrl: z.string().max(2000).optional().default(""),
  details: inquiryConditionalDetailsSchema.optional(),
});

export type InquiryPayload = z.infer<typeof inquirySchema>;

export type InquiryItem = {
  id: string;
  reference_code: string;
  name: string;
  email: string;
  company: string;
  type: InquiryType;
  brand: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
  source_url?: string;
  details?: Partial<z.infer<typeof inquiryConditionalDetailsSchema>>;
  notification_status?: "pending" | "sent" | "failed" | "unconfigured";
  notification_attempts?: number;
  notification_last_attempt?: string | null;
  notification_error?: string | null;
  internal_notes?: Array<{
    id: string;
    text: string;
    created_at: string;
    author?: string;
  }>;
};

/**
 * Normalizes any legacy or v1 snapshot into a compliant v2 Content object.
 * Ensures backward compatibility with existing revisions and database records.
 */
export function normalizeContent(
  raw: unknown,
  kind: Kind = "page",
  slug = "",
): Content {
  const parsed = contentSchema.safeParse(raw ?? {});
  const base = parsed.success ? parsed.data : contentSchema.parse({ title: "Untitled" });

  // If sections are empty on a page, generate appropriate defaults
  if (kind === "page" && (!base.sections || base.sections.length === 0)) {
    const sections: Section[] = [];
    if (slug === "home") {
      base.homeSections.forEach((s, idx) => {
        if (s === "about") {
          sections.push({
            id: `sec-home-about`,
            type: "editorial_hero",
            enabled: true,
            order: idx,
            title: base.title,
            eyebrow: base.eyebrow,
            content: base.summary,
            image: base.image,
            imageAlt: base.imageAlt,
            ctaLabel: base.ctaLabel || "Discover our brands",
            ctaHref: base.ctaHref || "/brands",
            data: {},
          });
        } else if (s === "brands") {
          sections.push({
            id: `sec-home-brands`,
            type: "brand_showcase",
            enabled: true,
            order: idx,
            title: base.brandsTitle || "A character of its own.",
            eyebrow: base.brandsLabel || "OUR BRAND PORTFOLIO",
            content: "",
            image: "",
            imageAlt: "",
            ctaLabel: "Explore all brands",
            ctaHref: "/brands",
            data: { limit: 6 },
          });
        } else if (s === "contact") {
          sections.push({
            id: `sec-home-contact`,
            type: "contact_banner",
            enabled: true,
            order: idx,
            title: base.contactTitle || "Let’s make a connection.",
            eyebrow: base.contactLabel || "THE NEXT CHAPTER STARTS WITH A CONVERSATION",
            content: "",
            image: "",
            imageAlt: "",
            ctaLabel: base.contactButton || "Get in touch",
            ctaHref: "/contact",
            data: {},
          });
        }
      });
    } else {
      sections.push({
        id: `sec-main-${slug || "page"}`,
        type: "rich_text",
        enabled: true,
        order: 0,
        title: base.title,
        eyebrow: base.eyebrow,
        content: base.body,
        image: base.image,
        imageAlt: base.imageAlt,
        ctaLabel: "",
        ctaHref: "",
        data: {},
      });
    }
    base.sections = sections;
  }

  // Ensure default template based on slug if kind === "page"
  if (kind === "page" && base.template === "editorial") {
    if (slug === "home" || slug === "about") base.template = "company";
    else if (slug === "brands") base.template = "brand_directory";
    else if (slug === "products") base.template = "product_directory";
    else if (slug === "network") base.template = "network";
    else if (slug === "contact") base.template = "contact";
    else if (slug === "privacy") base.template = "policy";
    else if (slug === "capabilities") base.template = "capabilities";
  }

  base._v = 2;
  return base;
}

export type RecordUsage = {
  kind: Kind;
  slug: string;
  title: string;
  context: string;
};

/**
 * Checks where a given content record ID is referenced across the database.
 * Used before unpublishing or archiving to warn administrators.
 */
export function checkRecordUsage(
  targetId: string,
  targetKind: Kind,
  allRecords: RecordItem[],
): { isUsed: boolean; usages: RecordUsage[] } {
  const usages: RecordUsage[] = [];

  for (const r of allRecords) {
    if (r.id === targetId) continue;
    const content = r.draft;

    if (targetKind === "brand") {
      // Check products referencing this brand
      if (r.kind === "product" && content.brandId === targetId) {
        usages.push({
          kind: r.kind,
          slug: r.slug,
          title: content.title,
          context: "Assigned as brand owner for this product",
        });
      }
      // Check collections referencing this brand
      if (r.kind === "collection" && content.brandId === targetId) {
        usages.push({
          kind: r.kind,
          slug: r.slug,
          title: content.title,
          context: "Assigned as brand owner for this collection",
        });
      }
    }

    if (targetKind === "product") {
      // Check brands featuring this product
      if (r.kind === "brand" && content.selectedProductIds?.includes(targetId)) {
        usages.push({
          kind: r.kind,
          slug: r.slug,
          title: content.title,
          context: "Featured in brand product carousel",
        });
      }
      // Check collections containing this product
      if (r.kind === "collection" && content.productIds?.includes(targetId)) {
        usages.push({
          kind: r.kind,
          slug: r.slug,
          title: content.title,
          context: "Included in collection product list",
        });
      }
    }

    if (targetKind === "collection") {
      // Check brand featuring this collection
      if (r.kind === "brand" && content.featuredCollectionId === targetId) {
        usages.push({
          kind: r.kind,
          slug: r.slug,
          title: content.title,
          context: "Featured collection on brand detail page",
        });
      }
    }

    // Check page sections referencing items
    if (r.kind === "page" && content.sections) {
      for (const sec of content.sections) {
        const itemIds: string[] = Array.isArray(sec.data?.itemIds) ? sec.data.itemIds : [];
        if (itemIds.includes(targetId)) {
          usages.push({
            kind: r.kind,
            slug: r.slug,
            title: content.title,
            context: `Referenced in section "${sec.title || sec.type}"`,
          });
        }
      }
    }
  }

  return {
    isUsed: usages.length > 0,
    usages,
  };
}
