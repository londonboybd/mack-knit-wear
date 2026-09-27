import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { contentSchema, inquirySchema } from "../lib/schema";

test("Public URLs cannot execute scripts or use protocol-relative URLs", () => {
  for (const website of [
    "javascript:alert(1)",
    "//evil.example",
    "data:text/html,test",
    "http://insecure.example",
  ])
    assert.equal(
      contentSchema.safeParse({ title: "Brand", website }).success,
      false,
    );
  assert.equal(
    contentSchema.safeParse({
      title: "Brand",
      website: "https://example.com/shop",
    }).success,
    true,
  );
  assert.equal(
    contentSchema.safeParse({ title: "Brand", ctaHref: "//evil.example" })
      .success,
    false,
  );
});
test("Inquiry validation rejects incomplete messages and invalid emails", () => {
  assert.equal(
    inquirySchema.safeParse({
      name: "A",
      email: "bad",
      type: "General",
      message: "Hi",
    }).success,
    false,
  );
  assert.equal(
    inquirySchema.safeParse({
      name: "Buyer",
      email: "buyer@example.com",
      type: "Wholesale",
      message: "Please share your product range.",
    }).success,
    true,
  );
});
test("Database protects drafts, revisions, administrator membership and inquiry submission", async () => {
  const pg = new PGlite();
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
  await pg.exec(
    await readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8"),
  );
  const admin = "11111111-1111-4111-8111-111111111111",
    other = "22222222-2222-4222-8222-222222222222";
  await pg.query("insert into auth.users values($1),($2)", [admin, other]);
  await pg.query("insert into public.admin_users values($1)", [admin]);
  await pg.exec(
    `insert into public.content(kind,slug,draft,published) values('brand','test-brand','{"title":"Private draft"}','{"title":"Public title"}'),('brand','draft-only','{"title":"Secret brand"}',null);`,
  );
  await pg.exec("set role anon");
  assert.equal(
    (await pg.query("select * from public.public_content")).rows.length,
    1,
  );
  const published = await pg.query<{
    published: { title: string };
    draft?: unknown;
  }>("select * from public.public_content");
  assert.equal(published.rows[0].published.title, "Public title");
  assert.equal("draft" in published.rows[0], false);
  await assert.rejects(() => pg.query("select draft from public.content"));
  await assert.rejects(() =>
    pg.query(`update public.public_content set published='{"title":"Hacked"}'`),
  );
  await assert.rejects(() =>
    pg.query(
      `insert into public.public_content(kind,slug,published) values('brand','injected','{}')`,
    ),
  );
  await assert.rejects(() => pg.query("delete from public.public_content"));
  await assert.rejects(() =>
    pg.query(`select public.submit_inquiry('{}','spoofed')`),
  );
  await pg.exec("reset role; set role authenticated");
  await pg.query(`select set_config('request.jwt.claim.sub',$1,false)`, [
    other,
  ]);
  assert.equal((await pg.query("select * from public.content")).rows.length, 0);
  await assert.rejects(() =>
    pg.query("insert into public.admin_users values($1)", [other]),
  );
  await assert.rejects(() =>
    pg.query(
      `insert into public.content(kind,slug,draft) values('brand','unauthorized','{}')`,
    ),
  );
  await assert.rejects(() =>
    pg.query(
      `insert into public.inquiries(name,email,type,message) values('Someone','x@example.com','General','Forbidden direct insert')`,
    ),
  );
  await pg.query(`select set_config('request.jwt.claim.sub',$1,false)`, [
    admin,
  ]);
  assert.equal((await pg.query("select * from public.content")).rows.length, 2);
  await pg.exec(
    `update public.content set draft='{"title":"Updated private draft"}' where slug='test-brand'`,
  );
  assert.equal(
    (await pg.query("select * from public.content_history")).rows.length,
    1,
  );
  assert.equal(
    (
      await pg.query<{ published: { title: string } }>(
        "select published from public.public_content",
      )
    ).rows[0].published.title,
    "Public title",
  );
  await pg.exec(
    `update public.content set published=draft where slug='test-brand'`,
  );
  assert.equal(
    (
      await pg.query<{ published: { title: string } }>(
        "select published from public.public_content",
      )
    ).rows[0].published.title,
    "Updated private draft",
  );
  await pg.exec(
    `update public.content set published=null where slug='test-brand'`,
  );
  assert.equal(
    (await pg.query("select * from public.public_content")).rows.length,
    0,
  );
  await pg.exec("reset role;set role service_role");
  const payload = {
    name: "Test buyer",
    email: "test@example.com",
    type: "General",
    message: "A meaningful test inquiry.",
  };
  for (let i = 0; i < 5; i++)
    assert.ok(
      (
        await pg.query<{ id: string | null }>(
          "select public.submit_inquiry($1,$2) as id",
          [JSON.stringify(payload), "test-sender"],
        )
      ).rows[0].id,
    );
  assert.equal(
    (
      await pg.query<{ id: string | null }>(
        "select public.submit_inquiry($1,$2) as id",
        [JSON.stringify(payload), "test-sender"],
      )
    ).rows[0].id,
    null,
  );
  await pg.exec("reset role");
  assert.equal(
    (await pg.query("select * from public.inquiries")).rows.length,
    5,
  );
  await pg.close();
});
