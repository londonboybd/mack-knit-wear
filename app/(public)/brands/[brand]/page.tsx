import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBrandBySlug } from "@/lib/data/selectors";
import { LondonBoyBrand } from "@/components/londonboy-brand";

type Props = {
  params: Promise<{ brand: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand: brandSlug } = await params;
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return { title: "Brand Not Found | Mack Knit Wear" };

  return {
    title: `${brand.name} · Signature Brand | Mack Knit Wear`,
    description: brand.description,
    alternates: {
      canonical: `/brands/${brand.slug}`,
    },
    openGraph: {
      title: `${brand.name} · Signature Brand | Mack Knit Wear`,
      description: brand.description,
      url: `/brands/${brand.slug}`,
      siteName: "Mack Knit Wear",
    },
  };
}

export default async function BrandDetailPage({ params }: Props) {
  const { brand: brandSlug } = await params;
  const brand = getBrandBySlug(brandSlug);

  if (!brand) {
    notFound();
  }

  // londonBoy is the confirmed signature brand
  if (brand.slug === "londonboy") {
    return <LondonBoyBrand />;
  }

  notFound();
}
