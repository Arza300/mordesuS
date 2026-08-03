import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

/**
 * Omit baseURL so the client always talks to the current origin
 * (custom domain, www, or vercel.app) — avoids cross-origin cookie loss.
 */
export const authClient = createAuthClient({
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
