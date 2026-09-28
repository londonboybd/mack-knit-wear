"use client";

import { useState } from "react";
import { Monitor, Tablet, Smartphone, ArrowUpRight, ShieldAlert } from "lucide-react";

export function WebsitePreview({
  pages,
}: {
  pages: { title: string; path: string; isDraft?: boolean }[];
}) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [path, setPath] = useState("/");

  const selectedPage = pages.find((p) => p.path === path);

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">RESPONSIVE AUDIT</span>
          <h1>Website preview</h1>
          <p>
            Verify responsive rendering across 1440px desktop, 768px tablet, and 390px mobile viewports.
          </p>
        </div>
      </div>

      <div className="preview-toolbar">
        <select
          aria-label="Page to preview"
          value={path}
          onChange={(e) => setPath(e.target.value)}
        >
          {pages.map((p) => (
            <option key={p.path} value={p.path}>
              {p.title} ({p.path}) {p.isDraft ? "· [Draft Only]" : ""}
            </option>
          ))}
        </select>

        <button
          type="button"
          aria-pressed={device === "desktop"}
          className={`button ${device === "desktop" ? "dark" : "outline"}`}
          onClick={() => setDevice("desktop")}
        >
          <Monitor size={17} />
          1440px Desktop
        </button>

        <button
          type="button"
          aria-pressed={device === "tablet"}
          className={`button ${device === "tablet" ? "dark" : "outline"}`}
          onClick={() => setDevice("tablet")}
        >
          <Tablet size={17} />
          768px Tablet
        </button>

        <button
          type="button"
          aria-pressed={device === "mobile"}
          className={`button ${device === "mobile" ? "dark" : "outline"}`}
          onClick={() => setDevice("mobile")}
        >
          <Smartphone size={17} />
          390px Mobile
        </button>

        <a
          className="text-link"
          href={path}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open live in new tab <ArrowUpRight size={15} />
        </a>
      </div>

      {selectedPage?.isDraft && (
        <div className="preview-banner-note">
          <ShieldAlert size={16} />
          <span>This page contains unpublished draft changes not yet exposed to public visitors.</span>
        </div>
      )}

      <div className={`device-frame frame-${device}`}>
        <div className="device-screen-bar">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
          <span className="device-url-display">https://mackknitwear.com{path}</span>
        </div>
        <iframe
          src={path}
          title="Responsive website preview frame"
          className="device-viewport-iframe"
        />
      </div>
    </>
  );
}
