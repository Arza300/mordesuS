import { z } from "zod";

export const projectFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title is too long"),
  client: z
    .string()
    .trim()
    .min(1, "Client is required")
    .max(120, "Client is too long"),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(120, "Category is too long"),
  description: z.string().trim().max(2000, "Description is too long"),
  year: z.string().trim().max(16, "Year is too long"),
  imageUrl: z
    .string()
    .trim()
    .min(1, "Image URL is required")
    .max(2048, "Image URL is too long"),
  imageAlt: z
    .string()
    .trim()
    .min(1, "Image alt text is required")
    .max(200, "Image alt is too long"),
  href: z.string().trim().max(2048, "Link is too long"),
  sortOrder: z.number().int().min(0).max(9999),
  published: z.boolean(),
});

export const createProjectSchema = projectFormSchema;

export const updateProjectSchema = projectFormSchema.extend({
  id: z.string().min(1),
});

export const projectIdSchema = z.object({
  id: z.string().min(1),
});

export const togglePublishedSchema = z.object({
  id: z.string().min(1),
  published: z.boolean(),
});

export type ProjectFormInput = z.infer<typeof projectFormSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
