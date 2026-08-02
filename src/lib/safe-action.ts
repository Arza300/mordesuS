import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    console.error("[safe-action]", error);
    return error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";
  },
});
