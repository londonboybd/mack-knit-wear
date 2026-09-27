import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { seed } from "../lib/seed";
loadEnvConfig(process.cwd());
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error("Set Supabase environment variables in .env.local first.");
  const client = createClient(url, key, { auth: { persistSession: false } });
  // Never overwrite existing content or publish example claims.
  for (const { id, kind, slug, draft } of seed) {
    const { error } = await client
      .from("content")
      .upsert(
        { id, kind, slug, draft, published: null, published_at: null },
        { onConflict: "kind,slug", ignoreDuplicates: true },
      );
    if (error) throw error;
  }
  console.log("Draft records added. Review and publish them from /admin.");
}
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
