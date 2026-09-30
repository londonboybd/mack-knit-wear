import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicRecords, fallbackSettings } from "@/lib/content";
import { HomeView } from "@/components/home-view";
import { AboutJournal } from "@/components/about-journal";
import { BrandsPortfolio } from "@/components/brands-portfolio";
import { LondonBoyBrand } from "@/components/londonboy-brand";
import { CategoryView } from "@/components/category-view";
import { ProductDirectory } from "@/components/product-directory";
import { ProductDetail } from "@/components/product-detail";
import { AssociatesDirectory } from "@/components/associates-directory";
import { ContactCorrespondence } from "@/components/contact-correspondence";

type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{
    brand?: string;
    product?: string;
    sku?: string;
    type?: string;
    q?: string;
    category?: string;
    p?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://mackknitwear.com";

  let title = "Mack Knit Wear";
  let description = "A composed textile portfolio with a distinct consumer-brand experience inside it. Dhaka, Bangladesh.";
  let canonicalPath = "/";

  if (slug.length === 0) {
    title = "Mack Knit Wear · Contemporary Textiles & Brand Development";
    description = "Everyday essentials. A distinct point of view. Composed knitwear portfolio developed in Dhaka.";
    canonicalPath = "/";
  } else if (slug[0] === "about") {
    title = "A Company Journal | Mack Knit Wear";
    description = "Reading-led company journal on Mack Knit Wear, londonBoy brand incubation, and accredited manufacturing associates.";
    canonicalPath = "/about";
  } else if (slug[0] === "brands" && slug.length === 1) {
    title = "Brand Portfolio Exhibition | Mack Knit Wear";
    description = "Discover londonBoy, Mack Knit Wear's premier signature everyday apparel label.";
    canonicalPath = "/brands";
  } else if (slug[0] === "brands" && slug[1] === "londonboy") {
    if (slug.length === 2) {
      title = "londonBoy · Signature Brand | Mack Knit Wear";
      description = "Everyday apparel. Confident and expressive. Focused on structured socks and combed cotton innerwear.";
      canonicalPath = "/brands/londonboy";
    } else if (slug[2] === "socks") {
      title = "Socks Collection · londonBoy | Mack Knit Wear";
      description = "Vertical rhythm, structured architecture, and dense ribbing engineered in Bangladesh.";
      canonicalPath = "/brands/londonboy/socks";
    } else if (slug[2] === "innerwear") {
      title = "Innerwear Collection · londonBoy | Mack Knit Wear";
      description = "Combed natural cotton jersey essentials with gentle drape, breathable softness, and clean lines.";
      canonicalPath = "/brands/londonboy/innerwear";
    }
  } else if (slug[0] === "products") {
    if (slug.length === 1) {
      title = "Practical Product Catalogue | Mack Knit Wear";
      description = "Structured socks and combed cotton innerwear engineered for durability and tactile quality.";
      canonicalPath = "/products";
    } else if (slug.length === 2) {
      const records = await publicRecords();
      const product = records.find((r) => r.kind === "product" && r.slug === slug[1]);
      title = product ? `${product.published?.title || "Product"} | Mack Knit Wear` : "Product Details | Mack Knit Wear";
      description = product?.published?.summary || "Product specifications and inquiry details.";
      canonicalPath = `/products/${slug[1]}`;
    }
  } else if (slug[0] === "associates" || slug[0] === "network") {
    title = "Industrial Associates Directory | Mack Knit Wear";
    description = "Accredited collaborative manufacturing partners in Bangladesh: Sufia Hawlader Composite Ltd., Umeda SB Industries Ltd., and Alam Garments.";
    canonicalPath = "/associates";
  } else if (slug[0] === "contact") {
    title = "Commercial Correspondence | Mack Knit Wear";
    description = "Direct trade desk contact and client-side correspondence composer for wholesale and contract inquiries.";
    canonicalPath = "/contact";
  } else if (slug[0] === "privacy") {
    title = "Commercial Privacy Notice | Mack Knit Wear";
    description = "Mack Knit Wear's commitment to commercial confidentiality and data privacy.";
    canonicalPath = "/privacy";
  }

  return {
    title,
    description,
    alternates: {
      canonical: `${base.replace(/\/$/, "")}${canonicalPath}`,
    },
    openGraph: {
      title,
      description,
      url: `${base.replace(/\/$/, "")}${canonicalPath}`,
      siteName: "Mack Knit Wear",
    },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { slug = [] } = await params;
  const sParams = await searchParams;
  const records = await publicRecords();

  // 1. Home Route: /
  if (slug.length === 0) {
    return <HomeView />;
  }

  // 2. About Route: /about
  if (slug.length === 1 && slug[0] === "about") {
    return <AboutJournal />;
  }

  // 3. Brands Directory: /brands
  if (slug.length === 1 && slug[0] === "brands") {
    return <BrandsPortfolio />;
  }

  // 4. londonBoy Signature Brand: /brands/londonboy
  if (slug.length === 2 && slug[0] === "brands" && slug[1] === "londonboy") {
    return <LondonBoyBrand />;
  }

  // 5. Category Routes: /brands/londonboy/socks and /brands/londonboy/innerwear
  if (slug.length === 3 && slug[0] === "brands" && slug[1] === "londonboy") {
    if (slug[2] === "socks") {
      return <CategoryView categorySlug="socks" />;
    }
    if (slug[2] === "innerwear") {
      return <CategoryView categorySlug="innerwear" />;
    }
    notFound();
  }

  // 6. Product Detail: /products/[slug]
  if (slug.length === 2 && slug[0] === "products") {
    const productRecord = records.find(
      (r) => r.kind === "product" && r.slug === slug[1]
    );
    if (!productRecord) notFound();
    return <ProductDetail product={productRecord} allRecords={records} />;
  }

  // 7. Products Catalogue: /products
  if (slug.length === 1 && slug[0] === "products") {
    const pageRecord = records.find((r) => r.kind === "page" && r.slug === "products");
    const products = records.filter((r) => r.kind === "product" && r.published);
    return (
      <ProductDirectory
        page={pageRecord?.published || fallbackSettings}
        products={products}
        allRecords={records}
      />
    );
  }

  // 8. Associates Directory: /associates or legacy /network
  if (slug.length === 1 && (slug[0] === "associates" || slug[0] === "network")) {
    return <AssociatesDirectory />;
  }

  // 9. Contact: /contact
  if (slug.length === 1 && slug[0] === "contact") {
    return (
      <ContactCorrespondence
        initialBrand={sParams.brand}
        initialProduct={sParams.product}
        initialSku={sParams.sku}
        initialType={sParams.type}
      />
    );
  }

  // 10. Privacy Policy: /privacy
  if (slug.length === 1 && slug[0] === "privacy") {
    const privacyRecord = records.find((r) => r.kind === "page" && r.slug === "privacy");
    return (
      <div className="section-container privacy-page" style={{ padding: "80px 20px", maxWidth: "800px" }}>
        <span className="hero-eyebrow">COMMERCIAL GOVERNANCE</span>
        <h1 className="editorial-heading" style={{ margin: "20px 0 30px" }}>Commercial Confidentiality & Privacy Notice</h1>
        <div className="prose" style={{ fontSize: "17px", lineHeight: "1.8", color: "var(--mack-text)" }}>
          <p>
            Mack Knit Wear respects commercial confidentiality. Contact inquiries submitted via our correspondence desk or direct email are processed solely to evaluate and respond to your trade requests. We do not transmit customer or partner details to third-party marketing services or commercial brokers.
          </p>
          <h3 style={{ marginTop: "32px", marginBottom: "12px", fontFamily: "var(--sans)", fontWeight: 600 }}>Data Collection & Use</h3>
          <p>
            Information provided through our client-side inquiry composer (such as your name, corporate email address, and project requirements) is formatted directly for transmission via your personal email application. No intermediary web servers or third-party databases retain this submission data.
          </p>
          <h3 style={{ marginTop: "32px", marginBottom: "12px", fontFamily: "var(--sans)", fontWeight: 600 }}>Trade Desk Contact</h3>
          <p>
            For privacy inquiries or to update your company contact records, reach out directly to our commercial trade desk in Dhaka, Bangladesh at <strong>inquiries@mackknitwear.com</strong>.
          </p>
        </div>
      </div>
    );
  }

  // 404 for any other route
  notFound();
}
