import "server-only";

import { prisma } from "@/lib/prisma";
import type { PublishedProject } from "@/types/project";
import { XP_FILE_CATEGORY } from "@/types/xp-file";

export type { PublishedProject };

export async function getPublishedProjects(): Promise<PublishedProject[]> {
  return prisma.project.findMany({
    where: {
      published: true,
      category: { not: XP_FILE_CATEGORY },
    },
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
    where: { category: { not: XP_FILE_CATEGORY } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findFirst({
    where: { id, category: { not: XP_FILE_CATEGORY } },
  });
}
