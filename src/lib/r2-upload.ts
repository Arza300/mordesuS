import "server-only";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

import { r2, r2Config } from "@/lib/r2";

const PROJECT_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const XP_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
]);

const XP_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
]);

export type XpMediaKind = "image" | "video";

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
    case "image/bmp":
      return "bmp";
    case "image/svg+xml":
      return "svg";
    case "video/mp4":
      return "mp4";
    case "video/webm":
      return "webm";
    case "video/ogg":
      return "ogv";
    case "video/quicktime":
      return "mov";
    case "video/x-msvideo":
      return "avi";
    case "video/x-matroska":
      return "mkv";
    default:
      return "bin";
  }
}

function publicUrlForKey(key: string) {
  const base = r2Config.publicUrl.replace(/\/$/, "");
  return `${base}/${key}`;
}

/**
 * Upload a project image to R2 and return its public URL.
 */
export async function uploadProjectImage(file: File): Promise<string> {
  if (!PROJECT_IMAGE_TYPES.has(file.type)) {
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

  return publicUrlForKey(key);
}

/**
 * Create a presigned PUT URL so the browser can upload large XP media
 * straight to R2 (no Next.js body size limit).
 */
export async function createXpMediaUploadUrl(input: {
  kind: XpMediaKind;
  contentType: string;
  filename: string;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const allowed = input.kind === "image" ? XP_IMAGE_TYPES : XP_VIDEO_TYPES;

  if (!allowed.has(input.contentType)) {
    throw new Error(
      input.kind === "image"
        ? "Unsupported image type. Use JPEG, PNG, WebP, GIF, BMP, or SVG."
        : "Unsupported video type. Use MP4, WebM, OGG, MOV, AVI, or MKV.",
    );
  }

  const ext = extensionFor(input.contentType, input.filename);
  const key = `xp/${input.kind}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: r2Config.bucket,
    Key: key,
    ContentType: input.contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 60 * 60 });

  return {
    uploadUrl,
    publicUrl: publicUrlForKey(key),
    key,
  };
}
