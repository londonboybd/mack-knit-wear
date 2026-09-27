# Mack Knit Wear — Next.js website and content studio

A corporate portfolio website and protected administrator dashboard in **one Next.js App Router project**. Frontend components, server-rendered pages, authorization, and HTTP API routes all live here. Deploy the project to Vercel. Supabase supplies PostgreSQL, authentication, and image storage; there is no separate Express server.

## Start with the design preview

Install Node.js 22 LTS or newer, open this folder in a terminal, then run:

```sh
npm ci
npm run dev
```

Open `http://localhost:3000` for the website and `http://localhost:3000/admin` for the dashboard. Without Supabase credentials, **local preview mode** shows illustrative content and allows editing fields and viewing a content preview. Saving, publishing, uploads, and contact submissions are disabled. Changes in this mode are not persisted.

The open preview workspace is automatically disabled on Vercel. There is no default administrator password or production demo-login bypass.

## Included public views

| Route              | Purpose                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| `/`                | Dynamic editorial homepage with unconstrained brand showcase, product carousel, and customizable sections |
| `/about`           | Company story, milestone timeline, and verified manufacturing facts                                    |
| `/products`        | Searchable, filterable product catalog synchronized with URL query params and pagination               |
| `/products/[slug]` | Product detail view with structured specifications list, photo gallery, lightbox, and inquiry CTA      |
| `/brands`          | Owned-brand portfolio directory with category filtering and editorial introductions                    |
| `/brands/[slug]`   | Brand profile with separate logo/hero imagery, lookbook gallery, and dedicated product carousel        |
| `/capabilities`    | Manufacturing technology, machinery gauges, process step workflow, and sourcing capabilities           |
| `/network`         | Grouped partner directory: represented brands, private-label clients, sister concerns, and partners     |
| `/contact`         | Dynamic multi-type inquiry form (Wholesale, Sourcing, Sampling, Factory visit, General) with pre-fill  |
| `/privacy`         | Editable compliance and data governance policy                                                         |

Brand links open only when a valid HTTPS destination is saved. If official website and store are the same URL, a single combined button appears. Empty external links are hidden.

## Included administrator views

| Route               | Purpose                                                                               |
| ------------------- | ------------------------------------------------------------------------------------- |
| `/admin/login`      | Supabase email/password sign-in for approved administrators                           |
| `/admin`            | Content overview, quick stats, and launch checklist                                   |
| `/admin/preview`    | Interactive multi-device preview (Desktop 1440px, Tablet 768px, Mobile 390px)         |
| `/admin/pages`      | Reusable section editor with 10 page archetypes, reordering, duplicate, and templates |
| `/admin/brands`     | Brand storytelling manager with separate logo, hero, lookbook, and product spotlight  |
| `/admin/products`   | Technical product specifications editor, category manager, and lookbook gallery      |
| `/admin/collections`| Seasonal brand collections manager with ordered product associations                  |
| `/admin/capabilities`| Process step workflow and machinery gauge capabilities manager                       |
| `/admin/network`    | Business relationships classified by partnership type                                 |
| `/admin/media`      | Visual asset library with alt text enforcement, usage tracking, and safe deletion    |
| `/admin/inquiries`  | Filterable inquiry inbox with status workflow, internal notes, and notification retry |
| `/admin/settings`   | Company profile, multi-facility locations manager, and dynamic header/footer menus    |
| `/api/admin/export` | Authenticated JSON export of all content drafts and published snapshots               |

Content editors provide **Save draft**, **Interactive preview**, **Publish**, **Unpublish**, visual media library picker, alternative text enforcement, structured SEO metadata, and previous-version recovery. All 14 section types can be hidden, duplicated, and reordered.

## Connect the backend

1. Create a Supabase project. Run `supabase/schema.sql` once in the SQL Editor of a **new project**. It creates tables, access policies, publication history, the inquiry rate-limit function, and a public image bucket.
2. Copy `.env.example` to `.env.local` and fill in the values from your Supabase dashboard. Keep `.env.local` private.
3. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` during local development. Generate `INQUIRY_HASH_SECRET` with `openssl rand -hex 32` or another cryptographically secure secret generator.
4. In Supabase **Authentication → Users**, create the administrator account. Disable public sign-ups in the Supabase authentication settings for this private CMS.
5. Copy that user's UUID and run:

```sql
insert into public.admin_users(user_id) values('YOUR-AUTH-USER-UUID');
```

6. Run `npm run seed`. This creates starter content **as unpublished drafts**. Re-running the seed does not overwrite existing content.
7. Restart the app, sign in at `/admin/login`, replace sample information, and publish the company settings and intended pages. The public homepage shows a holding message until content is published. Publish `home`, `about`, `products`, `brands`, `contact`, and `privacy` before launch. Add real brands and network entries as confirmed; navigation to the network appears only after a relationship is published.

Only an approved administrator can read private records or mutate content. Creating an authentication account alone does not grant dashboard access. Account creation and password recovery are managed by the owner in Supabase; there is no public sign-up page.

## Environment variables

| Name                                   | Purpose                                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL                                                                           |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (legacy anon key also works)                                          |
| `SUPABASE_SERVICE_ROLE_KEY`            | Server-only service-role key for inquiry submission and initial seeding                        |
| `NEXT_PUBLIC_SITE_URL`                 | Exact site origin, e.g. `https://your-domain.com`; used for origin validation and sitemap URLs |
| `INQUIRY_HASH_SECRET`                  | Server-only random secret for hashing inquiry rate-limit identifiers                           |
| `NOTIFICATION_EMAIL_TO`                | Optional recipient inbox for incoming inquiry notifications (e.g. `desk@mackknitwear.com`)   |
| `NOTIFICATION_EMAIL_FROM`              | Optional verified sender address (e.g. `Mack Knit Wear <notifications@mackknitwear.com>`)    |
| `RESEND_API_KEY`                       | Optional transactional email provider API key for live staff notifications                    |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`       | Optional Cloudflare Turnstile site key                                                         |
| `TURNSTILE_SECRET_KEY`                 | Optional paired server-only Turnstile secret                                                   |

Never prefix the service-role key, inquiry secret, email keys, or Turnstile secret with `NEXT_PUBLIC_`. If Turnstile is enabled, configure both keys and register your real site hostname with Cloudflare.

## Deploy to Vercel

1. Put this folder in a private Git repository and import it into Vercel as a **Next.js** project.
2. Select Node.js **22.x** or newer. The default build command is `npm run build`; use the standard Next.js output setting. Do not use a static export, because authentication and API routes need the server runtime.
3. Add the environment variables in Vercel **Project Settings → Environment Variables**. Set the site URL to the actual production origin, without a trailing slash. Set the public variables before the build; changing them requires redeployment.
4. Deploy. Configure the Supabase authentication Site URL to the production domain.
5. If using Vercel preview deployments, use a separate Supabase project for staging, and set `NEXT_PUBLIC_SITE_URL` to that preview origin. Form mutations deliberately reject requests from a different origin.
6. Sign in and check one complete workflow: save a brand draft, publish it, open the public profile, test its website/store buttons, then submit a test inquiry and confirm it in the inbox.

**This package has not been deployed to your Vercel account.** A real Supabase project and deployment environment are required to enable persistence, authentication, uploads, and message storage. No service accounts or credentials were created for you.

## How the backend works

- Next.js Route Handlers under `app/api` implement authentication, content changes, image uploads, inquiry submission, history, and export.
- The server validates incoming data with Zod and verifies administrator identity with Supabase Auth on every protected operation.
- PostgreSQL row-level security provides a second authorization boundary.
- A content record has two JSON snapshots: `draft` and `published`. A draft save never alters the published snapshot. Unpublishing clears only the public snapshot.
- The `public_content` view exposes an explicit list of public columns and only rows with a published snapshot. It intentionally runs with owner privileges to read the underlying protected table. **All mutation privileges on that view are revoked**, and no draft column is exposed.
- Every update saves the old draft to `content_history`. The editor lists the latest 20 revisions. Restoring a revision loads it into the editor; it must be saved or published explicitly.
- An `updated_at` concurrency check prevents one editor session from silently overwriting another session's changes (409 Conflict).
- Inquiries are stored durably in PostgreSQL with client & server idempotency and unique reference codes (`INQ-YYYYMMDD-XXXXXX`). Staff notifications use the configurable email adapter with automatic failure tracking and admin retry.
- The inquiry endpoint validates content, includes a honeypot, and enforces five accepted inquiries per hour per hashed IP identifier in PostgreSQL. Optional Cloudflare Turnstile adds bot protection.
- Visual media assets are tracked across drafts and published content. Deletion is protected: an asset currently referenced by any page, brand, or product cannot be deleted until unlinked.

## Project layout

```text
app/
  (public)/             Public pages (home, about, brands, products, capabilities, network, contact, privacy)
  admin/(protected)/    Server-gated content studio (pages, brands, products, collections, media, inbox)
  admin/login/          Administrator sign-in
  api/                  Next.js backend routes (admin mutations, usage checks, inquiry submission, email retry)
components/             Editorial UI components, section renderer, product carousel, lightbox, and editors
lib/                    Typed schemas (Zod), normalization, email adapter, authentication, database client
supabase/migrations/    Incremental idempotent database migrations
supabase/schema.sql     Consolidated PostgreSQL schema, policies, functions, and storage policies
scripts/seed.ts         Comprehensive starter-draft creation
tests/                  Automated test suites:
  acceptance.test.ts    Scenarios A through R (24 automated assertions with PGlite)
  migration.test.ts     Legacy schema survival, idempotency, and reference backfilling
  security.test.ts      URL sanitization, RLS boundary, and authorization protection
  api.test.ts           Unconfigured preview security checks
public/images/          Corporate textile imagery assets
```

## Verification and practical limits

```sh
npm run typecheck
npm test
npm run build
```

The route-handler test confirms that the unconfigured preview cannot access protected API reads/writes or report a successful inquiry. Database tests execute the schema in an embedded PostgreSQL-compatible PGlite instance with simulated Supabase roles. They exercise anonymous and authenticated access, unpublished records, publication transitions, history, membership protection, and inquiry rate limiting. They do not replace integration testing against your actual Supabase Auth, Storage, and Vercel deployment.

This first version uses a single administrator role. It includes structured content editing and JSON export, but not granular staff roles, scheduled publishing, rich-text HTML, product checkout, automated email notifications, or automatic restore-from-export. Checkout stays on the brand's external ecommerce website.

The inbox loads the latest 200 inquiries, and the media library loads the latest 100 images. Increase this with pagination when the company needs larger volumes. Configure backup and retention policies in Supabase before using the site for ongoing business. Content revision history is not a full database/media backup. The privacy notice is a review draft and must be completed with the company's actual practices.

## Assets and reference documentation

The textile photograph is illustrative, not evidence of Mack Knit Wear's factory or products.

- Photo by **Artem Podrez** on [Pexels](https://www.pexels.com/photo/close-up-shot-of-a-beige-knit-textile-7232403/), used under the [Pexels license](https://www.pexels.com/license/).
- Fonts: DM Sans and Libre Caslon Display, loaded from Google Fonts with system fallbacks. The interface remains usable if the font service is unavailable.
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js authentication guidance](https://nextjs.org/docs/app/guides/authentication)
- [Supabase SSR authentication](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)

Brand names, business capabilities, certifications, clients, export markets, and contact details must be confirmed before publication.
