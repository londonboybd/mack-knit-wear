import {
  productsList,
  brandsList,
  associatesList,
  siteSettings,
  homeContent,
  aboutContent,
} from "./site-data";
import type {
  Product,
  Brand,
  Associate,
  SiteSettings,
  HomeContent,
  AboutContent,
} from "./types";

/**
 * Returns all active products in the catalogue.
 */
export function getAllProducts(): Product[] {
  return productsList;
}

/**
 * Finds a single product by its URL slug.
 */
export function getProductBySlug(slug: string): Product | undefined {
  return productsList.find((p) => p.slug === slug);
}

/**
 * Returns products filtered by category slug (case-insensitive).
 */
export function getProductsByCategory(categorySlug: string): Product[] {
  const normalized = categorySlug.trim().toLowerCase();
  return productsList.filter((p) => p.categorySlug.toLowerCase() === normalized);
}

/**
 * Returns products for a specific brand slug.
 */
export function getProductsByBrand(brandSlug: string): Product[] {
  const normalized = brandSlug.trim().toLowerCase();
  return productsList.filter((p) => p.brand.toLowerCase() === normalized);
}

/**
 * Returns related products within the same category, excluding the specified current product.
 */
export function getRelatedProducts(currentProduct: Product, limit = 2): Product[] {
  return productsList
    .filter((p) => p.id !== currentProduct.id && p.categorySlug === currentProduct.categorySlug)
    .slice(0, limit);
}

/**
 * Returns dynamic category counts derived directly from productsList.
 */
export function getCategoryCounts(): { all: number; socks: number; innerwear: number } {
  const counts = { all: productsList.length, socks: 0, innerwear: 0 };
  for (const product of productsList) {
    if (product.categorySlug === "socks") counts.socks++;
    if (product.categorySlug === "innerwear") counts.innerwear++;
  }
  return counts;
}

/**
 * Returns all confirmed brands.
 */
export function getAllBrands(): Brand[] {
  return brandsList;
}

/**
 * Finds a brand by its slug (case-insensitive).
 */
export function getBrandBySlug(slug: string): Brand | undefined {
  const normalized = slug.trim().toLowerCase();
  return brandsList.find((b) => b.slug.toLowerCase() === normalized);
}

/**
 * Returns all industrial associates.
 */
export function getAllAssociates(): Associate[] {
  return associatesList;
}

/**
 * Returns site-wide settings and navigation configuration.
 */
export function getSiteSettings(): SiteSettings {
  return siteSettings;
}

/**
 * Returns editorial home page content.
 */
export function getHomeContent(): HomeContent {
  return homeContent;
}

/**
 * Returns editorial company journal (About) content.
 */
export function getAboutContent(): AboutContent {
  return aboutContent;
}
