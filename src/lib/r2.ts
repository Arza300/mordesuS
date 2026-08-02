import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

import { env } from "@/env";

const globalForR2 = globalThis as unknown as {
  r2: S3Client | undefined;
};

function createR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Cloudflare R2 client (S3-compatible).
 * Ready for future upload/download services — no upload logic here.
 */
export const r2 = globalForR2.r2 ?? createR2Client();

export const r2Config = {
  bucket: env.R2_BUCKET,
  publicUrl: env.R2_PUBLIC_URL,
  accountId: env.R2_ACCOUNT_ID,
} as const;

if (env.NODE_ENV !== "production") {
  globalForR2.r2 = r2;
}
