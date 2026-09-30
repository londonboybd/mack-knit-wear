import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F3F0E9",
};

export const metadata: Metadata = {
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
      <body>{children}</body>
    </html>
  );
}
