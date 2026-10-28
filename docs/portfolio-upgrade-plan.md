# [SUPERSEDED] Mack Knit Wear — Portfolio Functional Upgrade Plan

> [!WARNING]
> **SUPERSEDED ARCHITECTURE DOCUMENT**: As of September 2026, Mack Knit Wear has transitioned to a Git-backed, code-driven content model. The Supabase database, admin panel, dynamic publishing workflows, and server-side inquiry queues documented here have been decommissioned. Please refer to `README.md` and `mack-knit-wear-setup-guide.md` for current documentation.

This plan outlines the complete functional upgrade of the Mack Knit Wear corporate portfolio application. The project builds upon the existing Next.js App Router, TypeScript, Supabase PostgreSQL, and Zod foundation without replacing the stack or introducing external CMS platforms.

### Core Architectural Decisions:
1. **Hybrid Data Model**: 
   - Core relational tables for `content` (pages, brands, products, capabilities, network entries, site settings), `collections`, `inquiries`, and `media_assets`.
   - Distinct, strongly typed Zod schemas per record kind (`PageContent`, `BrandContent`, `ProductContent`, `CapabilityContent`, `NetworkContent`, `SettingsContent`).
   - Dual-state architecture (`draft` jsonb and `published` jsonb) preserved with strict versioned normalizers for backwards compatibility.
   - Dedicated relations for Collections (linking brands and ordered products) and Product References with validation to prevent broken or unpublished references on public routes.
2. **Controlled Section Engine**:
   - Reusable, typed sections with stable UUIDs, ordering, visibility toggle, and template-based section constraints.
   - Restricted formatting model (no raw HTML or script evaluation) for security.
3. **Unified Rendering Engine**:
   - The same modular React components render public pages, draft preview overlays, and full administrative previews across desktop and mobile viewports.
4. **Enhanced Inquiry Lifecycle & Notification Subsystem**:
   - Idempotent submission, contextual payload tracking (brand/product references), durable PostgreSQL queue/status, and modular staff email notification adapter with offline test fallback.
5. **Interactive Media & Product Discovery**:
   - Native accessible carousel with keyboard navigation, touch gesture support, reduced-motion compliance, and zero/single-item graceful degradation.
   - Multi-image gallery with modal inspection and focus trapping.
   - Asset picker with usage tracking and safe deletion protection.

---

## 2. Requirement Mapping to Implementation Phases

| Requirement Group | Target Phase | Affected Systems / Files | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **Baseline & Governance** | Phase 0 | `docs/*`, git branch | Baseline tests passing; documentation established. |
| **Typed Schemas & Relationships** | Phase 1 | `lib/schema.ts`, `lib/content.ts`, `lib/migrations.ts`, `supabase/schema.sql`, `supabase/migrations/*` | Typed models for pages, brands, products, collections, capabilities, network; version-aware normalizer; migration tested on PGlite. |
| **Page Management & Section Editor** | Phase 2 | `components/content-editor.tsx`, `components/section-editor/*`, `app/admin/(protected)/pages/*`, `lib/sections.ts` | 10 template types, 13 section types, reordering, keyboard access, unpublish/archive warnings, unsaved checks. |
| **Accurate Preview & Dynamic Navigation** | Phase 2 | `components/website-preview.tsx`, `components/public-shell.tsx`, `app/admin/(protected)/preview/*` | Draft preview overlay, mobile/desktop viewport toggle, editable header/footer navigation with publication status awareness. |
| **Brand Experiences & Detail Pages** | Phase 3 | `components/brand-detail.tsx`, `app/(public)/brands/[slug]/page.tsx`, `components/brand-card.tsx` | Logo vs hero separation, editorial stories, featured collection integration, wholesale/partner CTA. |
| **Reusable Carousel & Accessible Motion** | Phase 3 | `components/product-carousel.tsx`, `components/gallery.tsx`, `app/globals.css` | Multi-card desktop, peek mobile, keyboard/touch support, pause on focus/reduced-motion, no fake duplicates. |
| **Product Directory & Product Detail** | Phase 3 | `app/(public)/products/page.tsx`, `app/(public)/products/[slug]/page.tsx`, `components/product-detail.tsx` | Category/brand filters with URL sync, search, specifications, gallery with lightbox, direct product inquiry flow. |
| **Inquiry Flow & Idempotency** | Phase 4 | `components/contact-form.tsx`, `app/api/inquiries/route.ts`, `lib/inquiry.ts`, `supabase/schema.sql` | 5 inquiry types, contextual pre-fill, server idempotency, non-sensitive ref, Turnstile/honeypot/rate limiting. |
| **Staff Notifications & Admin Inbox** | Phase 4 | `lib/email-adapter.ts`, `components/inquiry-inbox.tsx`, `app/api/admin/inquiries/*` | Modular email adapter (with test mode), durable retry mechanism, search/filter/notes in inbox, explicit reply status. |
| **Specialized Pages: Home, About, Capabilities, Network, Privacy** | Phase 5 | `components/public-content.tsx`, `app/(public)/[[...slug]]/page.tsx`, `components/network-grid.tsx` | Tailored editorial layouts, removed 2-brand cap, capabilities process steps, network relationship grouping. |
| **Media Management & Asset Picker** | Phase 5 | `components/media-picker.tsx`, `components/media-library.tsx`, `app/api/admin/media/*` | Inline asset selection, alt text enforcement, usage detection before removal, responsive image loading. |
| **Integration Testing, SEO & Audit** | Phase 6 | `tests/*`, `app/sitemap.ts`, `app/robots.ts`, responsive verification | Scenarios A–R automated/verified, clean console, canonical URLs, OG tags, responsive visual audit at 390px, 768px, 1440px. |

---

## 3. Database Migration & Compatibility Strategy

1. **Incremental Migrations**:
   - `supabase/schema.sql` represents the consolidated canonical schema for fresh installations.
   - `supabase/migrations/20260927000000_portfolio_upgrade.sql` provides the non-destructive upgrade path for existing databases.
   - Existing tables (`admin_users`, `content`, `content_history`, `inquiries`, `inquiry_limits`) retain their primary keys and data.
   - Add new relations and columns:
     - Expand `content.kind` constraint to include: `'page'`, `'brand'`, `'product'`, `'collection'`, `'capability'`, `'network'`, `'settings'`.
     - Inquiries table enhanced with: `reference_code` (text unique), `idempotency_key` (text unique), `brand_ref` (uuid references content(id)), `product_ref` (uuid references content(id)), `source_url` (text), `details` (jsonb), `notification_status` (text default 'pending'), `notification_attempts` (integer default 0), `internal_notes` (jsonb default '[]'::jsonb).
     - New helper functions for atomic inquiry submission with idempotency.
2. **Schema Versioning & Normalization**:
   - Every content payload includes `_v: 2`.
   - Legacy payloads without `_v` or with `_v: 1` pass through a normalization adapter in `lib/schema.ts` ensuring zero data loss and flawless restoration from `content_history`.
3. **Usage & Reference Safety**:
   - Deleting or unpublishing a brand or product checks for referencing collections or pages and warns the administrator.

---

## 4. Acceptance Criteria Checklist

- [ ] A. Draft save leaves published live site completely unmodified.
- [ ] B. Preview faithfully renders draft edits across desktop and mobile.
- [ ] C. Publishing promotes draft to published snapshot and updates sitemap/feeds.
- [ ] D. Revisions can be restored into draft without immediate live publication.
- [ ] E. Concurrency conflict on stale `updated_at` throws recoverable error.
- [ ] F. Unpublished products never appear on public carousels, lists, or sitemaps.
- [ ] G. Orphaned or missing references fail gracefully with no crashed layouts.
- [ ] H. Product directory filter state persists across refresh and back navigation.
- [ ] I. Inquiry initiated from product/brand carries context through to stored record.
- [ ] J. Malicious, invalid, or forged payload references are rejected safely.
- [ ] K. Network retries with duplicate idempotency tokens return identical safe confirmation.
- [ ] L. Inquiries persist durably even if notification transport fails.
- [ ] M. Anon and non-admin requests cannot read drafts, private notes, or mutate content.
- [ ] N. Legacy records without new fields deserialize properly via normalizers.
- [ ] O. Migrations are idempotent and safe to execute repeatedly.
- [ ] P. Touch, keyboard focus, and reduced-motion settings operate smoothly.
- [ ] Q. Zero-item, single-item, and large collections render gracefully.
- [ ] R. Local preview mode functions seamlessly for offline inspection without security bypass.
