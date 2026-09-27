import type { MetadataRoute } from "next";
import { publicRecords } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) return [];
  return (await publicRecords())
    .filter((r) => r.kind === "page" || r.kind === "brand" || r.kind === "product")
    .map((r) => {
      let path = `/${r.slug}`;
      if (r.kind === "brand") {
        path = `/brands/${r.slug}`;
      } else if (r.kind === "product") {
        path = `/products/${r.slug}`;
      } else if (r.slug === "home") {
        path = "";
      }
      return {
        url: `${base.replace(/\/$/, "")}${path}`,
        lastModified: new Date(r.updated_at),
      };
    });
}
