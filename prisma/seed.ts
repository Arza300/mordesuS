import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const seedProjects = [
  {
    id: "aurora-commerce",
    title: "Aurora Commerce",
    client: "Aurora",
    category: "E-commerce Platform",
    description:
      "A conversion-focused storefront with fluid product storytelling and sub-second interactions.",
    year: "2025",
    imageUrl: "/projects/aurora.svg",
    imageAlt: "Aurora Commerce abstract preview",
    href: "#contact",
    published: true,
    sortOrder: 0,
  },
  {
    id: "nova-analytics",
    title: "Nova Analytics",
    client: "Nova",
    category: "SaaS Dashboard",
    description:
      "Real-time insight surfaces with immersive data visualization and calm, confident UI.",
    year: "2025",
    imageUrl: "/projects/nova.svg",
    imageAlt: "Nova Analytics abstract preview",
    href: "#contact",
    published: true,
    sortOrder: 1,
  },
  {
    id: "lumen-brand",
    title: "Lumen Identity",
    client: "Lumen",
    category: "Brand Experience",
    description:
      "An immersive brand site with WebGL atmospheres and editorial typography.",
    year: "2024",
    imageUrl: "/projects/lumen.svg",
    imageAlt: "Lumen Identity abstract preview",
    href: "#contact",
    published: true,
    sortOrder: 2,
  },
  {
    id: "pulse-platform",
    title: "Pulse Platform",
    client: "Pulse",
    category: "Product Engineering",
    description:
      "End-to-end product build — auth, billing, dashboards — shipped with studio-grade polish.",
    year: "2024",
    imageUrl: "/projects/pulse.svg",
    imageAlt: "Pulse Platform abstract preview",
    href: "#contact",
    published: true,
    sortOrder: 3,
  },
];

async function main() {
  for (const project of seedProjects) {
    await prisma.project.upsert({
      where: { id: project.id },
      create: project,
      update: {
        title: project.title,
        client: project.client,
        category: project.category,
        description: project.description,
        year: project.year,
        imageUrl: project.imageUrl,
        imageAlt: project.imageAlt,
        href: project.href,
        published: project.published,
        sortOrder: project.sortOrder,
      },
    });
  }

  console.log(`Seeded ${seedProjects.length} projects`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
