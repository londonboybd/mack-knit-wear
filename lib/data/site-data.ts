import type {
  SiteSettings,
  Associate,
  Product,
  Brand,
  HomeContent,
  AboutContent,
} from "./types";

export * from "./types";

export const siteSettings: SiteSettings = {
  title: "Mack Knit Wear",
  tagline: "Contemporary Knitwear Portfolio & Brand Incubator",
  companyName: "Mack Knit Wear",
  description:
    "A composed textile portfolio and brand incubator based in Dhaka, Bangladesh.",
  email: "inquiries@mackknitwear.com",
  phone: "+880 2 887 8100",
  address: "Dhaka, Bangladesh",
  headerNav: [
    { id: "about", label: "About", href: "/about" },
    { id: "brands", label: "Brands", href: "/brands" },
    { id: "products", label: "Products", href: "/products" },
    { id: "associates", label: "Associates", href: "/associates" },
    { id: "contact", label: "Contact", href: "/contact" },
  ],
  footerNav: [
    { id: "about", label: "About Us", href: "/about" },
    { id: "brands", label: "Brands Portfolio", href: "/brands" },
    { id: "products", label: "Product Catalogue", href: "/products" },
    { id: "associates", label: "Industrial Associates", href: "/associates" },
    { id: "contact", label: "Commercial Correspondence", href: "/contact" },
  ],
};

export const homeContent: HomeContent = {
  headline: "Everyday essentials.\nA distinct point of view.",
  subhead:
    "A composed textile portfolio with a distinct consumer-brand experience inside it. Engineered in Dhaka for international distribution.",
  heroImage: "/images/textile_hero.jpg",
  heroImageAlt:
    "Contemporary knitwear textile textures and combed cotton fabric in natural tones",
  ctaPrimary: { label: "Explore londonBoy", href: "/brands/londonboy" },
  ctaSecondary: { label: "Meet Mack Knit Wear", href: "#mack-intro" },
  mackIntro: {
    eyebrow: "01 — THE ENTERPRISE",
    heading: "Composed craftsmanship, industrial credibility.",
    body: "Mack Knit Wear operates as a specialized textile and brand development group based in Dhaka, Bangladesh. We bridge disciplined manufacturing execution with contemporary brand vision. Working alongside our accredited manufacturing associates, we develop everyday wardrobe essentials defined by tactile longevity, precise gauge execution, and responsible manufacturing discipline.",
  },
  londonBoyFeature: {
    eyebrow: "02 — SIGNATURE BRAND",
    name: "londonBoy",
    tagline: "Everyday apparel. Confident and expressive.",
    description:
      "londonBoy is Mack Knit Wear's premier consumer brand, focusing exclusively on everyday essentials: structured ribbed socks and combed cotton innerwear designed with a distinct point of view.",
    cta: { label: "Explore londonBoy", href: "/brands/londonboy" },
    categories: [
      {
        id: "socks",
        name: "Socks",
        slug: "socks",
        tagline: "Structured rhythm & architectural knit",
        description:
          "Sharply cropped, dense vertical ribbing engineered for structural retention and all-day comfort.",
        image: "/images/socks_scene.jpg",
        imageAlt: "Structured ribbed knit socks arranged in vertical rhythm",
        href: "/brands/londonboy/socks",
      },
      {
        id: "innerwear",
        name: "Innerwear",
        slug: "innerwear",
        tagline: "Soft daylight & relaxed garment framing",
        description:
          "Pure combed cotton jersey essentials with gentle drape, breathable softness, and clean lines.",
        image: "/images/innerwear_scene.jpg",
        imageAlt:
          "Premium combed cotton folded innerwear tees and boxers in natural daylight",
        href: "/brands/londonboy/innerwear",
      },
    ],
  },
  associatesPreview: {
    eyebrow: "03 — INDUSTRIAL NETWORK",
    heading: "Built alongside specialized manufacturing associates.",
    description:
      "Our production capability relies on direct collaboration with three independent manufacturing associates in Bangladesh, each bringing specialized technical capability.",
    cta: { label: "View industrial directory", href: "/associates" },
  },
  contactPrompt: {
    eyebrow: "04 — CORRESPONDENCE",
    heading: "Transparent commercial dialogue.",
    body:
      "We invite wholesale inquiries, sample reviews, and development discussions directly with our commercial desk in Dhaka.",
    cta: { label: "Initiate dialogue", href: "/contact" },
  },
};

export const aboutContent: AboutContent = {
  eyebrow: "COMPANY JOURNAL",
  title: "A disciplined textile practice.",
  intro:
    "Mack Knit Wear is a contemporary textile development group and brand incubator based in Dhaka, Bangladesh. We operate at the intersection of material architecture, responsible production discipline, and consumer brand focus.",
  image: "/images/knitwear.jpg",
  imageAlt: "Close-up definition of fine gauge knit structure",
  caption: "Gauge definition & loop structure · Dhaka development studio",
  chapters: [
    {
      id: "the-enterprise",
      number: "01",
      title: "The Enterprise",
      anchor: "the-enterprise",
      lead: "Mack Knit Wear develops everyday knitted apparel with an emphasis on tactile quality and construction integrity.",
      content: [
        "Headquartered in Dhaka, we combine local textile infrastructure with modern brand curation. Rather than pursuing unrestrained volume, our focus centers on disciplined product programs executed to exacting international standards.",
        "We approach knitwear as an architectural medium — selecting yarn weights, twist factors, and stitch densities that preserve their shape, drape, and hand-feel through repeated washing and daily wear.",
      ],
      stats: [
        { label: "Operating Hub", value: "Dhaka, Bangladesh" },
        { label: "Core Discipline", value: "Textiles & Brand Incubation" },
      ],
    },
    {
      id: "londonboy-identity",
      number: "02",
      title: "londonBoy Identity",
      anchor: "londonboy-identity",
      lead: "londonBoy represents our direct consumer-brand expression, focused strictly on two foundational apparel categories.",
      content: [
        "Conceived as an antidote to disposable basics, londonBoy specializes exclusively in Socks and Innerwear. Each category receives focused engineering attention rather than being treated as an afterthought in a sprawling catalogue.",
        "The collection pairs architectural ribbing and hand-linked closures in socks with long-staple combed cotton jersey in base layers, achieving everyday distinction through material honesty.",
      ],
      stats: [
        { label: "Brand Classification", value: "Signature Consumer Brand" },
        { label: "Focused Categories", value: "Socks & Innerwear Only" },
      ],
    },
    {
      id: "industrial-associates",
      number: "03",
      title: "Industrial Associates",
      anchor: "industrial-associates",
      lead: "Our manufacturing capability is realized through collaborative relationships with three accredited industrial associates in Bangladesh.",
      content: [
        "Rather than claiming exclusive factory ownership, we maintain direct technical partnerships with independent manufacturers across Dhaka Division, Gazipur, and Narayanganj.",
        "Each partner contributes verified technical strengths across composite knitting, large-scale assembly, and precision hand-finishing, providing flexible capacity and rigorous quality governance.",
      ],
      stats: [
        { label: "Network Partners", value: "3 Named Industrial Associates" },
        { label: "Production Scope", value: "Knitting, Cutting & Finishing" },
      ],
    },
    {
      id: "commercial-correspondence",
      number: "04",
      title: "Commercial Correspondence",
      anchor: "commercial-correspondence",
      lead: "We engage directly with international wholesale buyers, private label clients, and retail partners.",
      content: [
        "Our trade desk in Dhaka facilitates direct correspondence, sample requests, and technical specification reviews without intermediary layers. Every inquiry connects you with production coordinators who understand yarn counts, lead times, and factory scheduling.",
        "We welcome commercial inquiries and sample requests from retail stockists seeking reliable knitwear production backed by transparent dialogue.",
      ],
      stats: [
        { label: "Trade Desk Location", value: "Dhaka (BST Timezone)" },
        { label: "Primary Channel", value: "Direct Trade Correspondence" },
      ],
    },
  ],
};

export const londonBoyBrand: Brand = {
  id: "brand-londonboy",
  slug: "londonboy",
  name: "londonBoy",
  wordmark: "londonBoy",
  category: "Signature Consumer Brand",
  tagline: "Everyday essentials. A distinct point of view.",
  summary:
    "londonBoy is Mack Knit Wear's premier consumer brand, focusing exclusively on everyday essentials: structured ribbed socks and combed cotton innerwear designed with a distinct point of view.",
  description:
    "londonBoy is Mack Knit Wear's premier consumer brand, focusing exclusively on everyday essentials: structured ribbed socks and combed cotton innerwear designed with a distinct point of view.",
  statement:
    "We believe everyday apparel deserves deliberate engineering. By focusing entirely on Socks and Innerwear, londonBoy achieves material depth, comfortable structural retention, and lasting tactile pleasure in the garments worn closest to the body.",
  editorialStatement:
    "We believe everyday apparel deserves deliberate engineering. By focusing entirely on Socks and Innerwear, londonBoy achieves material depth, comfortable structural retention, and lasting tactile pleasure in the garments worn closest to the body.",
  heroImage: "/images/textile_hero.jpg",
  heroImageAlt: "londonBoy textile and apparel composition",
  inquiryNotice:
    "Direct wholesale inquiries and sample requests are coordinated through our Dhaka commercial desk.",
  categories: [
    {
      id: "socks",
      name: "Socks",
      slug: "socks",
      tagline: "Structured rhythm & architectural knit",
      description:
        "Knitted on precision circular machines in Bangladesh, our socks program is engineered with continuous vertical rib structures that stay upright without aggressive elastic constriction. Reinforced heels and toes with hand-linked closures ensure durability and seamless comfort.",
      image: "/images/socks_scene.jpg",
      imageAlt: "Dense vertical ribbed crew socks in charcoal and off-white",
      href: "/brands/londonboy/socks",
    },
    {
      id: "innerwear",
      name: "Innerwear",
      slug: "innerwear",
      tagline: "Soft daylight & relaxed garment framing",
      description:
        "Crafted from long-staple combed cotton jersey, each garment features soft, flatlock seams to minimize friction against skin. Clean necklines, covered elastic waistbands, and breathable drape define our fundamental base layers.",
      image: "/images/innerwear_scene.jpg",
      imageAlt:
        "Combed cotton jersey crew undershirt and boxer shorts folded on natural linen",
      href: "/brands/londonboy/innerwear",
    },
  ],
  scenes: {
    socks: {
      id: "socks",
      title: "SOCKS",
      subtitle: "Vertical Rhythm & Structured Architecture",
      description:
        "A sharper, structured composition defined by high-gauge vertical ribbing, reinforced heel-and-toe shaping, and dense yarn twists designed to hold silhouette throughout the day.",
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
      description:
        "A softer, lighter composition crafted from combed natural cotton jersey. Clean necklines, flatlock comfort seams, and balanced proportions for essential daily wear.",
      image: "/images/innerwear_scene.jpg",
      imageAlt: "Combed cotton innerwear jersey essentials in soft daylight",
      cta: {
        label: "Explore Innerwear Collection",
        href: "/brands/londonboy/innerwear",
      },
      keyNotes: [
        "Combed long-staple cotton",
        "Non-chafing flatlock seams",
        "Balanced daily proportions",
      ],
    },
  },
};

export const brandsList: Brand[] = [londonBoyBrand];

export const productsList: Product[] = [
  {
    id: "prod-lb-sock-01",
    slug: "structured-ribbed-crew-sock",
    name: "Structured Ribbed Crew Sock",
    brand: "londonBoy",
    category: "Socks",
    categorySlug: "socks",
    refCode: "LB-SK-01",
    summary:
      "Heavy-gauge vertical ribbed crew sock engineered for structural stability and cushioned daily comfort.",
    description:
      "The foundation of the londonBoy socks program. Knit from combed cotton yarn blended with a fine nylon core for recovery and resilience. Features a hand-linked seamless toe closure to eliminate chafing and a reinforced heel pocket that prevents slipping inside footwear.",
    image: "/images/socks_scene.jpg",
    imageAlt: "Structured ribbed crew socks in slate charcoal and chalk ecru",
    secondaryImage: "/images/knitwear.jpg",
    gallery: [
      {
        image: "/images/socks_scene.jpg",
        alt: "Structured ribbed crew sock vertical display",
        caption: "Architectural 3x1 Rib Structure",
      },
      {
        image: "/images/knitwear.jpg",
        alt: "Close-up of knit texture and yarn loop integrity",
        caption: "Loop density and hand-linked closure detail",
      },
    ],
    specifications: [
      { label: "Category", value: "Crew Socks" },
      { label: "Knit Profile", value: "3x1 Engineered Heavy Rib" },
      { label: "Toe Closure", value: "Hand-linked seamless finish" },
      { label: "Cuff Design", value: "Non-constricting elastic stay-up welt" },
      { label: "Origin", value: "Knitted and finished in Bangladesh" },
    ],
    featured: true,
  },
  {
    id: "prod-lb-sock-02",
    slug: "fine-gauge-mercerized-dress-sock",
    name: "Fine-Gauge Mercerized Dress Sock",
    brand: "londonBoy",
    category: "Socks",
    categorySlug: "socks",
    refCode: "LB-SK-02",
    summary:
      "Smooth, lustrous fine-knit sock crafted from mercerized cotton for formal tailoring and subtle elegance.",
    description:
      "Engineered on 200-needle circular knitting cylinders for ultra-smooth surface uniformity. Mercerization enhances cotton luster, deepens dye uptake, and significantly reduces surface piling.",
    image: "/images/socks_scene.jpg",
    imageAlt: "Fine gauge mercerized dress sock in midnight slate",
    secondaryImage: "/images/socks_scene.jpg",
    gallery: [
      {
        image: "/images/socks_scene.jpg",
        alt: "Fine gauge dress sock surface texture",
        caption: "Mercerized yarn with smooth sheen",
      },
    ],
    specifications: [
      { label: "Category", value: "Dress Socks" },
      { label: "Needle Count", value: "200-Needle Single Cylinder" },
      { label: "Yarn Treatment", value: "Double Mercerized Long-Staple Cotton" },
      { label: "Heel / Toe", value: "Reciprocated reinforced heel and toe" },
      { label: "Origin", value: "Knitted and finished in Bangladesh" },
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
    summary:
      "Breathable combed cotton jersey undershirt with stay-flat bound collar and tailored fit.",
    description:
      "A pure base-layer essential. Made from 100% single-knit combed cotton jersey for natural moisture absorption and airflow. The collar is bound with fine 1x1 ribbing that remains flat after repeated machine washing.",
    image: "/images/innerwear_scene.jpg",
    imageAlt: "Combed cotton crew undershirt neatly folded in white",
    secondaryImage: "/images/knitwear.jpg",
    gallery: [
      {
        image: "/images/innerwear_scene.jpg",
        alt: "Combed cotton crew undershirt neatly folded",
        caption: "Clean neckline and single jersey drape",
      },
      {
        image: "/images/knitwear.jpg",
        alt: "Close-up of cotton jersey stitch consistency",
        caption: "Single jersey knit structure",
      },
    ],
    specifications: [
      { label: "Category", value: "Innerwear Base Layer" },
      { label: "Fabric", value: "100% Combed Single Jersey" },
      { label: "Seams", value: "Flatlock soft-touch seams" },
      { label: "Collar", value: "Ribbed stay-flat bound collar" },
      { label: "Origin", value: "Knitted and finished in Bangladesh" },
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
    summary:
      "Soft knit jersey boxer with covered elastic waistband and non-restrictive relaxed leg opening.",
    description:
      "Combines the breathability of pure cotton knit with relaxed comfort. An enclosed elastic waistband prevents skin contact with bare elastic.",
    image: "/images/innerwear_scene.jpg",
    imageAlt: "Relaxed jersey boxer shorts in chalk grey",
    secondaryImage: "/images/innerwear_scene.jpg",
    gallery: [
      {
        image: "/images/innerwear_scene.jpg",
        alt: "Relaxed jersey boxer short folded in natural daylight",
        caption: "Soft jersey drape and covered waistband",
      },
    ],
    specifications: [
      { label: "Category", value: "Underwear" },
      { label: "Waistband", value: "Enclosed self-fabric elastic waistband" },
      { label: "Fabric", value: "Breathable cotton knit jersey" },
      { label: "Fit", value: "Relaxed daily drape" },
      { label: "Origin", value: "Knitted and finished in Bangladesh" },
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
    description:
      "Sufia Hawlader Composite Ltd. operates composite textile manufacturing facilities, incorporating circular knitting machines and wet-processing dye houses. Their production scope supports consistent fabric quality, colorfastness standards, and managed effluent treatment systems.",
    displayMark: "SHC",
  },
  {
    number: "02",
    name: "Umeda SB Industries Ltd.",
    role: "Knitting & Garment Assembly Partner",
    location: "Gazipur, Bangladesh",
    description:
      "Umeda SB Industries Ltd. specializes in modern knitting infrastructure and garment assembly for export markets. Their facility emphasizes in-line quality inspection, stitch consistency across diverse gauges, and structured compliance with occupational safety regulations.",
    website: "https://umedasb.com/",
    displayMark: "USB",
  },
  {
    number: "03",
    name: "Alam Garments",
    role: "Precision Cutting & Finishing Partner",
    location: "Narayanganj, Bangladesh",
    description:
      "Alam Garments provides focused expertise in precision cutting, linking, and garment finishing. Located in Bangladesh's historic textile corridor in Narayanganj, the facility brings dependable craftsmanship to delicate knit finishes, collar linkings, and export packaging.",
    website: "https://alamgarments.com/",
    displayMark: "AG",
  },
];
