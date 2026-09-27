"use client";
import { useState } from "react";
import { Monitor, Smartphone, ArrowUpRight } from "lucide-react";
export function WebsitePreview({
  pages,
}: {
  pages: { title: string; path: string }[];
}) {
  const [device, setDevice] = useState("desktop"),
    [path, setPath] = useState("/");
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">PUBLIC WEBSITE</span>
          <h1>Website preview</h1>
          <p>
            Check the published website on desktop and mobile. Use a content
            editor to preview unsaved drafts.
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
              {p.title}
            </option>
          ))}
        </select>
        <button
          aria-pressed={device === "desktop"}
          className={`button ${device === "desktop" ? "dark" : "outline"}`}
          onClick={() => setDevice("desktop")}
        >
          <Monitor size={17} />
          Desktop
        </button>
        <button
          aria-pressed={device === "mobile"}
          className={`button ${device === "mobile" ? "dark" : "outline"}`}
          onClick={() => setDevice("mobile")}
        >
          <Smartphone size={17} />
          Mobile
        </button>
        <a
          className="text-link"
          href={path}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open website <ArrowUpRight size={15} />
        </a>
      </div>
      <div className={`device-frame ${device}`}>
        <iframe src={path} title="Published website preview" />
      </div>
    </>
  );
}
