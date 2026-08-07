/** Canonical production origin for SEO, Open Graph, and structured data. */
export const SITE_URL = "https://mordesu.tech" as const;

export const siteConfig = {
  name: "Mordesu Studio",
  shortName: "Mordesu",
  description:
    "Mordesu Studio designs and builds high-performance web products for ambitious brands — blending cinematic craft with engineering precision.",
  url: SITE_URL,
  ogImage: "/og.svg",
  links: {
    twitter: "https://twitter.com/mordesu",
    github: "https://github.com/mordesu",
    linkedin: "https://linkedin.com/company/mordesu",
    instagram: "https://instagram.com/mordesu",
    facebook: "https://www.facebook.com/profile.php?id=61562686209159",
    whatsapp: "https://wa.me/201023005622",
  },
  contact: {
    email: "hello@mordesu.com",
    phone: "+20 102 300 5622",
    address: "Palestine",
  },
  creator: "Mordesu Studio",
} as const;

export type SiteConfig = typeof siteConfig;
