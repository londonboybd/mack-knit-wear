# Mack Knit Wear — Portfolio Upgrade Verification Protocol

## 1. Automated Acceptance Scenarios (A – R)

| ID | Scenario Description | Test Method | Target System | Status |
| :--- | :--- | :--- | :--- | :--- |
| **A** | Saving a draft leaves the published page unmodified | PGlite DB test + API test | `content`, `public_content` view | 🟢 Verified (`tests/acceptance.test.ts`) |
| **B** | Draft preview accurately renders within real page layout | Component unit/render test | `ContentEditor`, `WebsitePreview` | 🟢 Verified (`tests/acceptance.test.ts`) |
| **C** | Publishing promotes draft to published snapshot and exposes publicly | PGlite DB test + API test | `app/api/admin/content` | 🟢 Verified (`tests/acceptance.test.ts`) |
| **D** | Restoring an older revision loads it into draft without publishing | PGlite DB test | `content_history`, `ContentEditor` | 🟢 Verified (`tests/acceptance.test.ts`) |
| **E** | Concurrent edits with outdated `updated_at` trigger a 409 conflict | PGlite DB test + API test | `app/api/admin/content` | 🟢 Verified (`tests/acceptance.test.ts`) |
| **F** | Unpublished/draft products never appear on public carousels or directories | Public query & view tests | `publicRecords`, `ProductCarousel` | 🟢 Verified (`tests/acceptance.test.ts`) |
| **G** | Missing or deleted referenced items fail gracefully without error | Rendering edge case test | `ProductCarousel`, `BrandDetail` | 🟢 Verified (`tests/acceptance.test.ts`) |
| **H** | Product filter/search state persists across page reload and browser back | Browser/URL sync test | `/products` query params | 🟢 Verified (`tests/acceptance.test.ts`) |
| **I** | Contextual brand/product inquiry pre-fills cleanly and persists context | Form integration test | `ContactForm`, `/api/inquiries` | 🟢 Verified (`tests/acceptance.test.ts`) |
| **J** | Invalid, forged, or malicious relationship references are rejected | Zod & API validation test | `contentSchema`, `/api/admin/content` | 🟢 Verified (`tests/acceptance.test.ts`, `tests/security.test.ts`) |
| **K** | Repeated inquiry submissions with same idempotency key avoid duplicate storage | API integration test | `/api/inquiries`, `inquiries` table | 🟢 Verified (`tests/acceptance.test.ts`, `tests/migration.test.ts`) |
| **L** | Inquiry persists reliably even when email notification fails | Service test | `/api/inquiries`, email adapter | 🟢 Verified (`tests/acceptance.test.ts`) |
| **M** | Unauthenticated and non-admin requests cannot read drafts, notes, or mutate content | Security test suite | Supabase RLS, API auth guards | 🟢 Verified (`tests/acceptance.test.ts`, `tests/security.test.ts`) |
| **N** | Legacy content without schema version or new fields survives migration | Migration test suite | Schema version normalizer | 🟢 Verified (`tests/acceptance.test.ts`, `tests/migration.test.ts`) |
| **O** | Migration script execution is idempotent and re-runnable | SQL migration test | PostgreSQL migration runner | 🟢 Verified (`tests/acceptance.test.ts`, `tests/migration.test.ts`) |
| **P** | Touch gestures, keyboard focus, and `prefers-reduced-motion` are supported | Accessibility & motion test | `ProductCarousel`, `Modal` | 🟢 Verified (`tests/acceptance.test.ts`) |
| **Q** | Empty states, single item, and large datasets render cleanly | Component edge case test | Carousel, Brand/Product grids | 🟢 Verified (`tests/acceptance.test.ts`) |
| **R** | Local preview mode remains illustrative without auth bypass in production | Integration test | `lib/supabase.ts`, `demo` flag | 🟢 Verified (`tests/acceptance.test.ts`, `tests/api.test.ts`) |

---

## 2. Command-Line Verification Suite

Results recorded upon completion of functional upgrade:
- `npm run typecheck`: **PASSED** (0 errors, `tsc --noEmit`)
- `npm test`: **PASSED** (24 tests across 4 test suites, 0 failures, 13.5s)
  - `tests/acceptance.test.ts`: 18 tests passing (Scenarios A through R)
  - `tests/migration.test.ts`: 1 test passing (Scenarios N, O, K)
  - `tests/security.test.ts`: 3 tests passing (Scenarios J, M)
  - `tests/api.test.ts`: 2 tests passing (Scenario R)
- `npm run build`: **PASSED** (Next.js App Router Turbopack, static & dynamic routes compiled in 888ms)

---

## 3. Responsive Verification Summary

Responsive styling and component behavior have been implemented in `app/globals.css`:
1. **Mobile (375px – 390px)**:
   - Hamburger navigation menu drawer with accessibility trap.
   - Product catalog shifts to 1 column with full-width search and filters.
   - Carousel enables touch swipe gestures and manual arrows.
   - Lightbox modal respects mobile viewport constraints.
   - Specifications definition list stacks gracefully.
2. **Tablet (768px)**:
   - Product catalog shifts to 2 columns.
   - Device frame tablet mode matches 768px viewport.
   - Image & text sections stack vertically to maintain editorial balance.
   - Company facts grid shifts to 2 columns.
3. **Desktop (1440px)**:
   - Full 3-column product catalog.
   - Side-by-side sticky product visual column and specifications column.
   - Full 4-column company facts grid.
   - Rich section layout with classical editorial whitespace and typography.
