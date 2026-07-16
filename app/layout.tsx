/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata, Viewport } from "next";

import { AmbientCursor } from "@/components/effects/ambient-cursor";
import { SiteAsciiBackdrop } from "@/components/effects/site-ascii-backdrop";

import "./globals.css";

export function generateMetadata(): Metadata {
  const metadataBase = new URL("https://www.sonal.work.gd");
  const description =
    "Portfolio of Sonal Hegde, an Electronics & Communication Engineering undergraduate building embedded systems, cyber-physical research prototypes, edge AI, and digital twins.";

  return {
    metadataBase,
    title: "Sonal Hegde — Embedded Systems & Edge AI",
    description,
    authors: [{ name: "Sonal Hegde" }],
    alternates: { canonical: "https://www.sonal.work.gd" },
    robots: { index: true, follow: true },
    keywords: [
      "Sonal Hegde",
      "embedded systems",
      "edge AI",
      "cyber-physical systems",
      "IoT",
      "digital twin",
    ],
    openGraph: {
      title: "Sonal Hegde — Embedded Systems & Edge AI",
      description,
      type: "website",
      images: [{ url: new URL("/og.png", metadataBase), width: 1734, height: 907, alt: "Sonal Hegde — Circuits, Code, Cognition" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Sonal Hegde — Embedded Systems & Edge AI",
      description,
      images: [new URL("/og.png", metadataBase)],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#07080c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self'; worker-src 'self' blob:; media-src 'self'; form-action 'self'; upgrade-insecure-requests"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist+Pixel&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SiteAsciiBackdrop />
        {children}
        <AmbientCursor />
      </body>
    </html>
  );
}
