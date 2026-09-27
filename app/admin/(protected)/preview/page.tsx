import { WebsitePreview } from "@/components/website-preview";
import { adminRecords } from "@/lib/content";

export default async function Preview() {
  const records = await adminRecords();

  const previewPages = records
    .filter((r) => ["page", "brand", "product"].includes(r.kind))
    .map((r) => {
      let path = `/${r.slug}`;
      if (r.kind === "brand") path = `/brands/${r.slug}`;
      else if (r.kind === "product") path = `/products/${r.slug}`;
      else if (r.slug === "home") path = "/";

      const title = (r.published || r.draft).title;
      return {
        title: `${title} (${r.kind})`,
        path,
        isDraft: !r.published,
      };
    });

  return <WebsitePreview pages={previewPages} />;
}
