import { notFound } from "next/navigation";
import { adminRecords } from "@/lib/content";
import { demo } from "@/lib/supabase";
import { ContentEditor } from "@/components/content-editor";
import { sections } from "@/lib/sections";

export default async function Edit({
  params,
}: {
  params: Promise<{ section: string; id: string }>;
}) {
  const { section, id } = await params;
  const config = sections[section];
  if (!config) notFound();

  const records = await adminRecords();
  const record =
    id === "new"
      ? undefined
      : records.find((r) => r.id === id && r.kind === config.kind);

  if (id !== "new" && !record) notFound();

  return (
    <ContentEditor
      record={record}
      kind={config.kind}
      section={section}
      demo={demo}
      allRecords={records}
    />
  );
}
