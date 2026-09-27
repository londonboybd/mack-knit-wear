import { WebsitePreview } from "@/components/website-preview";
import { publicRecords } from "@/lib/content";
export default async function Preview() {
  const records = await publicRecords();
  return (
    <WebsitePreview
      pages={records
        .filter((r) => r.kind === "page" || r.kind === "brand")
        .map((r) => ({
          title: r.published!.title,
          path:
            r.kind === "brand"
              ? `/brands/${r.slug}`
              : r.slug === "home"
                ? "/"
                : `/${r.slug}`,
        }))}
    />
  );
}
