import "server-only";

import { DEFAULT_XP_FILES } from "@/data/xp-file-defaults";
import { prisma } from "@/lib/prisma";
import {
  normalizeXpIcon,
  XP_FILE_CATEGORY,
  type XpFileData,
} from "@/types/xp-file";

export { DEFAULT_XP_FILES, XP_FILE_CATEGORY };

function projectIdForSlug(slug: string) {
  return `xp-${slug}`;
}

function mapProject(row: {
  id: string;
  title: string;
  client: string;
  description: string | null;
  year: string | null;
  imageAlt: string;
  sortOrder: number;
}): XpFileData {
  return {
    id: row.id,
    slug: row.client,
    name: row.title,
    lang: row.year?.trim() || "Text",
    content: row.description ?? "",
    icon: normalizeXpIcon(row.imageAlt),
    sortOrder: row.sortOrder,
  };
}

/** Public read for the XP desktop easter egg. */
export async function getXpFiles(): Promise<XpFileData[]> {
  try {
    const rows = await prisma.project.findMany({
      where: { category: XP_FILE_CATEGORY },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length === 0) {
      return DEFAULT_XP_FILES.map((f, i) => ({
        ...f,
        id: `fallback-${i}`,
      }));
    }
    return rows.map(mapProject);
  } catch {
    return DEFAULT_XP_FILES.map((f, i) => ({
      ...f,
      id: `fallback-${i}`,
    }));
  }
}

export async function getXpFilesAdmin(): Promise<XpFileData[]> {
  const rows = await prisma.project.findMany({
    where: { category: XP_FILE_CATEGORY },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(mapProject);
}

export async function ensureDefaultXpFiles() {
  for (const file of DEFAULT_XP_FILES) {
    const id = projectIdForSlug(file.slug);
    await prisma.project.upsert({
      where: { id },
      create: {
        id,
        title: file.name,
        client: file.slug,
        category: XP_FILE_CATEGORY,
        description: file.content,
        year: file.lang,
        imageUrl: "xp-file",
        imageAlt: file.icon,
        href: null,
        published: false,
        sortOrder: file.sortOrder,
      },
      update: {},
    });
  }
}

export function buildXpFileCreateData(input: {
  name: string;
  lang: string;
  content: string;
  icon: string;
  sortOrder: number;
  slug: string;
}) {
  return {
    id: projectIdForSlug(input.slug),
    title: input.name,
    client: input.slug,
    category: XP_FILE_CATEGORY,
    description: input.content,
    year: input.lang,
    imageUrl: "xp-file",
    imageAlt: input.icon,
    href: null,
    published: false,
    sortOrder: input.sortOrder,
  };
}

export function buildXpFileUpdateData(input: {
  name: string;
  lang: string;
  content: string;
  icon: string;
  sortOrder: number;
}) {
  return {
    title: input.name,
    description: input.content,
    year: input.lang,
    imageAlt: input.icon,
    sortOrder: input.sortOrder,
  };
}
