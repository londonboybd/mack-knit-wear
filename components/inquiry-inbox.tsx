"use client";
import { useEffect, useState } from "react";
import { Inbox, Mail } from "lucide-react";
type Inquiry = {
  id: string;
  name: string;
  email: string;
  company: string;
  type: string;
  brand: string;
  message: string;
  status: string;
  created_at: string;
};
export function InquiryInbox({ demo }: { demo: boolean }) {
  const [items, setItems] = useState<Inquiry[]>([]),
    [selected, setSelected] = useState<Inquiry | null>(null),
    [error, setError] = useState(""),
    [filter, setFilter] = useState("all");
  useEffect(() => {
    if (!demo)
      fetch("/api/admin/inquiries")
        .then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          setItems(d);
        })
        .catch((e) => setError(e.message));
  }, [demo]);
  async function status(value: string) {
    if (!selected) return;
    try {
      const r = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, status: value }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setItems(
        items.map((i) => (i.id === selected.id ? { ...i, status: value } : i)),
      );
      setSelected({ ...selected, status: value });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update.");
    }
  }
  const filtered = items.filter((i) => filter === "all" || i.status === filter);
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">BUSINESS CONVERSATIONS</span>
          <h1>Inquiry inbox</h1>
          <p>Review website inquiries and follow up with the right people.</p>
        </div>
        <select
          aria-label="Filter inquiry status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All inquiries</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <p role="alert">{error}</p>
      {filtered.length === 0 ? (
        <div className="panel empty-state">
          <Inbox size={35} />
          <h2>
            {demo
              ? "Your next conversation starts here."
              : "No inquiries in this view."}
          </h2>
          <p>
            {demo
              ? "When connected, messages from the website will arrive in this inbox."
              : "New website inquiries will appear here."}
          </p>
        </div>
      ) : (
        <div className="inbox-layout">
          <section className="panel inquiry-list">
            {filtered.map((i) => (
              <button
                className={selected?.id === i.id ? "selected" : ""}
                key={i.id}
                onClick={() => setSelected(i)}
              >
                <strong>{i.name}</strong>
                <span className="badge draft">{i.status}</span>
                <p>
                  {i.type} · {i.company || "Individual inquiry"}
                </p>
                <small>{new Date(i.created_at).toLocaleString()}</small>
              </button>
            ))}
          </section>
          <section className="panel form-panel">
            {selected ? (
              <>
                <h2>{selected.name}</h2>
                <p>{selected.company}</p>
                <p>{selected.email}</p>
                <span className="badge draft">
                  {selected.type}
                  {selected.brand && ` / ${selected.brand}`}
                </span>
                <p className="message-body">{selected.message}</p>
                <label>
                  Status
                  <select
                    value={selected.status}
                    onChange={(e) => status(e.target.value)}
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
                <a
                  className="button dark"
                  href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: Your Mack Knit Wear inquiry")}`}
                >
                  <Mail size={16} />
                  Reply by email
                </a>
              </>
            ) : (
              <p>Select an inquiry to read it.</p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
