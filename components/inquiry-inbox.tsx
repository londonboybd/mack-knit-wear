"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Inbox,
  Mail,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  MessageSquare,
  Building,
  Globe,
  Tag,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import {
  inquiryStatuses,
  inquiryStatusLabels,
  type InquiryStatus,
  type InquiryItem,
} from "@/lib/schema";

const PAGE_SIZE = 8;

export function InquiryInbox({ demo }: { demo: boolean }) {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Filters & Search
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  // New note input
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (demo) {
      setItems([
        {
          id: "demo-inq-1",
          reference_code: "INQ-20260927-A8B9C0",
          name: "Helena Lindqvist",
          email: "h.lindqvist@kobenretail.example.com",
          company: "Køben Retail Group",
          type: "Wholesale",
          brand: "Norse Haven",
          message:
            "We are planning our Autumn/Winter 2026 knitwear assortment for our Oslo and Stockholm stores. Would like to receive wholesale line-sheets, minimums, and fabric swatch books.",
          status: "new",
          created_at: new Date().toISOString(),
          source_url: "https://mackknitwear.com/brands/norse-haven",
          details: {
            country: "Norway & Sweden",
            quantity: "1,200 pieces",
            timeline: "Q3 2026 delivery",
            productName: "Fine-Gauge Merino Crewneck",
          },
          notification_status: "sent",
          notification_attempts: 1,
          internal_notes: [
            {
              id: "n-1",
              text: "Sent introductory digital line-sheet; scheduled showroom visit for next Tuesday.",
              created_at: new Date(Date.now() - 3600000).toISOString(),
              author: "Commercial Director",
            },
          ],
        },
      ]);
      setSelectedId("demo-inq-1");
      return;
    }

    setLoading(true);
    fetch("/api/admin/inquiries")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setItems(d);
        if (d.length > 0 && !selectedId) {
          setSelectedId(d[0].id);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [demo]);

  async function updateStatus(id: string, newStatus: InquiryStatus) {
    try {
      const r = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);

      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update status.");
    }
  }

  async function addNote(id: string) {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const r = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, note: noteText.trim() }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);

      const newNote = {
        id: crypto.randomUUID(),
        text: noteText.trim(),
        created_at: new Date().toISOString(),
        author: "You",
      };

      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, internal_notes: [...(i.internal_notes || []), newNote] }
            : i,
        ),
      );
      setNoteText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to add internal note.");
    } finally {
      setAddingNote(false);
    }
  }

  async function retryNotification(id: string) {
    setRetryingId(id);
    try {
      const res = await fetch("/api/admin/inquiries/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                notification_status: data.status,
                notification_attempts: (i.notification_attempts || 0) + 1,
              }
            : i,
        ),
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to retry notification.");
    } finally {
      setRetryingId(null);
    }
  }

  // Filtered inquiries list
  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchQuery =
        !query ||
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        i.email.toLowerCase().includes(query.toLowerCase()) ||
        i.company?.toLowerCase().includes(query.toLowerCase()) ||
        i.reference_code?.toLowerCase().includes(query.toLowerCase()) ||
        i.message.toLowerCase().includes(query.toLowerCase());

      // Map legacy "read" to "in_progress" for filtering consistency
      const effectiveStatus = i.status === "read" ? "in_progress" : i.status;
      const matchStatus =
        statusFilter === "all" ||
        effectiveStatus === statusFilter ||
        (statusFilter === "in_progress" && i.status === "read");

      const matchType = typeFilter === "all" || i.type === typeFilter;

      return matchQuery && matchStatus && matchType;
    });
  }, [items, query, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectedInquiry =
    items.find((i) => i.id === selectedId) || filtered[0] || null;

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">COMMERCIAL DESK</span>
          <h1>Inquiry Inbox</h1>
          <p>
            Track wholesale requests, customer dialogues, and internal staff follow-ups.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-error-banner" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar: Search & Filters */}
      <div className="table-toolbar inbox-toolbar">
        <div className="search-field">
          <Search size={16} />
          <input
            placeholder="Search by buyer name, email, company, or INQ reference…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter status"
        >
          <option value="all">All statuses ({items.length})</option>
          <option value="new">New</option>
          <option value="in_progress">In progress</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter inquiry type"
        >
          <option value="all">All inquiry types</option>
          <option value="Wholesale">Wholesale</option>
          <option value="General">General</option>
          <option value="Brand partnership">Brand partnership</option>
          <option value="Sourcing & export">Sourcing & export</option>
          <option value="Sample request">Sample request</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="panel empty-state">
          <Inbox size={36} />
          <h3>No inquiries found</h3>
          <p>
            {query || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your search criteria."
              : demo
                ? "Inquiries submitted via the public contact form will appear here."
                : "No inquiries currently recorded in this inbox view."}
          </p>
        </div>
      ) : (
        <div className="inbox-split-layout">
          {/* List Column */}
          <aside className="inbox-list-col">
            <div className="inbox-cards-scroll">
              {paginated.map((i) => {
                const isSelected = selectedInquiry?.id === i.id;
                const statusLabel =
                  inquiryStatusLabels[i.status as InquiryStatus] || i.status;

                return (
                  <button
                    type="button"
                    key={i.id}
                    className={`inbox-item-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedId(i.id)}
                  >
                    <div className="inbox-card-top">
                      <span className="inbox-ref-badge">{i.reference_code || "INQ"}</span>
                      <span className={`status-pill ${i.status}`}>{statusLabel}</span>
                    </div>

                    <strong>{i.name}</strong>
                    <span className="inbox-card-company">{i.company || i.email}</span>

                    <div className="inbox-card-subinfo">
                      <span className="inbox-type-tag">{i.type}</span>
                      {i.brand && <span className="inbox-brand-tag">· {i.brand}</span>}
                    </div>

                    <small className="inbox-card-date">
                      {new Date(i.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </button>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="inbox-pagination">
                <button
                  type="button"
                  disabled={page <= 1}
                  className="button outline small"
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </button>
                <small>
                  {page} / {totalPages}
                </small>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  className="button outline small"
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </aside>

          {/* Details / Review Pane */}
          <main className="inbox-detail-col">
            {selectedInquiry ? (
              <div className="panel inquiry-detail-card">
                {/* Header Information */}
                <div className="inquiry-header-row">
                  <div>
                    <div className="inquiry-ref-lead">
                      <span className="reference-code-lead">{selectedInquiry.reference_code}</span>
                      <span className="eyebrow">{selectedInquiry.type} INQUIRY</span>
                    </div>
                    <h2>{selectedInquiry.name}</h2>
                    <p className="company-lead">
                      {selectedInquiry.company ? (
                        <>
                          <Building size={15} /> {selectedInquiry.company} ·{" "}
                        </>
                      ) : null}
                      <a href={`mailto:${selectedInquiry.email}`}>{selectedInquiry.email}</a>
                    </p>
                  </div>

                  {/* Status Controller */}
                  <div className="inquiry-status-selector">
                    <label>
                      Progress Status
                      <select
                        value={selectedInquiry.status === "read" ? "in_progress" : selectedInquiry.status}
                        onChange={(e) =>
                          updateStatus(selectedInquiry.id, e.target.value as InquiryStatus)
                        }
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In progress</option>
                        <option value="replied">Replied (Confirmed)</option>
                        <option value="closed">Closed</option>
                      </select>
                    </label>
                  </div>
                </div>

                {/* Email Delivery Sub-Panel */}
                <div className="notification-status-bar">
                  <div className="notif-state-info">
                    {selectedInquiry.notification_status === "sent" ? (
                      <span className="notif-pill success">
                        <CheckCircle size={14} /> Staff notification delivered
                      </span>
                    ) : selectedInquiry.notification_status === "failed" ? (
                      <span className="notif-pill error">
                        <AlertCircle size={14} /> Staff notification failed
                      </span>
                    ) : (
                      <span className="notif-pill muted">
                        <Clock size={14} /> Notification: {selectedInquiry.notification_status || "Unconfigured"}
                      </span>
                    )}

                    {selectedInquiry.notification_attempts ? (
                      <small className="muted">
                        ({selectedInquiry.notification_attempts} attempt{selectedInquiry.notification_attempts > 1 ? "s" : ""})
                      </small>
                    ) : null}
                  </div>

                  {selectedInquiry.notification_status === "failed" && !demo && (
                    <button
                      type="button"
                      className="button outline small"
                      disabled={retryingId === selectedInquiry.id}
                      onClick={() => retryNotification(selectedInquiry.id)}
                    >
                      <RefreshCw size={13} className={retryingId === selectedInquiry.id ? "spinning" : ""} />
                      {retryingId === selectedInquiry.id ? "Retrying…" : "Retry delivery"}
                    </button>
                  )}
                </div>

                {/* Contextual & Conditional Details */}
                {selectedInquiry.details && Object.keys(selectedInquiry.details).length > 0 && (
                  <div className="inquiry-context-grid">
                    {selectedInquiry.details.productName && (
                      <div className="context-item">
                        <span className="context-label">Product Inquired</span>
                        <strong>
                          {selectedInquiry.details.productName}
                          {selectedInquiry.details.productRefCode && ` (${selectedInquiry.details.productRefCode})`}
                        </strong>
                      </div>
                    )}
                    {selectedInquiry.details.country && (
                      <div className="context-item">
                        <span className="context-label">Destination Country</span>
                        <strong>{selectedInquiry.details.country}</strong>
                      </div>
                    )}
                    {selectedInquiry.details.quantity && (
                      <div className="context-item">
                        <span className="context-label">Estimated Quantity</span>
                        <strong>{selectedInquiry.details.quantity}</strong>
                      </div>
                    )}
                    {selectedInquiry.details.timeline && (
                      <div className="context-item">
                        <span className="context-label">Target Timeline</span>
                        <strong>{selectedInquiry.details.timeline}</strong>
                      </div>
                    )}
                    {selectedInquiry.details.companyWebsite && (
                      <div className="context-item">
                        <span className="context-label">Company Website</span>
                        <a
                          href={selectedInquiry.details.companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-link"
                        >
                          {selectedInquiry.details.companyWebsite} <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Primary Message Box */}
                <div className="inquiry-message-container">
                  <h4>Message</h4>
                  <p className="inquiry-message-text">{selectedInquiry.message}</p>
                </div>

                {/* Email Reply Action (Opens mailto, does not falsely mark replied) */}
                <div className="inquiry-reply-action-bar">
                  <a
                    className="button dark"
                    href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                      `Re: Your Mack Knit Wear Inquiry (${selectedInquiry.reference_code})`,
                    )}`}
                  >
                    <Mail size={16} /> Open email reply client
                  </a>
                  <small className="muted">
                    Clicking opens your mail client. To mark as replied, update the status dropdown above.
                  </small>
                </div>

                {/* Internal Staff Notes & Audit Trail */}
                <div className="internal-notes-section">
                  <h4>
                    <MessageSquare size={16} /> Internal Staff Notes
                  </h4>
                  <div className="notes-list">
                    {selectedInquiry.internal_notes && selectedInquiry.internal_notes.length > 0 ? (
                      selectedInquiry.internal_notes.map((note) => (
                        <div className="note-card" key={note.id}>
                          <p>{note.text}</p>
                          <div className="note-meta">
                            <span>{note.author || "Staff member"}</span>
                            <span>{new Date(note.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <small className="muted">No internal notes added yet.</small>
                    )}
                  </div>

                  {/* Add Note Input */}
                  <div className="add-note-box">
                    <textarea
                      rows={2}
                      placeholder="Add an internal follow-up note (visible only to administrators)…"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={addingNote || !noteText.trim()}
                      className="button outline small"
                      onClick={() => addNote(selectedInquiry.id)}
                    >
                      <Send size={14} /> Add note
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="panel empty-state">
                <p>Select an inquiry to view details and history.</p>
              </div>
            )}
          </main>
        </div>
      )}
    </>
  );
}
