"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  X,
  Search,
  Check,
  Image as ImageIcon,
  AlertTriangle,
  Trash2,
} from "lucide-react";

export type MediaAsset = {
  name: string;
  url: string;
  alt?: string;
  caption?: string;
  size?: number;
  usages?: Array<{ kind: string; slug: string; title: string }>;
  isUsed?: boolean;
};

export function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  demo = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: { url: string; alt: string; caption?: string }) => void;
  demo?: boolean;
}) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Upload fields
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (demo) {
      setItems([
        {
          name: "knitwear.jpg",
          url: "/images/knitwear.jpg",
          alt: "Close-up textile photograph of fine-gauge knitwear",
          caption: "Natural undyed wool swatch",
          isUsed: true,
          usages: [{ kind: "page", slug: "home", title: "Made of possibility" }],
        },
      ]);
      return;
    }

    setLoading(true);
    fetch("/api/admin/media")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setItems(data);
      })
      .catch((err) => setErrorMessage(err.message))
      .finally(() => setLoading(false));
  }, [isOpen, demo]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleUpload() {
    if (!uploadFile) return;
    setUploadBusy(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.set("file", uploadFile);
      formData.set("alt", uploadAlt.trim());
      formData.set("caption", uploadCaption.trim());

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const newAsset: MediaAsset = {
        name: data.name,
        url: data.url,
        alt: uploadAlt.trim(),
        caption: uploadCaption.trim(),
        isUsed: false,
      };

      setItems((prev) => [newAsset, ...prev]);
      onSelect({
        url: data.url,
        alt: uploadAlt.trim(),
        caption: uploadCaption.trim(),
      });
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadBusy(false);
    }
  }

  async function handleDelete(asset: MediaAsset) {
    if (asset.isUsed) {
      alert(`Cannot delete: this image is referenced in ${asset.usages?.map((u) => u.title).join(", ")}`);
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete "${asset.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/media?name=${encodeURIComponent(asset.name)}&url=${encodeURIComponent(asset.url)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setItems((prev) => prev.filter((i) => i.url !== asset.url));
      if (selectedAsset?.url === asset.url) setSelectedAsset(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  const filteredItems = items.filter(
    (item) =>
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alt?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className="lightbox-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Media asset picker"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="media-picker-modal">
        <div className="media-picker-header">
          <div>
            <h3>Visual Asset Picker</h3>
            <p className="muted">Select an existing photograph or upload a new asset.</p>
          </div>
          <button type="button" className="icon-action-btn" onClick={onClose} aria-label="Close picker">
            <X size={20} />
          </button>
        </div>

        <div className="picker-tabs-row">
          <button
            type="button"
            className={`picker-tab-btn ${tab === "library" ? "active" : ""}`}
            onClick={() => setTab("library")}
          >
            Asset Library ({items.length})
          </button>
          <button
            type="button"
            className={`picker-tab-btn ${tab === "upload" ? "active" : ""}`}
            onClick={() => setTab("upload")}
          >
            Upload New Asset
          </button>
        </div>

        {errorMessage && (
          <div className="form-error-banner" role="alert">
            <AlertTriangle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {tab === "library" ? (
          <div className="picker-library-body">
            <div className="search-field picker-search">
              <Search size={15} />
              <input
                placeholder="Search assets by file name or alt text…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="picker-grid-scroll">
              {filteredItems.map((asset) => {
                const isSelected = selectedAsset?.url === asset.url;
                return (
                  <div
                    key={asset.url}
                    className={`picker-asset-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="picker-asset-thumbnail">
                      <img src={asset.url} alt={asset.alt || asset.name} loading="lazy" />
                      {isSelected && (
                        <span className="selected-check-badge">
                          <Check size={14} />
                        </span>
                      )}
                    </div>
                    <div className="picker-card-info">
                      <strong title={asset.name}>{asset.name}</strong>
                      {asset.isUsed ? (
                        <span className="badge published" title={`Used in: ${asset.usages?.map((u) => u.title).join(", ")}`}>
                          Used in {asset.usages?.length} item(s)
                        </span>
                      ) : (
                        <span className="badge draft">Unused</span>
                      )}
                    </div>

                    {!asset.isUsed && !demo && (
                      <button
                        type="button"
                        className="picker-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(asset);
                        }}
                        title="Delete asset"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}

              {filteredItems.length === 0 && !loading && (
                <div className="empty-subpanel">
                  <ImageIcon size={30} />
                  <p>No media assets found.</p>
                </div>
              )}
            </div>

            <div className="picker-footer-actions">
              <button type="button" className="button outline small" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="button dark small"
                disabled={!selectedAsset}
                onClick={() => {
                  if (selectedAsset) {
                    onSelect({
                      url: selectedAsset.url,
                      alt: selectedAsset.alt || "",
                      caption: selectedAsset.caption || "",
                    });
                    onClose();
                  }
                }}
              >
                Use Selected Image
              </button>
            </div>
          </div>
        ) : (
          <div className="picker-upload-body">
            <label className="upload-dropzone">
              <Upload size={32} />
              <span>Click to select an image file</span>
              <small className="muted">JPG, PNG, or WebP under 3 MB</small>
              <input
                type="file"
                className="sr-only"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setUploadFile(f);
                    setUploadAlt(f.name.replace(/\.[^/.]+$/, ""));
                  }
                }}
              />
            </label>

            {uploadFile && (
              <div className="upload-meta-fields">
                <p>
                  Selected: <strong>{uploadFile.name}</strong> ({(uploadFile.size / 1024).toFixed(1)} KB)
                </p>

                <label>
                  Alternative text <span className="req">*</span>
                  <input
                    required
                    placeholder="Describe what this photograph portrays for accessibility…"
                    value={uploadAlt}
                    onChange={(e) => setUploadAlt(e.target.value)}
                  />
                </label>

                <label>
                  Caption / subtext <span className="muted">(optional)</span>
                  <input
                    placeholder="Editorial caption to accompany the image…"
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                  />
                </label>
              </div>
            )}

            <div className="picker-footer-actions">
              <button type="button" className="button outline small" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="button dark small"
                disabled={!uploadFile || uploadBusy || !uploadAlt.trim()}
                onClick={handleUpload}
              >
                {uploadBusy ? "Uploading…" : "Upload & Select"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
