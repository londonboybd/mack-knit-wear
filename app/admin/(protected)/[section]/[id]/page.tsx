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
  if (!config || (section === "pages" && id === "new")) notFound();
  const record =
    id === "new"
      ? undefined
      : (await adminRecords()).find(
          (r) => r.id === id && r.kind === config.kind,
        );
  if (id !== "new" && !record) notFound();
  return (
    <ContentEditor
      record={record}
      kind={config.kind}
      section={section}
      demo={demo}
    />
  );
}
