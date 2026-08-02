export const siteConfig = {
  name: "Mordesu Studio",
  description:
    "Software development studio specializing in modern web applications, product engineering, and scalable systems.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og.png",
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
