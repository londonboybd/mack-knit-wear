import type { Metadata } from "next";
import { BrandsPortfolio } from "@/components/brands-portfolio";

export const metadata: Metadata = {
  title: "Brand Portfolio Exhibition | Mack Knit Wear",
  description:
    "Discover londonBoy, Mack Knit Wear's premier signature everyday apparel label focusing exclusively on Socks and Innerwear.",
  alternates: {
    canonical: "/brands",
  },
  openGraph: {
    title: "Brand Portfolio Exhibition | Mack Knit Wear",
    description:
      "Discover londonBoy, Mack Knit Wear's premier signature everyday apparel label focusing exclusively on Socks and Innerwear.",
    url: "/brands",
    siteName: "Mack Knit Wear",
  },
};

export default function BrandsPage() {
  return <BrandsPortfolio />;
}
