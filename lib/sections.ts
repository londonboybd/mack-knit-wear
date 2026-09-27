import type { Kind } from "./schema";
export const sections: Record<
  string,
  { kind: Kind; title: string; description: string }
> = {
  pages: {
    kind: "page",
    title: "Website pages",
    description: "Edit the story visitors see across your website.",
  },
  brands: {
    kind: "brand",
    title: "Our brands",
    description: "Owned brands, individual stories, and links to their stores.",
  },
  network: {
    kind: "network",
    title: "Business network",
    description:
      "Clearly identify sister concerns, represented brands, clients, and partners.",
  },
  products: {
    kind: "product",
    title: "Products & services",
    description: "Showcase confirmed products and business capabilities.",
  },
};
