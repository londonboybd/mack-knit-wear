-- Incremental Migration: Portfolio Functional Upgrade
-- Safe, idempotent execution for existing Mack Knit Wear database instances.

-- 1. Expand public.content kind check constraint to support all portfolio concepts
do $$
begin
  alter table public.content drop constraint if exists content_kind_check;
  alter table public.content add constraint content_kind_check
    check (kind in ('page', 'brand', 'product', 'collection', 'capability', 'network', 'settings'));
exception
  when others then null;
end $$;

-- 2. Upgrade public.inquiries table structure
do $$
begin
  -- Reference code column
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'inquiries' and column_name = 'reference_code') then
    alter table public.inquiries add column reference_code text;
  end if;

  -- Idempotency key column
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'inquiries' and column_name = 'idempotency_key') then
    alter table public.inquiries add column idempotency_key text;
  end if;

  -- Brand reference column
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'inquiries' and column_name = 'brand_ref') then
    alter table public.inquiries add column brand_ref uuid references public.content(id) on delete set null;
  end if;

  -- Product reference column
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'inquiries' and column_name = 'product_ref') then
    alter table public.inquiries add column product_ref uuid references public.content(id) on delete set null;
  end if;

  -- Source URL column
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'inquiries' and column_name = 'source_url') then
    alter table public.inquiries add column source_url text not null default '';
  end if;

  -- Contextual details jsonb
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'inquiries' and column_name = 'details') then
    alter table public.inquiries add column details jsonb not null default '{}'::jsonb;
  end if;

  -- Notification status tracking
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'inquiries' and column_name = 'notification_status') then
    alter table public.inquiries add column notification_status text not null default 'pending';
  end if;

  -- Notification attempts counter
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'inquiries' and column_name = 'notification_attempts') then
    alter table public.inquiries add column notification_attempts integer not null default 0;
  end if;

  -- Notification last attempt timestamp
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'inquiries' and column_name = 'notification_last_attempt') then
    alter table public.inquiries add column notification_last_attempt timestamptz;
  end if;

  -- Notification error message
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'inquiries' and column_name = 'notification_error') then
    alter table public.inquiries add column notification_error text;
  end if;

  -- Internal staff notes
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'inquiries' and column_name = 'internal_notes') then
    alter table public.inquiries add column internal_notes jsonb not null default '[]'::jsonb;
  end if;
end $$;

-- 3. Backfill reference codes for existing inquiries if missing
update public.inquiries
set reference_code = 'INQ-' || to_char(created_at, 'YYYYMMDD') || '-' || upper(substr(id::text, 1, 6))
where reference_code is null or reference_code = '';

-- Ensure unique constraint on reference_code and idempotency_key
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'inquiries_reference_code_key') then
    alter table public.inquiries add constraint inquiries_reference_code_key unique (reference_code);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'inquiries_idempotency_key_key') then
    alter table public.inquiries add constraint inquiries_idempotency_key_key unique (idempotency_key);
  end if;
end $$;

-- Update status check constraint to include in_progress and replied
do $$
begin
  alter table public.inquiries drop constraint if exists inquiries_status_check;
  alter table public.inquiries add constraint inquiries_status_check
    check (status in ('new', 'read', 'in_progress', 'replied', 'closed'));
exception
  when others then null;
end $$;

-- 4. Upgrade submit_inquiry function with idempotency, reference generation, and metadata
create or replace function public.submit_inquiry(payload jsonb, sender_hash text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_attempts integer;
  existing_id uuid;
  result uuid;
  ik text;
  ref_code text;
  brand_uuid uuid;
  product_uuid uuid;
begin
  -- Idempotency check: if already processed, return existing ID
  ik := payload->>'idempotency_key';
  if ik is not null and ik <> '' then
    select id into existing_id from public.inquiries where idempotency_key = ik limit 1;
    if existing_id is not null then
      return existing_id;
    end if;
  end if;

  -- Rate limit check (5 per hour per sender hash)
  insert into public.inquiry_limits as limits(key_hash) values(sender_hash)
  on conflict(key_hash) do update set
    attempts = case when limits.window_started < now() - interval '1 hour' then 1 else limits.attempts + 1 end,
    window_started = case when limits.window_started < now() - interval '1 hour' then now() else limits.window_started end
  returning attempts into current_attempts;

  if current_attempts > 5 then
    return null;
  end if;

  -- Generate or use provided reference code
  ref_code := coalesce(
    nullif(payload->>'reference_code', ''),
    'INQ-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6))
  );

  begin
    brand_uuid := (nullif(payload->>'brand_ref', ''))::uuid;
  exception when others then
    brand_uuid := null;
  end;

  begin
    product_uuid := (nullif(payload->>'product_ref', ''))::uuid;
  exception when others then
    product_uuid := null;
  end;

  insert into public.inquiries (
    name,
    email,
    company,
    type,
    brand,
    message,
    reference_code,
    idempotency_key,
    brand_ref,
    product_ref,
    source_url,
    details,
    notification_status
  ) values (
    payload->>'name',
    payload->>'email',
    coalesce(payload->>'company', ''),
    payload->>'type',
    coalesce(payload->>'brand', ''),
    payload->>'message',
    ref_code,
    nullif(ik, ''),
    brand_uuid,
    product_uuid,
    coalesce(payload->>'source_url', ''),
    coalesce(payload->'details', '{}'::jsonb),
    'pending'
  ) returning id into result;

  return result;
end $$;

-- 5. Media assets metadata tracking table
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  alt text not null default '',
  caption text not null default '',
  width integer,
  height integer,
  size_bytes bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

alter table public.media_assets enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'admin_media_assets' and tablename = 'media_assets') then
    create policy admin_media_assets on public.media_assets for all to authenticated using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

grant select on public.media_assets to anon, authenticated;
grant all on public.media_assets to authenticated, service_role;
