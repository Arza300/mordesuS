import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Digital Product Studio`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  publisher: siteConfig.creator,
  keywords: [
    "Mordesu Studio",
    "creative agency",
    "web development studio",
    "digital product studio",
    "Next.js agency",
    "UI UX design",
    "WebGL experiences",
    "product engineering",
    "brand websites",
    "SaaS design",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: `${siteConfig.name} — Digital Product Studio`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Digital Product Studio`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/brand/favicon.png", type: "image/png", sizes: "256x256" },
    ],
    apple: [
      {
        url: "/brand/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
    shortcut: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteConfig.url,
  },
};
