import "server-only";

import { DEFAULT_XP_FILES } from "@/data/xp-file-defaults";
import { prisma } from "@/lib/prisma";
import {
  imageUrlForOpenMode,
  normalizeXpIcon,
  openModeFromImageUrl,
  XP_FILE_CATEGORY,
  type XpFileData,
  type XpOpenMode,
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
  imageUrl: string;
  imageAlt: string;
  href: string | null;
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
    href: row.href?.trim() || null,
    openMode: openModeFromImageUrl(row.imageUrl),
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
        href: null,
        openMode: "script" as const,
      }));
    }
    return rows.map(mapProject);
  } catch {
    return DEFAULT_XP_FILES.map((f, i) => ({
      ...f,
      id: `fallback-${i}`,
      href: null,
      openMode: "script" as const,
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
  href?: string | null;
  openMode?: XpOpenMode;
}) {
  const openMode = input.openMode ?? "script";
  const href = input.href?.trim() || null;
  return {
    id: projectIdForSlug(input.slug),
    title: input.name,
    client: input.slug,
    category: XP_FILE_CATEGORY,
    description: input.content,
    year: input.lang,
    imageUrl: imageUrlForOpenMode(openMode),
    imageAlt: input.icon,
    href,
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
  href: string | null;
  openMode: XpOpenMode;
}) {
  return {
    title: input.name,
    description: input.content,
    year: input.lang,
    imageUrl: imageUrlForOpenMode(input.openMode),
    imageAlt: input.icon,
    href: input.href?.trim() || null,
    sortOrder: input.sortOrder,
  };
}
