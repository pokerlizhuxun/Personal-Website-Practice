import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.ownerName} | Portfolio`,
    template: `%s | ${siteConfig.ownerName}`,
  },
  description:
    "A bilingual portfolio and resume site built with Next.js, focused on product-minded engineering work.",
  openGraph: {
    type: "website",
    title: `${siteConfig.ownerName} | Portfolio`,
    description:
      "A bilingual portfolio and resume site built with Next.js, focused on product-minded engineering work.",
    url: siteConfig.siteUrl,
    siteName: `${siteConfig.ownerName} Portfolio`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.ownerName} | Portfolio`,
    description:
      "A bilingual portfolio and resume site built with Next.js, focused on product-minded engineering work.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
