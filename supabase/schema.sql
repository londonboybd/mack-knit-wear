-- Run once in a new Supabase project's SQL editor.
create table public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon,authenticated;
grant select on public.admin_users to authenticated;
create policy own_admin_membership on public.admin_users for select to authenticated using(user_id=auth.uid());
create function public.is_admin() returns boolean language sql stable security definer set search_path=public,pg_temp as $$ select exists(select 1 from public.admin_users where user_id=auth.uid()) $$;
revoke all on function public.is_admin() from public;
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
revoke all on public.content from anon;
grant select,insert,update,delete on public.content to authenticated;
-- This intentionally owner-executed view exposes ONLY published snapshots, never drafts.
create view public.public_content as select id,kind,slug,published,published_at,updated_at from public.content where published is not null;
revoke all on public.public_content from anon,authenticated;
grant select on public.public_content to anon,authenticated;

create table public.content_history (
 id bigint generated always as identity primary key, content_id uuid not null references public.content(id) on delete cascade,
 snapshot jsonb not null, created_at timestamptz not null default now(), actor uuid
);
alter table public.content_history enable row level security;
revoke all on public.content_history from anon,authenticated;
grant select on public.content_history to authenticated;
create policy admin_history on public.content_history for select to authenticated using(public.is_admin());
create function public.record_content_history() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 insert into public.content_history(content_id,snapshot,actor) values(old.id,old.draft,auth.uid());
 new.updated_at:=clock_timestamp(); return new;
end $$;
create trigger content_revision before update on public.content for each row execute function public.record_content_history();

create table public.inquiries (
 id uuid primary key default gen_random_uuid(), name text not null, email text not null, company text not null default '',
 type text not null, brand text not null default '', message text not null,
 status text not null default 'new' check(status in ('new','read','closed')),
 created_at timestamptz not null default now()
);
alter table public.inquiries enable row level security;
create policy admin_inquiries on public.inquiries for select to authenticated using(public.is_admin());
create policy admin_inquiry_update on public.inquiries for update to authenticated using(public.is_admin()) with check(public.is_admin());
revoke all on public.inquiries from anon;
grant select,update on public.inquiries to authenticated;
create table public.inquiry_limits(key_hash text primary key,window_started timestamptz not null default now(),attempts integer not null default 1);
alter table public.inquiry_limits enable row level security;
revoke all on public.inquiry_limits from anon,authenticated;
create function public.submit_inquiry(payload jsonb, sender_hash text) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare current_attempts integer; result uuid;
begin
 insert into public.inquiry_limits as limits(key_hash) values(sender_hash)
 on conflict(key_hash) do update set
 attempts=case when limits.window_started<now()-interval '1 hour' then 1 else limits.attempts+1 end,
 window_started=case when limits.window_started<now()-interval '1 hour' then now() else limits.window_started end
 returning attempts into current_attempts;
 if current_attempts>5 then return null; end if;
 insert into public.inquiries(name,email,company,type,brand,message)
 values(payload->>'name',payload->>'email',coalesce(payload->>'company',''),payload->>'type',coalesce(payload->>'brand',''),payload->>'message') returning id into result;
 return result;
end $$;
revoke all on function public.submit_inquiry(jsonb,text) from public,anon,authenticated;
grant execute on function public.submit_inquiry(jsonb,text) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('media','media',true,5242880,array['image/jpeg','image/png','image/webp']);
create policy admin_upload on storage.objects for insert to authenticated with check(bucket_id='media' and public.is_admin());
create policy admin_media_list on storage.objects for select to authenticated using(bucket_id='media' and public.is_admin());
grant all on public.content,public.admin_users,public.content_history,public.inquiries,public.inquiry_limits to service_role;
grant usage,select on sequence public.content_history_id_seq to service_role;
-- Uploaded media are public assets. Do not upload confidential documents.
-- Create a user in Authentication > Users, then grant access:
-- insert into public.admin_users(user_id) values('THE-USER-UUID');
