"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, Plus, Layers } from "lucide-react";
import type { RecordItem } from "@/lib/schema";
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
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState("all");
  const filtered = records.filter(
    (r) =>
      r.draft.title.toLowerCase().includes(query.toLowerCase()) &&
      (status === "all" ||
        (status === "published" ? !!r.published : !r.published)),
  );
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">CONTENT MANAGEMENT</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {section !== "pages" && (
          <Link href={`/admin/${section}/new`} className="button dark">
            <Plus size={17} />
            Add{" "}
            {section === "brands"
              ? "brand"
              : section === "network"
                ? "relationship"
                : "product / service"}
          </Link>
        )}
      </div>
      <div className="panel">
        <div className="table-toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              aria-label={`Search ${title}`}
              placeholder={`Search ${title.toLowerCase()}…`}
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
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>URL / identifier</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.draft.title}</strong>
                    <small>{r.draft.category || r.kind}</small>
                  </td>
                  <td className="muted">/{r.slug}</td>
                  <td>
                    <StatusBadge record={r} />
                  </td>
                  <td>
                    <Link
                      className="text-link"
                      href={`/admin/${section}/${r.id}`}
                    >
                      Edit <ArrowUpRight size={16} />
                    </Link>
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
              {query || status !== "all"
                ? "No matching content"
                : "Ready for your first entry"}
            </h3>
            <p>
              {query || status !== "all"
                ? "Try a different search or filter."
                : "Add confirmed details, save a draft, and publish when ready."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
