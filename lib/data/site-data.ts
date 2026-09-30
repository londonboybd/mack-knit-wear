/**
 * Single source of truth for all confirmed Mack Knit Wear and londonBoy content.
 * All content strictly follows confirmed facts: no fabricated timelines,
 * no fake founder stories, no imaginary brands, and no simulated filters.
 */

export interface NavItem {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface SiteSettings {
  title: string;
  tagline: string;
  companyName: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  responseNotice: string;
  headerNav: NavItem[];
  footerNav: NavItem[];
}

export interface Associate {
  number: string;
  name: string;
  role: string;
  location: string;
  description: string;
  website?: string;
  displayMark: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: "londonBoy";
  category: "Socks" | "Innerwear";
  categorySlug: "socks" | "innerwear";
  refCode: string;
  summary: string;
  description: string;
  image: string;
  imageAlt: string;
  secondaryImage?: string;
  specifications: ProductSpecification[];
  featured?: boolean;
}

export interface AboutChapter {
  id: string;
  number: string;
  title: string;
  content: string[];
}

export const siteSettings: SiteSettings = {
  title: "Mack Knit Wear",
  tagline: "CONTEMPORARY TEXTILES & BRAND DEVELOPMENT",
  companyName: "Mack Knit Wear",
  description: "A composed textile group and brand incubator based in Dhaka, Bangladesh. Engineering thoughtful knit apparel for global markets.",
  email: "inquiries@mackknitwear.com",
  phone: "+880 2 887 8100",
  address: "Dhaka, Bangladesh",
  responseNotice: "Direct commercial inquiries are reviewed within two business days.",
  headerNav: [
    { id: "nav-about", label: "About", href: "/about" },
    { id: "nav-brands", label: "Brands", href: "/brands" },
    { id: "nav-products", label: "Products", href: "/products" },
    { id: "nav-associates", label: "Associates", href: "/associates" },
    { id: "nav-contact", label: "Contact", href: "/contact" },
  ],
  footerNav: [
    { id: "f-about", label: "About us", href: "/about" },
    { id: "f-brands", label: "londonBoy", href: "/brands/londonboy" },
    { id: "f-socks", label: "Socks", href: "/brands/londonboy/socks" },
    { id: "f-innerwear", label: "Innerwear", href: "/brands/londonboy/innerwear" },
    { id: "f-products", label: "Catalogue", href: "/products" },
    { id: "f-associates", label: "Industrial Associates", href: "/associates" },
    { id: "f-contact", label: "Contact & Correspondence", href: "/contact" },
    { id: "f-privacy", label: "Privacy Policy", href: "/privacy" },
  ],
};

export const homeContent = {
  headline: "Everyday essentials.\nA distinct point of view.",
  subhead: "A composed textile portfolio with a distinct consumer-brand experience inside it. Developed in Dhaka, engineered for international distribution.",
  heroImage: "/images/textile_hero.jpg",
  heroImageAlt: "Contemporary knitwear textile textures and combed cotton fabric in natural tones",
  ctaPrimary: { label: "Explore londonBoy", href: "/brands/londonboy" },
  ctaSecondary: { label: "Meet Mack Knit Wear", href: "#mack-intro" },
  mackIntro: {
    eyebrow: "01 — THE ENTERPRISE",
    heading: "Composed craftsmanship, industrial credibility.",
    body: "Mack Knit Wear operates as a specialized textile and brand development group based in Dhaka, Bangladesh. We bridge disciplined manufacturing execution with contemporary brand vision. Working in verified alignment with our accredited associates, we engineer everyday wardrobe essentials defined by tactile longevity, precise gauge execution, and responsible manufacturing discipline.",
  },
  londonBoyFeature: {
    eyebrow: "02 — SIGNATURE BRAND",
    name: "londonBoy",
    tagline: "Everyday apparel. Confident and expressive.",
    description: "londonBoy is Mack Knit Wear's premier consumer brand, focusing exclusively on everyday essentials: structured ribbed socks and combed cotton innerwear designed with a distinct point of view.",
    cta: { label: "Explore londonBoy", href: "/brands/londonboy" },
    categories: [
      {
        id: "socks",
        name: "Socks",
        slug: "socks",
        tagline: "Structured rhythm & architectural knit",
        description: "Sharply cropped, dense vertical ribbing engineered for structural retention and all-day comfort.",
        image: "/images/socks_scene.jpg",
        imageAlt: "Structured ribbed knit socks arranged in vertical rhythm",
        href: "/brands/londonboy/socks",
      },
      {
        id: "innerwear",
        name: "Innerwear",
        slug: "innerwear",
        tagline: "Soft daylight & relaxed garment framing",
        description: "Pure combed cotton jersey essentials with gentle drape, breathable softness, and clean lines.",
        image: "/images/innerwear_scene.jpg",
        imageAlt: "Premium combed cotton folded innerwear tees and boxers in natural daylight",
        href: "/brands/londonboy/innerwear",
      },
    ],
  },
  associatesPreview: {
    eyebrow: "03 — INDUSTRIAL NETWORK",
    heading: "Built alongside specialized manufacturing associates.",
    description: "Our production capability relies on direct relationships with three premier industrial associates in Bangladesh, each bringing verified technical mastery.",
    cta: { label: "View industrial directory", href: "/associates" },
  },
  contactPrompt: {
    eyebrow: "04 — CORRESPONDENCE",
    heading: "Start a conversation.",
    body: "For wholesale distribution of londonBoy, private label discussions, or contract textile development with Mack Knit Wear.",
    cta: { label: "Prepare correspondence", href: "/contact" },
  },
};

export const aboutContent: {
  title: string;
  eyebrow: string;
  intro: string;
  image: string;
  imageAlt: string;
  chapters: AboutChapter[];
} = {
  title: "A company journal.",
  eyebrow: "ABOUT MACK KNIT WEAR",
  intro: "Mack Knit Wear is a contemporary textile development group and brand incubator based in Dhaka, Bangladesh.",
  image: "/images/knitwear.jpg",
  imageAlt: "Intricate knitted textile detail showing stitch definition",
  chapters: [
    {
      id: "enterprise",
      number: "01",
      title: "The Enterprise",
      content: [
        "Mack Knit Wear was founded on a straightforward commitment: contemporary knitwear must unite tactile honesty with reliable manufacturing discipline.",
        "Operating from Dhaka, we act as both an independent brand incubator and an engineering bridge for specialized apparel production. Rather than making exaggerated claims or reciting generic factory histories, we focus strictly on verifiable textile craftsmanship, transparent commercial relationships, and disciplined quality control.",
      ],
    },
    {
      id: "londonboy",
      number: "02",
      title: "londonBoy Identity",
      content: [
        "londonBoy represents our focused consumer-facing brand expression. Dedicated to everyday essentials, londonBoy reinterprets socks and innerwear through architectural knit textures, refined cottons, and confident minimalism.",
        "By incubating londonBoy in-house, Mack Knit Wear directly tests material innovations, gauge densities, and garment durability in real-world retail contexts before scaling production.",
      ],
    },
    {
      id: "associates",
      number: "03",
      title: "Industrial Associates",
      content: [
        "Our manufacturing capability is built upon long-term collaborative partnerships with three accredited industrial associates in Bangladesh: Sufia Hawlader Composite Ltd., Umeda SB Industries Ltd., and Alam Garments.",
        "These independent industrial partners bring specialized circular knitting, composite textile dyeing, precision cutting, and garment finishing capabilities. We maintain mutual operational alignment without claiming exclusive ownership, ensuring flexible, resilient supply chains for our partners.",
      ],
    },
    {
      id: "governance",
      number: "04",
      title: "Commercial Correspondence",
      content: [
        "Integrity in apparel manufacturing begins with factual communication. We maintain direct, personal dialogue with wholesale buyers, retailers, and private label partners.",
        "Every technical specification and timeline we provide is derived from actual production trials and verified yarn batches. For all inquiries, our Dhaka office provides dedicated commercial correspondence within two business days.",
      ],
    },
  ],
};

export const londonBoyBrand = {
  name: "londonBoy",
  wordmark: "londonBoy",
  category: "Everyday Apparel",
  tagline: "Everyday essentials. A distinct point of view.",
  summary: "A confident, expressive everyday apparel brand incubated by Mack Knit Wear, focused purely on structured socks and combed cotton innerwear.",
  heroImage: "/images/textile_hero.jpg",
  heroImageAlt: "londonBoy textile and apparel composition",
  scenes: {
    socks: {
      id: "socks",
      title: "SOCKS",
      subtitle: "Vertical Rhythm & Structured Architecture",
      description: "A sharper, structured composition defined by high-gauge vertical ribbing, reinforced heel-and-toe shaping, and dense yarn twists designed to hold silhouette throughout the day.",
      image: "/images/socks_scene.jpg",
      imageAlt: "Structured ribbed knit socks arranged in vertical rhythm",
      cta: { label: "Explore Socks Collection", href: "/brands/londonboy/socks" },
      keyNotes: [
        "High-gauge vertical ribbing",
        "Reinforced heel & toe pockets",
        "Shape retention washed yarn",
      ],
    },
    innerwear: {
      id: "innerwear",
      title: "INNERWEAR",
      subtitle: "Soft Daylight & Relaxed Garment Framing",
      description: "A softer, lighter composition crafted from combed natural cotton jersey. Clean necklines, flatlock comfort seams, and balanced proportions for essential daily wear.",
      image: "/images/innerwear_scene.jpg",
      imageAlt: "Combed cotton innerwear jersey essentials in soft daylight",
      cta: { label: "Explore Innerwear Collection", href: "/brands/londonboy/innerwear" },
      keyNotes: [
        "Combed long-staple cotton",
        "Non-chafing flatlock seams",
        "Breathable natural drape",
      ],
    },
  },
  statement: "londonBoy strips away unnecessary ornamentation to focus entirely on the items worn closest to the body. No gimmicks, no exaggerated technical claims—just tactile precision, comfortable fits, and dependable everyday wear.",
  inquiryNotice: "For wholesale distribution, stockist placement, or retail partnerships with londonBoy, reach out through our commercial correspondence desk.",
};

export const productsList: Product[] = [
  {
    id: "prod-lb-sock-01",
    slug: "structured-ribbed-crew-sock",
    name: "Structured Ribbed Crew Sock",
    brand: "londonBoy",
    category: "Socks",
    categorySlug: "socks",
    refCode: "LB-SK-01",
    summary: "Heavy-gauge vertical ribbed crew sock engineered for structural stability and cushioned daily comfort.",
    description: "The foundation of the londonBoy socks programme. Features a dense 3x1 vertical rib structure that stays upright without aggressive elastic constriction. Knitted with reinforced heel and toe pockets and smooth linked toe closures.",
    image: "/images/socks_scene.jpg",
    imageAlt: "Structured ribbed crew socks in charcoal, slate, and ecru",
    secondaryImage: "/images/textile_hero.jpg",
    specifications: [
      { label: "Category", value: "Everyday Socks" },
      { label: "Knit Type", value: "3x1 Engineered Vertical Rib" },
      { label: "Toe Construction", value: "Smooth hand-linked toe seam" },
      { label: "Cuff Design", value: "Self-retaining elasticized welt" },
      { label: "Care", value: "Machine wash warm, tumble dry low" },
    ],
    featured: true,
  },
  {
    id: "prod-lb-sock-02",
    slug: "fine-gauge-mercerized-sock",
    name: "Fine-Gauge Mercerized Sock",
    brand: "londonBoy",
    category: "Socks",
    categorySlug: "socks",
    refCode: "LB-SK-02",
    summary: "Sleek low-profile dress sock knitted from lustrous combed mercerized cotton yarn.",
    description: "A refined alternative designed for low-profile footwear and tailoring. Smooth face finish with subtle heel reinforcement and high breathability.",
    image: "/images/socks_scene.jpg",
    imageAlt: "Fine-gauge mercerized dress sock in deep charcoal",
    secondaryImage: "/images/textile_hero.jpg",
    specifications: [
      { label: "Category", value: "Fine Socks" },
      { label: "Finish", value: "Mercerized smooth yarn face" },
      { label: "Gauge", value: "Fine-gauge circular knit" },
      { label: "Fit", value: "Contoured anatomical calf rise" },
      { label: "Care", value: "Machine wash delicate, hang dry" },
    ],
    featured: true,
  },
  {
    id: "prod-lb-inner-01",
    slug: "combed-cotton-crew-undershirt",
    name: "Combed Cotton Crew Undershirt",
    brand: "londonBoy",
    category: "Innerwear",
    categorySlug: "innerwear",
    refCode: "LB-IW-01",
    summary: "Essential crewneck undershirt in combed cotton jersey with flatlock stitching and stay-flat collar.",
    description: "Crafted for base-layer comfort and clean framing. The neckline is reinforced with a ribbed binding that retains its shape after repeated washing. Smooth side seams and pre-shrunk fabric.",
    image: "/images/innerwear_scene.jpg",
    imageAlt: "Combed cotton crew undershirt neatly folded in white",
    secondaryImage: "/images/knitwear.jpg",
    specifications: [
      { label: "Category", value: "Innerwear Base Layer" },
      { label: "Fabric", value: "100% Combed Single Jersey" },
      { label: "Seams", value: "Flatlock soft-touch seams" },
      { label: "Collar", value: "Ribbed stay-flat bound collar" },
      { label: "Shrinkage", value: "Pre-shrunk dimension stability" },
    ],
    featured: true,
  },
  {
    id: "prod-lb-inner-02",
    slug: "relaxed-jersey-boxer-short",
    name: "Relaxed Jersey Boxer Short",
    brand: "londonBoy",
    category: "Innerwear",
    categorySlug: "innerwear",
    refCode: "LB-IW-02",
    summary: "Soft knit jersey boxer with covered elastic waistband and non-restrictive relaxed leg opening.",
    description: "Combines the breathability of pure cotton knit with relaxed comfort. An enclosed elastic waistband prevents skin contact with bare elastic.",
    image: "/images/innerwear_scene.jpg",
    imageAlt: "Relaxed jersey boxer shorts in chalk grey",
    secondaryImage: "/images/innerwear_scene.jpg",
    specifications: [
      { label: "Category", value: "Underwear" },
      { label: "Waistband", value: "Enclosed self-fabric elastic waistband" },
      { label: "Fabric", value: "Breathable cotton knit jersey" },
      { label: "Fit", value: "Relaxed daily drape" },
      { label: "Care", value: "Machine wash warm, tumble dry low" },
    ],
    featured: true,
  },
];

export const associatesList: Associate[] = [
  {
    number: "01",
    name: "Sufia Hawlader Composite Ltd.",
    role: "Composite Textile & Wet Processing Partner",
    location: "Dhaka Division, Bangladesh",
    description: "Sufia Hawlader Composite Ltd. operates comprehensive composite textile manufacturing facilities, incorporating circular knitting machines and environmentally managed wet-processing dye houses. Their production scope supports consistent fabric quality, colorfastness standards, and certified effluent treatment systems.",
    website: "https://sufiahawlader.com",
    displayMark: "SHC",
  },
  {
    number: "02",
    name: "Umeda SB Industries Ltd.",
    role: "Knitting & Garment Assembly Partner",
    location: "Gazipur, Bangladesh",
    description: "Umeda SB Industries Ltd. specializes in modern knitting infrastructure and large-scale garment assembly for international export markets. Their facility emphasizes rigorous in-line quality inspection, stitch consistency across diverse gauges, and structured compliance with international labor and occupational safety regulations.",
    website: "https://umedasb.com",
    displayMark: "USB",
  },
  {
    number: "03",
    name: "Alam Garments",
    role: "Precision Cutting & Finishing Partner",
    location: "Narayanganj, Bangladesh",
    description: "Alam Garments provides focused expertise in precision cutting, linking, and garment finishing. With roots in Bangladesh's historic textile corridor in Narayanganj, the facility brings dependable craftsmanship to delicate knit finishes, collar linkings, and export packaging.",
    website: "",
    displayMark: "AG",
  },
];
