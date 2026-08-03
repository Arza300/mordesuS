import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { env } from "@/env";
import { getTrustedOrigins } from "@/lib/auth/origins";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: getTrustedOrigins(),
  advanced: {
    // Always secure cookies in production so browsers accept them over HTTPS
    useSecureCookies:
      env.NODE_ENV === "production" ||
      env.BETTER_AUTH_URL.startsWith("https://"),
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    password: {
      hash: hashPassword,
      verify: async ({ password, hash }) => verifyPassword(password, hash),
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["ADMIN", "USER"],
        required: false,
        defaultValue: "USER",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: "USER",
            },
          };
        },
      },
    },
    account: {
      create: {
        after: async (account) => {
          // Mirror hashed credential onto User.password for the domain schema.
          if (account.password && account.userId) {
            await prisma.user.update({
              where: { id: account.userId },
              data: { password: account.password },
            });
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session["user"];
