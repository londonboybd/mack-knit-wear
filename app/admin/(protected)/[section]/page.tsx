import { notFound } from "next/navigation";
import { adminRecords } from "@/lib/content";
import { demo } from "@/lib/supabase";
import { RecordsTable } from "@/components/records-table";
import { ContentEditor } from "@/components/content-editor";
import { MediaLibrary } from "@/components/media-library";
import { InquiryInbox } from "@/components/inquiry-inbox";
import { sections } from "@/lib/sections";
export default async function Section({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (section === "media") return <MediaLibrary demo={demo} />;
  if (section === "inquiries") return <InquiryInbox demo={demo} />;
  const records = await adminRecords();
  if (section === "settings") {
    const record = records.find((r) => r.kind === "settings");
    if (!record)
      return <p>Run the seed command to create the initial settings draft.</p>;
    return (
      <ContentEditor
        record={record}
        kind="settings"
        section="settings"
        demo={demo}
      />
    );
  }
  const config = sections[section];
  if (!config) notFound();
  return (
    <RecordsTable
      records={records.filter((r) => r.kind === config.kind)}
      section={section}
      title={config.title}
      description={config.description}
    />
  );
}
