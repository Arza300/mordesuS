"use server";

import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { returnValidationErrors } from "next-safe-action";

import { actionClient } from "@/lib/safe-action";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/validators/auth";

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof APIError) {
    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export const registerAction = actionClient
  .inputSchema(registerSchema)
  .action(async ({ parsedInput }) => {
    const email = parsedInput.email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      returnValidationErrors(registerSchema, {
        email: {
          _errors: ["An account with this email already exists"],
        },
      });
    }

    try {
      await auth.api.signUpEmail({
        body: {
          name: parsedInput.name,
          email,
          password: parsedInput.password,
        },
      });

      return {
        success: true as const,
        message: "Account created successfully",
      };
    } catch (error) {
      const message = getAuthErrorMessage(
        error,
        "Unable to create your account. Please try again.",
      );

      if (/already|exists|unique/i.test(message)) {
        returnValidationErrors(registerSchema, {
          email: {
            _errors: ["An account with this email already exists"],
          },
        });
      }

      throw new Error(message);
    }
  });

export const loginAction = actionClient
  .inputSchema(loginSchema)
  .action(async ({ parsedInput }) => {
    try {
      await auth.api.signInEmail({
        body: {
          email: parsedInput.email.toLowerCase(),
          password: parsedInput.password,
        },
      });

      return {
        success: true as const,
        message: "Signed in successfully",
      };
    } catch (error) {
      throw new Error(getAuthErrorMessage(error, "Invalid email or password"));
    }
  });

export const logoutAction = actionClient.action(async () => {
  await auth.api.signOut({
    headers: await headers(),
  });

  return { success: true as const };
});
