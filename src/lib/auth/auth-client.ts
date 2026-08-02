import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: ["ADMIN", "USER"],
        },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
