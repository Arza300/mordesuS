export const siteConfig = {
  name: "Mordesu Studio",
  shortName: "Mordesu",
  description:
    "Mordesu Studio designs and builds high-performance web products for ambitious brands — blending cinematic craft with engineering precision.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og.svg",
  links: {
    twitter: "https://twitter.com/mordesu",
    github: "https://github.com/mordesu",
    linkedin: "https://linkedin.com/company/mordesu",
    instagram: "https://instagram.com/mordesu",
  },
  contact: {
    email: "hello@mordesu.com",
    phone: "+970 000 000 000",
    address: "Palestine",
  },
  creator: "Mordesu Studio",
} as const;

export type SiteConfig = typeof siteConfig;
