/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";

import { AmbientCursor } from "@/components/effects/ambient-cursor";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const description =
    "Portfolio of Sonal Hegde, an Electronics & Communication Engineering undergraduate building embedded systems, cyber-physical research prototypes, edge AI, and digital twins.";

  return {
    metadataBase,
    title: "Sonal Hegde — Embedded Systems & Edge AI",
    description,
    authors: [{ name: "Sonal Hegde" }],
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
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist+Pixel&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <AmbientCursor />
      </body>
    </html>
  );
}
