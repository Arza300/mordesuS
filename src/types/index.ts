import type { Role } from "@/generated/prisma";

/**
 * Shared domain types live here.
 * Prefer colocating feature-specific types near their modules when possible.
 */

export type ApiResult<T> =
  { success: true; data: T } | { success: false; error: string };

export type UserRole = Role;

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
