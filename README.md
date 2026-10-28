# Mack Knit Wear — Developer Guide & Architecture Documentation

Mack Knit Wear is a contemporary textile development portfolio and brand incubator based in Dhaka, Bangladesh, showcasing the signature everyday consumer apparel label **londonBoy** (specializing in Socks and Innerwear) alongside three accredited manufacturing associates.

The application is maintained directly by its developers in source code and deployed via Git. It operates **without** an admin dashboard, dynamic CMS database, or user authentication.

---

## 1. Quick Start

### Prerequisites
- **Node.js**: `v22` or later
- **Package Manager**: `npm`

### Installation & Local Development
```bash
# Clone the repository
git clone https://github.com/londonboybd/mack-knit-wear.git
cd mack-knit-wear

# Install dependencies
npm install

# Start local development server (runs at http://localhost:3000)
npm run dev

# Run TypeScript checks
npm run typecheck

# Run automated tests
npm test

# Build for production
npm run build
```

---

## 2. Content Architecture (`lib/data/`)

All site content is strongly typed and stored in local code files under [`lib/data/`](file:///d:/Github%20repos/mack-knit-wear/lib/data):

```
lib/data/
├── types.ts       # TypeScript domain types (Product, Brand, Associate, SiteSettings, etc.)
├── site-data.ts   # Centralized data: settings, productsList, associatesList, londonBoyBrand
└── selectors.ts   # Typed query helpers (getProductBySlug, getProductsByCategory, etc.)
```

### Editing Company Information & Contact Channels
Open [`lib/data/site-data.ts`](file:///d:/Github%20repos/mack-knit-wear/lib/data/site-data.ts) and modify `siteSettings`:
```typescript
export const siteSettings: SiteSettings = {
  title: "Mack Knit Wear",
  tagline: "Contemporary Knitwear Portfolio & Brand Incubator",
  companyName: "Mack Knit Wear",
  description: "A composed textile portfolio and brand incubator based in Dhaka, Bangladesh.",
  email: "inquiries@mackknitwear.com",
  phone: "+880 2 887 8100",
  address: "Dhaka, Bangladesh",
  headerNav: [ ... ],
  footerNav: [ ... ],
};
```
Changes here immediately update the header, mobile drawer, footer, contact channel sidebar, and correspondence recipient across all pages.

### Adding or Editing Products
Add a new product entry to `productsList` in [`lib/data/site-data.ts`](file:///d:/Github%20repos/mack-knit-wear/lib/data/site-data.ts):
```typescript
{
  id: "prod-lb-sock-03",
  slug: "merino-wool-cushioned-boot-sock",
  name: "Merino Wool Cushioned Boot Sock",
  brand: "londonBoy",
  category: "Socks",
  categorySlug: "socks",
  refCode: "LB-SK-03",
  summary: "Dense ribbed boot sock knit from fine Australian merino wool.",
  description: "Detailed construction and technical knit notes...",
  image: "/images/socks_scene.jpg",
  imageAlt: "Merino wool cushioned boot socks in heather grey",
  secondaryImage: "/images/knitwear.jpg",
  specifications: [
    { label: "Category", value: "Boot Socks" },
    { label: "Yarn", value: "80% Merino Wool, 20% Polyamide" },
    { label: "Toe Closure", value: "Hand-linked seamless finish" },
  ],
  featured: true,
}
```
**Automatic Propagation:**
- The catalogue dynamically increments category counters and displays the product.
- The `/brands/londonboy/socks` category page automatically includes it.
- The londonBoy brand showcase carousel includes it.
- Related products algorithms update automatically.
- Next.js statically pre-renders the product detail page (`/products/[slug]`).
- `sitemap.xml` automatically includes the new product URL.

### Adding or Editing Industrial Associates
Update `associatesList` in [`lib/data/site-data.ts`](file:///d:/Github%20repos/mack-knit-wear/lib/data/site-data.ts):
```typescript
{
  number: "03",
  name: "Alam Garments",
  role: "Precision Cutting & Finishing Partner",
  location: "Narayanganj, Bangladesh",
  description: "Detailed operational scope...",
  website: "https://alamgarments.com/", // optional: omitted cleanly if undefined
  displayMark: "AG",
}
```

### Managing Local Images & Alt Text
1. Save web-optimized image files (JPG or WebP) into [`public/images/`](file:///d:/Github%20repos/mack-knit-wear/public/images).
2. Reference images as root-relative paths: `"/images/your-image.jpg"`.
3. Always supply meaningful `imageAlt` attributes describing fabric drape, knit texture, or garment silhouette.

---

## 3. Inquiry Composer (Capabilities & Limitations)

The inquiry composer on `/contact` is **backend-free**:
- **Capabilities:**
  - Carries context (brand, product title, SKU, inquiry classification) automatically from product detail buttons.
  - Normalizes inquiry types case-insensitively (Wholesale, Private Label, Sample Request, Factory Verification, General).
  - Validates return email addresses accessibly before preparing drafts.
  - "Open in Email Client": Pre-fills subject and formatted message using the standard `mailto:` protocol.
  - "Copy Message": Copies cleanly structured text to the system clipboard, with a selectable textarea fallback for restricted browsers.
- **Limitations:**
  - Does **not** store messages on a server or database.
  - Does **not** report false "Message Sent" confirmations.
  - Never collects or shares visitor information with third parties.

---

## 4. Production URL Configuration

Configure the canonical production site URL in your hosting environment:

```env
# Production Environment Variable (e.g. on Vercel)
NEXT_PUBLIC_SITE_URL=https://mackknitwear.com
```

- When set, Next.js uses this to generate absolute canonical URLs in `<link rel="canonical">`, OpenGraph tags, and `sitemap.xml`.
- In local development, it defaults to `http://localhost:3000` without requiring any credentials.

---

## 5. Decommissioning & External Cleanup

The application codebase has been completely stripped of Supabase, database migrations, and administrative authentication. 

**External Decommissioning Checklist (For Project Owner):**
- **Supabase Cloud Project**: If no other systems share the Supabase project, pause or delete the remote database instance and storage buckets from your Supabase dashboard.
- **Cloudflare Turnstile**: Any Turnstile widget keys previously registered for the domain can be removed from Cloudflare.
- **Transactional Email Keys**: Any Resend / SMTP API keys provisioned for form notifications can be revoked.
