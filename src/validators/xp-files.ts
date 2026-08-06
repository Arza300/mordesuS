import { z } from "zod";

import { XP_ICON_IDS, XP_OPEN_MODES } from "@/types/xp-file";

const hrefField = z
  .string()
  .trim()
  .max(2048, "Link is too long")
  .nullish()
  .transform((value) => (value && value.length > 0 ? value : null));

export const updateXpFileSchema = z
  .object({
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
    href: hrefField,
    openMode: z.enum(XP_OPEN_MODES).default("script"),
  })
  .superRefine((data, ctx) => {
    if (data.openMode === "link" && !data.href) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Link is required for direct link mode",
        path: ["href"],
      });
    }
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
  href: hrefField,
  openMode: z.enum(XP_OPEN_MODES).default("script"),
});

export type CreateXpFileInput = z.infer<typeof createXpFileSchema>;

export const xpFileIdSchema = z.object({
  id: z.string().min(1),
});
