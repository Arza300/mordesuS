"use server";

import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { actionClient } from "@/lib/safe-action";
import { createXpMediaUploadUrl } from "@/lib/r2-upload";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/server/auth/session";
import {
  buildXpFileCreateData,
  buildXpFileUpdateData,
} from "@/server/xp-files";
import { pinHashFromImageUrl, XP_FILE_CATEGORY } from "@/types/xp-file";
import {
  createXpFileSchema,
  updateXpFileSchema,
  verifyXpFilePinSchema,
  xpFileIdSchema,
  xpMediaUploadSchema,
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
      select: { id: true, imageUrl: true },
    });

    if (!existing) {
      returnValidationErrors(updateXpFileSchema, {
        id: { _errors: ["File not found"] },
      });
    }

    let pinHash = pinHashFromImageUrl(existing.imageUrl);
    if (parsedInput.clearPin) {
      pinHash = null;
    } else if (parsedInput.pin) {
      pinHash = await hashPassword(parsedInput.pin);
    }

    await prisma.project.update({
      where: { id: parsedInput.id },
      data: buildXpFileUpdateData({
        ...parsedInput,
        pinHash,
      }),
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

/** Presigned R2 upload — browser PUTs the file directly (no size cap). */
export const createXpMediaUploadAction = actionClient
  .inputSchema(xpMediaUploadSchema)
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const result = await createXpMediaUploadUrl(parsedInput);
    return { success: true as const, ...result };
  });

/** Public unlock check for XP desktop (PIN never returned to the client). */
export const verifyXpFilePinAction = actionClient
  .inputSchema(verifyXpFilePinSchema)
  .action(async ({ parsedInput }) => {
    const file = await prisma.project.findFirst({
      where: { id: parsedInput.id, category: XP_FILE_CATEGORY },
      select: { imageUrl: true },
    });

    const hash = file ? pinHashFromImageUrl(file.imageUrl) : null;
    if (!hash) {
      return { success: true as const, unlocked: true as const };
    }

    const ok = await verifyPassword(parsedInput.pin, hash);
    if (!ok) {
      return { success: false as const, unlocked: false as const };
    }

    return { success: true as const, unlocked: true as const };
  });
