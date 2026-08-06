"use server";

import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";

import { actionClient } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/server/auth/session";
import {
  buildXpFileCreateData,
  buildXpFileUpdateData,
} from "@/server/xp-files";
import { XP_FILE_CATEGORY } from "@/types/xp-file";
import {
  createXpFileSchema,
  updateXpFileSchema,
  xpFileIdSchema,
} from "@/validators/xp-files";

function slugifyName(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "file"}-${Date.now().toString(36)}`;
}

export const updateXpFileAction = actionClient
  .inputSchema(updateXpFileSchema)
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const existing = await prisma.project.findFirst({
      where: { id: parsedInput.id, category: XP_FILE_CATEGORY },
      select: { id: true },
    });

    if (!existing) {
      returnValidationErrors(updateXpFileSchema, {
        id: { _errors: ["File not found"] },
      });
    }

    await prisma.project.update({
      where: { id: parsedInput.id },
      data: buildXpFileUpdateData(parsedInput),
    });

    revalidatePath("/");
    revalidatePath("/admin/xp-files");

    return { success: true as const };
  });

export const createXpFileAction = actionClient
  .inputSchema(createXpFileSchema)
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const slug = slugifyName(parsedInput.name);
    const file = await prisma.project.create({
      data: buildXpFileCreateData({
        ...parsedInput,
        slug,
      }),
    });

    revalidatePath("/");
    revalidatePath("/admin/xp-files");

    return { success: true as const, id: file.id };
  });

export const deleteXpFileAction = actionClient
  .inputSchema(xpFileIdSchema)
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const existing = await prisma.project.findFirst({
      where: { id: parsedInput.id, category: XP_FILE_CATEGORY },
      select: { id: true },
    });

    if (!existing) {
      returnValidationErrors(xpFileIdSchema, {
        id: { _errors: ["File not found"] },
      });
    }

    await prisma.project.delete({
      where: { id: parsedInput.id },
    });

    revalidatePath("/");
    revalidatePath("/admin/xp-files");

    return { success: true as const };
  });
