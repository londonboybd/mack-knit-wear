import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicRecords, fallbackSettings } from "@/lib/content";
import { demo } from "@/lib/supabase";
import { Home, ContentPage, BrandPage } from "@/components/public-content";
type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ brand?: string }>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const records = await publicRecords();
  const r =
    slug.length === 2 && slug[0] === "brands"
      ? records.find((r) => r.kind === "brand" && r.slug === slug[1])
      : records.find(
          (r) => r.kind === "page" && r.slug === (slug[0] || "home"),
        );
  return {
    title: r?.published?.seoTitle || r?.published?.title || "Mack Knit Wear",
    description: r?.published?.seoDescription || r?.published?.summary,
    robots: demo ? { index: false, follow: false } : undefined,
  };
}
export default async function Page({ params, searchParams }: Props) {
  const { slug = [] } = await params;
  const records = await publicRecords();
  const settings =
    records.find((r) => r.kind === "settings")?.published || fallbackSettings;
  if (!records.length && slug.length === 0)
    return (
      <section className="page-intro">
        <span className="eyebrow">MACK KNIT WEAR</span>
        <h1>Our next chapter is taking shape.</h1>
        <p>Our company website will be available soon.</p>
      </section>
    );
  if (slug.length === 2 && slug[0] === "brands") {
    const r = records.find((r) => r.kind === "brand" && r.slug === slug[1]);
    if (!r?.published) notFound();
    return <BrandPage content={r.published} />;
  }
  if (slug.length > 1) notFound();
  const key = slug[0] || "home";
  const record = records.find((r) => r.kind === "page" && r.slug === key);
  if (!record?.published) notFound();
  if (key === "home") return <Home page={record.published} records={records} />;
  return (
    <ContentPage
      page={record.published}
      records={records}
      settings={settings}
      slug={key}
      brand={(await searchParams).brand || ""}
      demo={demo}
    />
  );
}
