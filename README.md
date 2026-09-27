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

| Route            | Purpose                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| `/`              | Homepage with editable hero, copy, image, feature strip, section order, visibility, and contact banner |
| `/about`         | Company introduction and story                                                                         |
| `/products`      | Product categories and services                                                                        |
| `/brands`        | Owned-brand portfolio                                                                                  |
| `/brands/[slug]` | Brand story, external official website, external ecommerce store, and inquiry link                     |
| `/network`       | Represented brands, clients, sister concerns, and business partners, labelled by relationship          |
| `/contact`       | Validated business inquiry form                                                                        |
| `/privacy`       | Editable privacy notice                                                                                |

Brand links open only when a valid HTTPS destination is saved. If official website and store are the same URL, a single combined button appears. Empty external links are hidden. The first brand is an explicitly illustrative concept; replace it with approved information.

## Included administrator views

| Route               | Purpose                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| `/admin/login`      | Supabase email/password sign-in for approved administrators             |
| `/admin`            | Content overview and setup checklist                                    |
| `/admin/preview`    | Published website preview at desktop and mobile widths                  |
| `/admin/pages`      | Core page editing                                                       |
| `/admin/brands`     | Add and edit owned brands                                               |
| `/admin/network`    | Add and edit business relationships                                     |
| `/admin/products`   | Add and edit product categories / services                              |
| `/admin/media`      | Upload images and copy reusable URLs                                    |
| `/admin/inquiries`  | Read inquiries and mark new, read, or closed; open email replies        |
| `/admin/settings`   | Company name, logo, contact details, footer, and social links           |
| `/api/admin/export` | Authenticated JSON export of all content drafts and published snapshots |

Content editors provide **Save draft**, **Preview**, **Publish**, **Unpublish**, image upload, alternative text, search metadata, and previous-version recovery. Homepage sections can be hidden or reordered; product and brand cards have display-order controls. New page layouts still require code changes; this is a structured CMS, not an unrestricted visual page builder.

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
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`       | Optional Cloudflare Turnstile site key                                                         |
| `TURNSTILE_SECRET_KEY`                 | Optional paired server-only Turnstile secret                                                   |

Never prefix the service-role key, inquiry secret, or Turnstile secret with `NEXT_PUBLIC_`. If Turnstile is enabled, configure both keys and register your real site hostname with Cloudflare.

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
- The `public_content` view exposes an explicit list of public columns and only rows with a published snapshot. It intentionally runs with owner privileges to read the underlying protected table. **All mutation privileges on that view are revoked**, and no draft column is exposed. Do not broaden its projection or grants without reviewing the access implications.
- Every update saves the old draft to `content_history`. The editor lists the latest 20 revisions. Restoring a revision loads it into the editor; it must be saved or published explicitly.
- An `updated_at` concurrency check prevents one editor session from silently overwriting another session's changes.
- Inquiries are stored in the dashboard. Replies open the administrator's mail application; no transactional email notification service is configured.
- The inquiry endpoint validates content, includes a honeypot, and enforces five accepted inquiries per hour per hashed IP identifier in PostgreSQL. The rate limiter uses Vercel's trusted forwarded-IP header. Optional Turnstile adds bot protection. The local-development rate limit shares one identifier.
- Images are public website assets. Uploads accept verified JPG, PNG, or WebP content under 3 MB, below the platform's request-size ceiling. Do not upload private company files. Media removal from a page is supported; physical file deletion is deliberately not exposed in this first version.

## Project layout

```text
app/
  (public)/             Public pages and shared site layout
  admin/(protected)/    Server-gated content studio
  admin/login/          Administrator sign-in
  api/                  Next.js backend routes
components/             Public and admin React interfaces
lib/                    Content types, validation, authentication, database helpers
supabase/schema.sql     PostgreSQL schema, policies, functions, and storage policies
scripts/seed.ts         Safe starter-draft creation
tests/security.test.ts  URL validation and database authorization tests
public/images/          Illustrative textile photograph
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
