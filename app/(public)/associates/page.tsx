import type { Metadata } from "next";
import { AssociatesDirectory } from "@/components/associates-directory";

export const metadata: Metadata = {
  title: "Industrial Associates Directory | Mack Knit Wear",
  description:
    "Accredited collaborative manufacturing partners in Bangladesh: Sufia Hawlader Composite Ltd., Umeda SB Industries Ltd., and Alam Garments.",
  alternates: {
    canonical: "/associates",
  },
  openGraph: {
    title: "Industrial Associates Directory | Mack Knit Wear",
    description:
      "Accredited collaborative manufacturing partners in Bangladesh: Sufia Hawlader Composite Ltd., Umeda SB Industries Ltd., and Alam Garments.",
    url: "/associates",
    siteName: "Mack Knit Wear",
  },
};

export default function AssociatesPage() {
  return <AssociatesDirectory />;
}
