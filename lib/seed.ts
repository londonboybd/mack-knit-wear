import {
  contentSchema,
  type Content,
  type Kind,
  type RecordItem,
} from "./schema";
const data = (v: Partial<Content>) => contentSchema.parse(v);
let seq = 0;
const record = (kind: Kind, slug: string, c: Partial<Content>): RecordItem => ({
  id: `00000000-0000-4000-8000-${String(++seq).padStart(12, "0")}`,
  kind,
  slug,
  draft: data(c),
  published: data(c),
  updated_at: "2026-09-22T00:00:00.000Z",
  published_at: "2026-09-22T00:00:00.000Z",
});
export const seed: RecordItem[] = [
  record("settings", "company", {
    title: "Mack Knit Wear",
    summary: "A considered approach to knitwear.",
    footer: "Knitwear. Brands. Connections.",
    body: "Company information will be added as it is confirmed.",
  }),
  record("page", "home", {
    title: "Made of possibility.",
    eyebrow: "MACK KNIT WEAR",
    summary:
      "A home for knitwear, emerging brands, and meaningful business connections.",
    body: "Explore the company behind the collection. Discover our brands, learn about our work, and start a conversation.",
    image: "/images/knitwear.jpg",
    imageAlt: "Close-up textile photograph used as illustrative design imagery",
    ctaLabel: "Discover our brands",
    ctaHref: "/brands",
  }),
  record("page", "about", {
    title: "The company behind the possibilities.",
    eyebrow: "ABOUT MACK",
    summary: "Our story starts with knitwear.",
    body: "This is a working draft of the company introduction. Add the verified company story, business model, location, and values here before publishing.",
    image: "/images/knitwear.jpg",
    imageAlt: "Illustrative textile detail",
  }),
  record("page", "products", {
    title: "Explore what we do.",
    eyebrow: "PRODUCTS & SERVICES",
    summary: "A space for our products, expertise, and business capabilities.",
    body: "Confirmed product categories and services will appear here.",
  }),
  record("page", "brands", {
    title: "Individual identities. Shared ambition.",
    eyebrow: "OUR BRANDS",
    summary: "Discover the brands in the Mack Knit Wear portfolio.",
    body: "Each brand has its own point of view. Explore its story, then continue to its official website or online store.",
  }),
  record("page", "network", {
    title: "Connected through opportunity.",
    eyebrow: "OUR NETWORK",
    summary: "The businesses and relationships that connect our work.",
    body: "Confirmed sister concerns, represented brands, clients, and business partners will appear here with their relationship clearly explained.",
  }),
  record("page", "contact", {
    title: "Let’s start a conversation.",
    eyebrow: "CONTACT",
    summary: "Tell us what you have in mind.",
    body: "For company information, brand inquiries, or a business conversation, send us a message.",
  }),
  record("page", "privacy", {
    title: "Privacy notice",
    eyebrow: "INFORMATION",
    summary: "How we handle your inquiry.",
    body: "Draft for company review: The contact form collects your name, email, optional company, inquiry type, and message so the company can respond. Before launch, add the responsible company contact, confirmed service providers, retention period, and applicable privacy rights.",
  }),
  record("brand", "first-brand", {
    title: "Your first brand",
    eyebrow: "THE FIRST CHAPTER",
    summary: "A distinct identity. A place to grow.",
    body: "Illustrative brand profile. Replace this name, story, and image with the first confirmed brand. Add the official website and ecommerce links in the admin dashboard.",
    category: "Brand concept",
    featured: true,
    image: "/images/knitwear.jpg",
    imageAlt: "Illustrative textile photograph; not a confirmed brand product",
  }),
  record("product", "knitwear", {
    title: "Knitwear",
    summary:
      "Introduce your confirmed knitwear range, materials, and product categories here.",
    category: "Product category",
    body: "Draft product category. Confirm the available range before publication.",
    image: "/images/knitwear.jpg",
    imageAlt: "Illustrative knitted textile",
  }),
];
