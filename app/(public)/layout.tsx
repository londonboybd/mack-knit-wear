import { PublicShell } from "@/components/public-shell";
import { publicRecords, fallbackSettings } from "@/lib/content";
import { demo } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const records = await publicRecords();
  const settings =
    records.find((r) => r.kind === "settings")?.published || fallbackSettings;
  return (
    <PublicShell settings={settings} records={records} demo={demo}>
      {children}
    </PublicShell>
  );
}
