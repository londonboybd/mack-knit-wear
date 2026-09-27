import type { Metadata } from "next";
import "./globals.css";
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
