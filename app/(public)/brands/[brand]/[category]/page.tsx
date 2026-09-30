import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBrandBySlug } from "@/lib/data/selectors";
import { CategoryView } from "@/components/category-view";

type Props = {
  params: Promise<{ brand: string; category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand: brandSlug, category: categorySlug } = await params;
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return { title: "Category Not Found | Mack Knit Wear" };

  const validCat = categorySlug.toLowerCase();
  if (validCat === "socks") {
    return {
      title: "Socks Collection · londonBoy | Mack Knit Wear",
      description:
        "Vertical rhythm, structured architecture, and dense ribbing engineered in Bangladesh.",
      alternates: {
        canonical: `/brands/${brand.slug}/socks`,
      },
      openGraph: {
        title: "Socks Collection · londonBoy | Mack Knit Wear",
        description:
          "Vertical rhythm, structured architecture, and dense ribbing engineered in Bangladesh.",
        url: `/brands/${brand.slug}/socks`,
        siteName: "Mack Knit Wear",
      },
    };
  }

  if (validCat === "innerwear") {
    return {
      title: "Innerwear Collection · londonBoy | Mack Knit Wear",
      description:
        "Combed natural cotton jersey essentials with gentle drape, breathable softness, and clean lines.",
      alternates: {
        canonical: `/brands/${brand.slug}/innerwear`,
      },
      openGraph: {
        title: "Innerwear Collection · londonBoy | Mack Knit Wear",
        description:
          "Combed natural cotton jersey essentials with gentle drape, breathable softness, and clean lines.",
        url: `/brands/${brand.slug}/innerwear`,
        siteName: "Mack Knit Wear",
      },
    };
  }

  return { title: "Category Not Found | Mack Knit Wear" };
}

export default async function BrandCategoryPage({ params }: Props) {
  const { brand: brandSlug, category: categorySlug } = await params;
  const brand = getBrandBySlug(brandSlug);

  if (!brand || brand.slug !== "londonboy") {
    notFound();
  }

  const validCat = categorySlug.toLowerCase();
  if (validCat !== "socks" && validCat !== "innerwear") {
    notFound();
  }

  return <CategoryView categorySlug={validCat as "socks" | "innerwear"} />;
}
