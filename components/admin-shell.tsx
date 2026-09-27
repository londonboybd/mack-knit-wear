"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Files,
  Layers,
  Network,
  Package,
  Image as ImageIcon,
  Inbox,
  Settings,
  ArrowUpRight,
  LogOut,
  PanelLeft,
} from "lucide-react";
import { useState } from "react";
const links = [
  ["Overview", "/admin", LayoutDashboard],
  ["Website preview", "/admin/preview", ArrowUpRight],
  ["Pages", "/admin/pages", Files],
  ["Our brands", "/admin/brands", Layers],
  ["Business network", "/admin/network", Network],
  ["Products & services", "/admin/products", Package],
  ["Media library", "/admin/media", ImageIcon],
  ["Inquiries", "/admin/inquiries", Inbox],
  ["Site settings", "/admin/settings", Settings],
] as const;
export function AdminShell({
  children,
  demo,
  email,
}: {
  children: React.ReactNode;
  demo: boolean;
  email: string;
}) {
  const path = usePathname(),
    router = useRouter();
  const [open, setOpen] = useState(false),
    [error, setError] = useState("");
  async function logout() {
    const r = await fetch("/api/auth/logout", { method: "POST" });
    if (r.ok) {
      router.push("/admin/login");
      router.refresh();
    } else setError("Unable to sign out. Try again.");
  }
  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <Link className="admin-logo" href="/admin">
          <span className="monogram">M</span>
          <span>
            Mack Knit Wear<small>CONTENT STUDIO</small>
          </span>
        </Link>
        <p className="sidebar-caption">WORKSPACE</p>
        <nav aria-label="Admin navigation">
          {links.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={
                path === href ||
                (href !== "/admin" && path.startsWith(href + "/"))
                  ? "active"
                  : ""
              }
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/" target="_blank">
            View website <ArrowUpRight size={16} />
          </Link>
          <div className="admin-account">
            <span className="avatar">M</span>
            <span>
              {demo ? "Preview workspace" : "Administrator"}
              <small>{demo ? "Local design preview" : email}</small>
            </span>
          </div>
          {!demo && (
            <button onClick={logout}>
              <LogOut size={15} />
              Sign out
            </button>
          )}
          <p role="status">{error}</p>
        </div>
      </aside>
      <div className="admin-body">
        <header className="admin-topbar">
          <button
            className="sidebar-toggle"
            aria-label="Toggle admin navigation"
            onClick={() => setOpen(!open)}
          >
            <PanelLeft size={22} />
          </button>
          <span>
            Mack Knit Wear <span className="muted">/ Content studio</span>
          </span>
          <span className="workspace-status">
            {demo ? "Design preview" : "Connected workspace"}
          </span>
        </header>
        {demo && (
          <div className="admin-demo">
            You’re exploring a design preview. Edit fields and preview layouts;
            connect Supabase to save, publish, upload, and receive inquiries.
          </div>
        )}
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
