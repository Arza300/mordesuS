import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 does not auto-load .env. Load the project-root .env explicitly
 * so CLI commands always use the same file regardless of cwd.
 */
const rootDir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.join(rootDir, ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Direct (non-pooled) URL required for migrate / db push
    url: env("DIRECT_URL"),
  },
});
