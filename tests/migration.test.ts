import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { normalizeContent } from "../lib/schema";

test("Database migration handles legacy data, idempotency, and new schema concepts safely", async () => {
  const pg = new PGlite();

  // Setup mock Supabase environment
  await pg.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth,storage to anon,authenticated,service_role;
    grant execute on function auth.uid() to anon,authenticated;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid,bucket_id text); alter table storage.objects enable row level security;
    alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
    alter default privileges in schema public grant all on sequences to anon,authenticated,service_role;
  `);

  // Step 1: Initialize baseline legacy schema (simulating pre-upgrade database)
  await pg.exec(`
    create table public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade);
    alter table public.admin_users enable row level security;
    revoke all on public.admin_users from anon,authenticated;
    grant select on public.admin_users to authenticated;
    create policy own_admin_membership on public.admin_users for select to authenticated using(user_id=auth.uid());
    create function public.is_admin() returns boolean language sql stable security definer set search_path=public,pg_temp as $$ select exists(select 1 from public.admin_users where user_id=auth.uid()) $$;
    grant execute on function public.is_admin() to authenticated;

    create table public.content (
      id uuid primary key default gen_random_uuid(),
      kind text not null check(kind in ('page','brand','network','product','settings')),
      slug text not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
      draft jsonb not null, published jsonb,
      updated_at timestamptz not null default now(), published_at timestamptz,
      unique(kind,slug)
    );
    alter table public.content enable row level security;
    create policy admin_content on public.content for all to authenticated using(public.is_admin()) with check(public.is_admin());
    grant select,insert,update,delete on public.content to authenticated;
    create view public.public_content as select id,kind,slug,published,published_at,updated_at from public.content where published is not null;
    grant select on public.public_content to anon,authenticated;

    create table public.content_history (
      id bigint generated always as identity primary key, content_id uuid not null references public.content(id) on delete cascade,
      snapshot jsonb not null, created_at timestamptz not null default now(), actor uuid
    );

    create table public.inquiries (
      id uuid primary key default gen_random_uuid(), name text not null, email text not null, company text not null default '',
      type text not null, brand text not null default '', message text not null,
      status text not null default 'new' check(status in ('new','read','closed')),
      created_at timestamptz not null default now()
    );

    create table public.inquiry_limits(key_hash text primary key,window_started timestamptz not null default now(),attempts integer not null default 1);

    grant all on public.content,public.admin_users,public.content_history,public.inquiries,public.inquiry_limits to service_role;
  `);

  // Step 2: Insert legacy content and legacy inquiries
  const legacyBrandId = "33333333-3333-4333-8333-333333333333";
  await pg.query(
    `insert into public.content(id, kind, slug, draft, published) values
    ($1, 'brand', 'classic-cashmere',
      '{"title": "Classic Cashmere", "body": "Legacy brand description without v2 fields", "homeSections": ["about", "brands"]}',
      '{"title": "Classic Cashmere", "body": "Published legacy brand"}')`,
    [legacyBrandId],
  );

  await pg.query(
    `insert into public.inquiries(name, email, company, type, message, status) values
    ('Legacy Buyer', 'legacy@example.com', 'OldCo', 'Wholesale', 'Looking for samples', 'read')`,
  );

  // Step 3: Execute the incremental migration SQL
  const migrationSql = await readFile(
    new URL("../supabase/migrations/20260927000000_portfolio_upgrade.sql", import.meta.url),
    "utf8",
  );
  await pg.exec(migrationSql);

  // Scenario N: Legacy content survived migration and normalizes into valid v2 structure
  const legacyRow = await pg.query<{ draft: any; published: any }>(
    `select draft, published from public.content where id = $1`,
    [legacyBrandId],
  );
  assert.equal(legacyRow.rows.length, 1);
  const normalizedDraft = normalizeContent(legacyRow.rows[0].draft, "brand", "classic-cashmere");
  assert.equal(normalizedDraft._v, 2);
  assert.equal(normalizedDraft.title, "Classic Cashmere");
  assert.ok(Array.isArray(normalizedDraft.selectedProductIds));

  // Legacy inquiry has reference_code automatically backfilled
  const inquiries = await pg.query<{ reference_code: string; status: string }>(
    `select reference_code, status from public.inquiries where email = 'legacy@example.com'`,
  );
  assert.equal(inquiries.rows.length, 1);
  assert.ok(inquiries.rows[0].reference_code.startsWith("INQ-"));
  assert.equal(inquiries.rows[0].status, "read");

  // Step 4: Scenario O: Execute the migration a SECOND time to confirm idempotency
  await assert.doesNotReject(async () => {
    await pg.exec(migrationSql);
  });

  // Verify new kinds (collection, capability) are permitted
  await pg.query(
    `insert into public.content(kind, slug, draft) values
    ('collection', 'aw-2026', '{"title": "AW 2026 Collection"}'),
    ('capability', 'full-fashioned', '{"title": "Full Fashioned Knitting"}')`,
  );

  const kindsCount = await pg.query<{ count: string }>(
    `select count(*) from public.content where kind in ('collection', 'capability')`,
  );
  assert.equal(Number(kindsCount.rows[0].count), 2);

  // Step 5: Scenario K: Test inquiry idempotency via submit_inquiry function
  const payloadWithIdempotency = {
    name: "Repeat Buyer",
    email: "repeat@example.com",
    company: "Buyer LLC",
    type: "Wholesale",
    brand: "Classic Cashmere",
    message: "Ordering batch 500.",
    idempotency_key: "idem-key-unique-12345",
  };

  const firstSubmission = await pg.query<{ id: string }>(
    `select public.submit_inquiry($1, 'test-sender-idem') as id`,
    [JSON.stringify(payloadWithIdempotency)],
  );
  const firstId = firstSubmission.rows[0].id;
  assert.ok(firstId);

  // Repeated submission with same idempotency key must return the exact same ID
  const secondSubmission = await pg.query<{ id: string }>(
    `select public.submit_inquiry($1, 'test-sender-idem') as id`,
    [JSON.stringify(payloadWithIdempotency)],
  );
  const secondId = secondSubmission.rows[0].id;
  assert.equal(firstId, secondId);

  // Verify that only 1 record was inserted
  const totalWithKey = await pg.query<{ count: string }>(
    `select count(*) from public.inquiries where idempotency_key = 'idem-key-unique-12345'`,
  );
  assert.equal(Number(totalWithKey.rows[0].count), 1);

  await pg.close();
});
