import "server-only";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

import { r2, r2Config } from "@/lib/r2";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

function extensionFor(type: string, filename: string) {
  const fromName = filename.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    default:
      return "bin";
  }
}

/**
 * Upload a project image to R2 and return its public URL.
 */
export async function uploadProjectImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(
      "Unsupported image type. Use JPEG, PNG, WebP, GIF, or SVG.",
    );
  }

  const ext = extensionFor(file.type, file.name);
  const key = `projects/${randomUUID()}.${ext}`;
  const body = Buffer.from(await file.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: r2Config.bucket,
      Key: key,
      Body: body,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  const base = r2Config.publicUrl.replace(/\/$/, "");
  return `${base}/${key}`;
}
