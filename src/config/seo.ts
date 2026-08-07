import type { Metadata } from "next";

import { SITE_URL, siteConfig } from "@/config/site";

const defaultTitle = "Mordesu Studio | Web Design & Development Studio";
const defaultDescription =
  "Mordesu Studio designs and develops high-performance websites, e-commerce solutions, educational platforms, and custom web applications for businesses and creators.";

export const defaultMetadata: Metadata = {
  metadataBase: new URL("https://mordesu.tech"),
  title: {
    default: defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: defaultDescription,
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
    url: SITE_URL,
    title: defaultTitle,
    description: defaultDescription,
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
    title: defaultTitle,
    description: defaultDescription,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};
