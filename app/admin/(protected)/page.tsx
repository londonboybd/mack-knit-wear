import Link from "next/link";
import {
  ArrowUpRight,
  Plus,
  Check,
  Clock3,
  Layers,
  Files,
  Network,
} from "lucide-react";
import { adminRecords } from "@/lib/content";
import { StatusBadge } from "@/components/records-table";
export default async function Dashboard() {
  const records = await adminRecords();
  const live = records.filter((r) => r.published).length;
  const cards = [
    ["Published content", live, Files],
    ["Owned brands", records.filter((r) => r.kind === "brand").length, Layers],
    [
      "Business relationships",
      records.filter((r) => r.kind === "network").length,
      Network,
    ],
  ] as const;
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">YOUR COMPANY, IN ONE PLACE</span>
          <h1>Workspace overview</h1>
          <p>Shape your story. Keep your website up to date.</p>
        </div>
        <Link className="button dark" href="/admin/brands/new">
          <Plus size={17} />
          Add a brand
        </Link>
      </div>
      <div className="stats-grid">
        {cards.map(([label, value, Icon]) => (
          <div className="stat-card" key={label}>
            <div>
              <span>{label}</span>
              <Icon size={19} />
            </div>
            <strong>{value.toString().padStart(2, "0")}</strong>
            <small>
              {label === "Published content"
                ? `${records.length - live} records remain in draft`
                : "Manage and grow your portfolio"}
            </small>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Recently updated</h2>
            <Link href="/admin/pages">
              All content <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Content</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {records
                  .filter((r) => r.kind !== "settings")
                  .slice(0, 6)
                  .map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.draft.title}</strong>
                        <small>{r.kind}</small>
                      </td>
                      <td>
                        <StatusBadge record={r} />
                      </td>
                      <td className="muted">
                        {new Date(r.updated_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          timeZone: "UTC",
                        })}
                      </td>
                      <td>
                        <Link
                          aria-label={`Edit ${r.draft.title}`}
                          href={`/admin/${r.kind === "page" ? "pages" : r.kind === "brand" ? "brands" : r.kind === "product" ? "products" : "network"}/${r.id}`}
                        >
                          <ArrowUpRight size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel launch-panel">
          <span className="eyebrow">BUILD YOUR FOUNDATION</span>
          <h2>Make it yours.</h2>
          <p>Your next steps for a complete company website.</p>
          {[
            [
              "Company information",
              "Add your story and contact details",
              "/admin/settings",
              records.some((r) => r.kind === "settings" && r.draft.email),
            ],
            [
              "First brand profile",
              "Add the logo, story, and store link",
              "/admin/brands",
              records.some((r) => r.kind === "brand" && r.draft.website),
            ],
            [
              "Original photography",
              "Upload company and product images",
              "/admin/media",
              false,
            ],
          ].map(([title, subtitle, href, done]) => (
            <Link
              className="checklist-item"
              href={href as string}
              key={title as string}
            >
              {done ? <Check size={18} /> : <Clock3 size={18} />}
              <span>
                <strong>{title}</strong>
                <small>{subtitle}</small>
              </span>
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </section>
      </div>
      <div className="admin-tip">
        <span className="tip-icon">i</span>
        <p>
          <strong>Draft first. Publish when ready.</strong> Saving a draft keeps
          the live website unchanged. Publish only after the company has
          confirmed the details.
        </p>
      </div>
    </>
  );
}
