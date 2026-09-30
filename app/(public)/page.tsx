import type { Metadata } from "next";
import { HomeView } from "@/components/home-view";

export const metadata: Metadata = {
  title: "Everyday essentials. A distinct point of view. | Mack Knit Wear",
  description:
    "A composed textile portfolio with a distinct consumer-brand experience inside it. Engineered in Dhaka for international distribution.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Mack Knit Wear · Contemporary Textiles & Brand Development",
    description:
      "A composed textile portfolio with a distinct consumer-brand experience inside it. Engineered in Dhaka for international distribution.",
    url: "/",
    siteName: "Mack Knit Wear",
  },
};

export default function HomePage() {
  return <HomeView />;
}
