import type { Kind } from "./schema";

export const sections: Record<
  string,
  { kind: Kind; title: string; description: string }
> = {
  pages: {
    kind: "page",
    title: "Website pages",
    description: "Manage page templates, sections, layouts, and SEO settings.",
  },
  brands: {
    kind: "brand",
    title: "Our brands",
    description: "Owned brands, storytelling, lookbooks, and external shop destinations.",
  },
  collections: {
    kind: "collection",
    title: "Brand collections",
    description: "Curated seasonal collections associated with owned brands.",
  },
  products: {
    kind: "product",
    title: "Products & catalogue",
    description: "Individual products, reference codes, technical specifications, and galleries.",
  },
  capabilities: {
    kind: "capability",
    title: "Capabilities & services",
    description: "Manufacturing craftsmanship, technical processes, and production facilities.",
  },
  network: {
    kind: "network",
    title: "Business network",
    description: "Represented brands, supply clients, sister concerns, and strategic partners.",
  },
};
