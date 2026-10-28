import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductDirectory } from "@/components/product-directory";

export const metadata: Metadata = {
  title: "Practical Product Catalogue | Mack Knit Wear",
  description:
    "Structured socks and combed cotton innerwear engineered for durability and tactile quality. Knitted and finished across our manufacturing network in Bangladesh.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Practical Product Catalogue | Mack Knit Wear",
    description:
      "Structured socks and combed cotton innerwear engineered for durability and tactile quality.",
    url: "/products",
    siteName: "Mack Knit Wear",
  },
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="catalogue-loading" style={{ minHeight: "60vh", padding: "80px 20px", textAlign: "center" }}>Loading catalogue...</div>}>
      <ProductDirectory />
    </Suspense>
  );
}
