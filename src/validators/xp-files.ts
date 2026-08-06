import { z } from "zod";

import { XP_ICON_IDS } from "@/types/xp-file";

export const updateXpFileSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name is too long"),
  lang: z
    .string()
    .trim()
    .min(1, "Language is required")
    .max(40, "Language is too long"),
  content: z.string().max(100_000, "Content is too long"),
  icon: z.enum(XP_ICON_IDS),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export type UpdateXpFileInput = z.infer<typeof updateXpFileSchema>;

export const createXpFileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name is too long"),
  lang: z
    .string()
    .trim()
    .min(1, "Language is required")
    .max(40, "Language is too long")
    .default("Text"),
  content: z.string().max(100_000).default(""),
  icon: z.enum(XP_ICON_IDS).default("txt"),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export type CreateXpFileInput = z.infer<typeof createXpFileSchema>;

export const xpFileIdSchema = z.object({
  id: z.string().min(1),
});
