"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowUpRight, Plus, Layers, Copy, Trash2 } from "lucide-react";
import {
  pageTemplateLabels,
  type RecordItem,
  type PageTemplate,
} from "@/lib/schema";

export function StatusBadge({ record }: { record: RecordItem }) {
  const changed =
    record.published &&
    JSON.stringify(record.draft) !== JSON.stringify(record.published);

  return (
    <span className={`badge ${record.published ? "published" : "draft"}`}>
      {changed
        ? "Unpublished changes"
        : record.published
          ? "Published"
          : "Draft"}
    </span>
  );
}

export function RecordsTable({
  records,
  section,
  title,
  description,
}: {
  records: RecordItem[];
  section: string;
  title: string;
  description: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const isPages = section === "pages";

  const filtered = records.filter((r) => {
    const matchesQuery =
      r.draft.title.toLowerCase().includes(query.toLowerCase()) ||
      r.slug.toLowerCase().includes(query.toLowerCase());

    const hasChanged =
      r.published && JSON.stringify(r.draft) !== JSON.stringify(r.published);

    const matchesStatus =
      status === "all" ||
      (status === "published" && !!r.published && !hasChanged) ||
      (status === "draft" && !r.published) ||
      (status === "changed" && hasChanged);

    const matchesTemplate =
      !isPages ||
      templateFilter === "all" ||
      r.draft.template === templateFilter;

    return matchesQuery && matchesStatus && matchesTemplate;
  });

  const duplicateRecord = async (record: RecordItem) => {
    setBusyId(record.id);
    try {
      const newSlug = `${record.slug}-copy-${Math.floor(100 + Math.random() * 900)}`;
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: record.kind,
          slug: newSlug,
          content: {
            ...record.draft,
            title: `${record.draft.title} (Draft Copy)`,
          },
          action: "save", // Save as unpublished draft
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.refresh();
      router.push(`/admin/${section}/${data.id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to duplicate record.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">CONTENT MANAGEMENT</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <Link href={`/admin/${section}/new`} className="button dark">
          <Plus size={17} />
          Add{" "}
          {section === "pages"
            ? "page"
            : section === "brands"
              ? "brand"
              : section === "collections"
                ? "collection"
                : section === "products"
                  ? "product"
                  : section === "capabilities"
                    ? "capability"
                    : section === "network"
                      ? "relationship"
                      : "entry"}
        </Link>
      </div>

      <div className="panel">
        <div className="table-toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              aria-label={`Search ${title}`}
              placeholder={`Search by title or /slug…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="published">Published (no changes)</option>
            <option value="changed">Unpublished changes</option>
            <option value="draft">Draft (offline)</option>
          </select>

          {isPages && (
            <select
              aria-label="Filter by template"
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
            >
              <option value="all">All templates</option>
              {Object.entries(pageTemplateLabels).map(([tmpl, label]) => (
                <option key={tmpl} value={tmpl}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Title / Name</th>
                <th>URL identifier</th>
                {isPages && <th>Template</th>}
                <th>Status</th>
                <th>Last modified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.draft.title}</strong>
                    <small>
                      {r.draft.refCode ? `SKU: ${r.draft.refCode} · ` : ""}
                      {r.draft.category || r.kind}
                    </small>
                  </td>
                  <td className="muted">/{r.slug}</td>
                  {isPages && (
                    <td>
                      <span className="template-pill">
                        {pageTemplateLabels[r.draft.template as PageTemplate] ||
                          r.draft.template ||
                          "Editorial"}
                      </span>
                    </td>
                  )}
                  <td>
                    <StatusBadge record={r} />
                  </td>
                  <td className="muted">
                    {new Date(r.updated_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <div className="row-actions-group">
                      <Link
                        className="text-link"
                        href={`/admin/${section}/${r.id}`}
                      >
                        Edit <ArrowUpRight size={15} />
                      </Link>
                      <button
                        type="button"
                        className="icon-action-btn"
                        title="Duplicate as unpublished draft"
                        disabled={busyId === r.id}
                        onClick={() => duplicateRecord(r)}
                      >
                        <Copy size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <Layers />
            <h3>
              {query || status !== "all" || templateFilter !== "all"
                ? "No matching content"
                : "Ready for your first entry"}
            </h3>
            <p>
              {query || status !== "all" || templateFilter !== "all"
                ? "Try adjusting your search keywords or filter criteria."
                : "Add confirmed details, save a draft, and publish when ready."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
