"use server";

import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";

import { actionClient } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { uploadProjectImage } from "@/lib/r2-upload";
import { assertAdmin } from "@/server/auth/session";
import {
  createProjectSchema,
  projectIdSchema,
  togglePublishedSchema,
  updateProjectSchema,
} from "@/validators/projects";
import { XP_FILE_CATEGORY } from "@/types/xp-file";

function emptyToNull(value: string | undefined) {
  if (!value || value.trim() === "") return null;
  return value.trim();
}

async function findPortfolioProject(id: string) {
  return prisma.project.findFirst({
    where: { id, category: { not: XP_FILE_CATEGORY } },
    select: { id: true },
  });
}

export const createProjectAction = actionClient
  .inputSchema(createProjectSchema)
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    if (parsedInput.category === XP_FILE_CATEGORY) {
      returnValidationErrors(createProjectSchema, {
        category: { _errors: ["Reserved category"] },
      });
    }

    const project = await prisma.project.create({
      data: {
        title: parsedInput.title,
        client: parsedInput.client,
        category: parsedInput.category,
        description: emptyToNull(parsedInput.description),
        year: emptyToNull(parsedInput.year),
        imageUrl: parsedInput.imageUrl,
        imageAlt: parsedInput.imageAlt,
        href: emptyToNull(parsedInput.href),
        sortOrder: parsedInput.sortOrder,
        published: parsedInput.published,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/projects");

    return { success: true as const, id: project.id };
  });

export const updateProjectAction = actionClient
  .inputSchema(updateProjectSchema)
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    if (parsedInput.category === XP_FILE_CATEGORY) {
      returnValidationErrors(updateProjectSchema, {
        category: { _errors: ["Reserved category"] },
      });
    }

    const existing = await findPortfolioProject(parsedInput.id);

    if (!existing) {
      returnValidationErrors(updateProjectSchema, {
        id: { _errors: ["Project not found"] },
      });
    }

    await prisma.project.update({
      where: { id: parsedInput.id },
      data: {
        title: parsedInput.title,
        client: parsedInput.client,
        category: parsedInput.category,
        description: emptyToNull(parsedInput.description),
        year: emptyToNull(parsedInput.year),
        imageUrl: parsedInput.imageUrl,
        imageAlt: parsedInput.imageAlt,
        href: emptyToNull(parsedInput.href),
        sortOrder: parsedInput.sortOrder,
        published: parsedInput.published,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${parsedInput.id}`);

    return { success: true as const, id: parsedInput.id };
  });

export const deleteProjectAction = actionClient
  .inputSchema(projectIdSchema)
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const existing = await findPortfolioProject(parsedInput.id);

    if (!existing) {
      returnValidationErrors(projectIdSchema, {
        id: { _errors: ["Project not found"] },
      });
    }

    await prisma.project.delete({ where: { id: parsedInput.id } });

    revalidatePath("/");
    revalidatePath("/admin/projects");

    return { success: true as const };
  });

export const toggleProjectPublishedAction = actionClient
  .inputSchema(togglePublishedSchema)
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const existing = await findPortfolioProject(parsedInput.id);

    if (!existing) {
      returnValidationErrors(togglePublishedSchema, {
        id: { _errors: ["Project not found"] },
      });
    }

    await prisma.project.update({
      where: { id: parsedInput.id },
      data: { published: parsedInput.published },
    });

    revalidatePath("/");
    revalidatePath("/admin/projects");

    return { success: true as const };
  });

/**
 * FormData upload for admin image input.
 */
export async function uploadProjectImageFormAction(formData: FormData) {
  await assertAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an image file to upload.");
  }

  const url = await uploadProjectImage(file);
  return { success: true as const, url };
}
