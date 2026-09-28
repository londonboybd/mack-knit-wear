import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicRecords, fallbackSettings } from "@/lib/content";
import { demo } from "@/lib/supabase";
import { Home, ContentPage } from "@/components/public-content";
import { BrandDetail } from "@/components/brand-detail";
import { BrandDirectory } from "@/components/brand-directory";
import { ProductDetail } from "@/components/product-detail";
import { ProductDirectory } from "@/components/product-directory";

type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{
    brand?: string;
    product?: string;
    sku?: string;
    type?: string;
    q?: string;
    category?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const records = await publicRecords();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://mackknitwear.com";

  let record;
  let canonicalPath = "/";

  if (slug.length === 2 && slug[0] === "brands") {
    record = records.find((r) => r.kind === "brand" && r.slug === slug[1]);
    canonicalPath = `/brands/${slug[1]}`;
  } else if (slug.length === 2 && slug[0] === "products") {
    record = records.find((r) => r.kind === "product" && r.slug === slug[1]);
    canonicalPath = `/products/${slug[1]}`;
  } else {
    const key = slug[0] || "home";
    record = records.find((r) => r.kind === "page" && r.slug === key);
    canonicalPath = key === "home" ? "/" : `/${key}`;
  }

  const pub = record?.published;
  const title = pub?.seoTitle || pub?.title || "Mack Knit Wear";
  const description = pub?.seoDescription || pub?.summary || "Specialized knitwear manufacturing and brand development.";
  const image = pub?.seoImage || pub?.image;

  return {
    title: `${title} | Mack Knit Wear`,
    description,
    alternates: {
      canonical: `${base.replace(/\/$/, "")}${canonicalPath}`,
    },
    openGraph: {
      title,
      description,
      url: `${base.replace(/\/$/, "")}${canonicalPath}`,
      siteName: "Mack Knit Wear",
      images: image ? [{ url: image }] : undefined,
    },
    robots: demo ? { index: false, follow: false } : undefined,
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { slug = [] } = await params;
  const sParams = await searchParams;
  const records = await publicRecords();
  const settings =
    records.find((r) => r.kind === "settings")?.published || fallbackSettings;

  if (!records.length && slug.length === 0) {
    return (
      <section className="page-intro">
        <span className="eyebrow">MACK KNIT WEAR</span>
        <h1>Our next chapter is taking shape.</h1>
        <p>Our company website will be available soon.</p>
      </section>
    );
  }

  // Brand Detail Route: /brands/[slug]
  if (slug.length === 2 && slug[0] === "brands") {
    const r = records.find((r) => r.kind === "brand" && r.slug === slug[1]);
    if (!r?.published) notFound();
    return <BrandDetail brand={r} allRecords={records} />;
  }

  // Product Detail Route: /products/[slug]
  if (slug.length === 2 && slug[0] === "products") {
    const r = records.find((r) => r.kind === "product" && r.slug === slug[1]);
    if (!r?.published) notFound();
    return <ProductDetail product={r} allRecords={records} />;
  }

  if (slug.length > 1) notFound();

  const key = slug[0] || "home";
  const record = records.find((r) => r.kind === "page" && r.slug === key);
  if (!record?.published) notFound();

  // Homepage Route: /
  if (key === "home") {
    return <Home page={record.published} records={records} />;
  }

  // Brand Directory Route: /brands
  if (key === "brands") {
    const brands = records.filter((r) => r.kind === "brand" && r.published);
    return <BrandDirectory page={record.published} brands={brands} />;
  }

  // Product Directory Route: /products
  if (key === "products") {
    const products = records.filter((r) => r.kind === "product" && r.published);
    return (
      <ProductDirectory
        page={record.published}
        products={products}
        allRecords={records}
      />
    );
  }

  // All other pages: /about, /capabilities, /network, /contact, /privacy, or custom pages
  return (
    <ContentPage
      page={record.published}
      records={records}
      settings={settings}
      slug={key}
      brand={sParams.brand || ""}
      product={sParams.product || ""}
      sku={sParams.sku || ""}
      inquiryType={sParams.type || ""}
      demo={demo}
    />
  );
}
