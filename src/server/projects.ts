import "server-only";

import { prisma } from "@/lib/prisma";
import type { PublishedProject } from "@/types/project";

export type { PublishedProject };

export async function getPublishedProjects(): Promise<PublishedProject[]> {
  return prisma.project.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      client: true,
      category: true,
      description: true,
      year: true,
      imageUrl: true,
      imageAlt: true,
      href: true,
      sortOrder: true,
    },
  });
}

export async function getAllProjectsAdmin() {
  return prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({ where: { id } });
}
