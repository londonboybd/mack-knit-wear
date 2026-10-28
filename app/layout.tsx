import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F3F0E9",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Mack Knit Wear", template: "%s | Mack Knit Wear" },
  description: "Discover Mack Knit Wear and its brand portfolio.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <noscript>
          <style>{`
            .motion-reveal,
            .motion-hero-entrance,
            .motion-stagger-group,
            .motion-stagger-item,
            .motion-image-reveal-wrapper img,
            [style*="opacity:0"],
            [style*="opacity: 0"] {
              opacity: 1 !important;
              transform: none !important;
              visibility: visible !important;
            }
          `}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
