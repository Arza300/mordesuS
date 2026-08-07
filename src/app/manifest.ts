import type { MetadataRoute } from "next";

import { SITE_URL, siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    id: SITE_URL,
    scope: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    lang: "en",
    icons: [
      {
        src: "/brand/mordesu-mark.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
