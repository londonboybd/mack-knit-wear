import type { Metadata } from "next";
import { ContactCorrespondence } from "@/components/contact-correspondence";

type Props = {
  searchParams: Promise<{
    brand?: string;
    product?: string;
    sku?: string;
    type?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Commercial Correspondence | Mack Knit Wear",
  description:
    "Direct trade desk contact and client-side correspondence composer for wholesale, private label, and yarn sampling inquiries.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Commercial Correspondence | Mack Knit Wear",
    description:
      "Direct trade desk contact and client-side correspondence composer for wholesale, private label, and yarn sampling inquiries.",
    url: "/contact",
    siteName: "Mack Knit Wear",
  },
};

export default async function ContactPage({ searchParams }: Props) {
  const sParams = await searchParams;

  return (
    <ContactCorrespondence
      initialBrand={sParams.brand}
      initialProduct={sParams.product}
      initialSku={sParams.sku}
      initialType={sParams.type}
    />
  );
}
