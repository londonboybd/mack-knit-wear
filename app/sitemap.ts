import type { MetadataRoute } from "next";
import { publicRecords } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) return [];
  return (await publicRecords())
    .filter((r) => r.kind === "page" || r.kind === "brand")
    .map((r) => ({
      url: `${base.replace(/\/$/, "")}${r.kind === "brand" ? `/brands/${r.slug}` : r.slug === "home" ? "" : `/${r.slug}`}`,
      lastModified: new Date(r.updated_at),
    }));
}
