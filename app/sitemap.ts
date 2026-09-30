import type { MetadataRoute } from "next";
import { productsList } from "@/lib/data/site-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  const prefix = base ? base.replace(/\/$/, "") : "";

  const staticRoutes = [
    "",
    "/about",
    "/brands",
    "/brands/londonboy",
    "/brands/londonboy/socks",
    "/brands/londonboy/innerwear",
    "/products",
    "/associates",
    "/contact",
    "/privacy",
  ];

  const productRoutes = productsList.map((p) => `/products/${p.slug}`);

  return [...staticRoutes, ...productRoutes].map((routePath) => ({
    url: `${prefix}${routePath}`,
  }));
}
