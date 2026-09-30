import type { Metadata } from "next";
import { AboutJournal } from "@/components/about-journal";

export const metadata: Metadata = {
  title: "A Company Journal | Mack Knit Wear",
  description:
    "Reading-led company journal on Mack Knit Wear, londonBoy brand incubation, and accredited manufacturing associates.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "A Company Journal | Mack Knit Wear",
    description:
      "Reading-led company journal on Mack Knit Wear, londonBoy brand incubation, and accredited manufacturing associates.",
    url: "/about",
    siteName: "Mack Knit Wear",
  },
};

export default function AboutPage() {
  return <AboutJournal />;
}
