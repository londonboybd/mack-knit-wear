# Mack Knit Wear — Developer Setup & Maintenance Guide

## 1. Project Overview

Mack Knit Wear operates as a clean, Git-backed static and server-rendered Next.js portfolio application. All company data, product catalogues, and associate profiles are stored directly in TypeScript domain files in source control.

**Key Architecture Decisions:**
- **No Database / No Supabase**: Zero database dependencies, external connection latency, or database maintenance overhead.
- **No Admin Panel / No CMS**: Source code in Git is the single source of truth.
- **Client-Side Inquiry Composer**: Contact form drafts messages locally via `mailto:` and clipboard copy without storing data on a server.
- **Accredited Associates Network**: Accurate representation of independent manufacturing partners (Sufia Hawlader Composite, Umeda SB Industries, Alam Garments) with official website links where provided.

---

## 2. Environment Setup

### Prerequisites
- Node.js 22.x or higher
- Git

### Installation
```bash
git clone https://github.com/londonboybd/mack-knit-wear.git
cd mack-knit-wear
npm install
```

### Environment Configuration
Copy `.env.example` to `.env.local` if custom configuration is required:
```bash
cp .env.example .env.local
```
Contents of `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
*Note: In production deployments (e.g. Vercel), set `NEXT_PUBLIC_SITE_URL` to your production domain (e.g. `https://mackknitwear.com`).*

---

## 3. Maintenance Workflows

### 3.1 Managing Company & Contact Details
Edit `siteSettings` in [`lib/data/site-data.ts`](file:///d:/Github%20repos/mack-knit-wear/lib/data/site-data.ts):
- Header & footer navigation links
- Company description and motto
- Trade desk email (`email`), telephone (`phone`), and location (`address`)

### 3.2 Managing londonBoy Products
Open [`lib/data/site-data.ts`](file:///d:/Github%20repos/mack-knit-wear/lib/data/site-data.ts) and locate `productsList`:
- Each product must have a unique `slug`, `id`, and reference code (`refCode`).
- Product category must be either `"Socks"` (`categorySlug: "socks"`) or `"Innerwear"` (`categorySlug: "innerwear"`).
- Optional fields: `secondaryImage`, `gallery`, `specifications`. Missing optional fields are handled cleanly without broken UI elements.
- Adding a product automatically updates:
  1. Product directory catalogue with dynamic category counter
  2. Brand category pages (`/brands/londonboy/socks`, `/brands/londonboy/innerwear`)
  3. Brand showcase carousel
  4. Related products lists
  5. Static page generation and `sitemap.xml`

### 3.3 Managing Industrial Associates
In [`lib/data/site-data.ts`](file:///d:/Github%20repos/mack-knit-wear/lib/data/site-data.ts), edit `associatesList`:
- Number: `"01"`, `"02"`, `"03"`
- Name: Partner legal / trading name
- Scope: Manufacturing capability
- Website: Verified official URL (leave undefined if no official URL exists)

---

## 4. Verification & Testing

Run all automated checks prior to committing changes:

```bash
# Verify TypeScript types
npm run typecheck

# Run unit and behavioral tests
npm test

# Verify production build & static generation
npm run build
```

---

## 5. Deployment

Deploy the repository to any modern Next.js hosting platform (such as Vercel, Netlify, AWS Amplify, or a Docker container):
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node.js Version**: `22.x`
- **Environment Variables**:
  - `NEXT_PUBLIC_SITE_URL`: `https://your-custom-domain.com`
