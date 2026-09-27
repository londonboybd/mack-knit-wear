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
export const kinds = [
  "page",
  "brand",
  "network",
  "product",
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
export const contentSchema = z.object({
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
    .array(z.enum(["about", "brands", "contact"]))
    .max(3)
    .refine(
      (a) => new Set(a).size === a.length,
      "Each section can only appear once.",
    )
    .default(["about", "brands", "contact"]),
  ctaLabel: short.default(""),
  ctaHref: z
    .string()
    .max(2000)
    .refine(
      (v) =>
        !v ||
        /^\/(?!\/)[a-zA-Z0-9/?=&_%#.-]*$/.test(v) ||
        /^https:\/\/[^\s]+$/.test(v),
      "Use a site path or HTTPS URL.",
    )
    .default(""),
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
export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  company: z.string().trim().max(200).default(""),
  type: z.enum([
    "General",
    "Wholesale",
    "Brand partnership",
    "Sourcing & export",
  ]),
  brand: z.string().max(200).default(""),
  message: z.string().trim().min(20).max(5000),
  website: z.string().max(500).default(""),
  token: z.string().max(4000).default(""),
});
