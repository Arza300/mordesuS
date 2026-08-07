/**
 * Resolve share links (esp. Google Drive) into something a browser can play/show.
 */

function tryParseUrl(raw: string): URL | null {
  try {
    return new URL(raw.trim());
  } catch {
    return null;
  }
}

export function extractGoogleDriveFileId(raw: string): string | null {
  const url = tryParseUrl(raw);
  if (!url) return null;

  const host = url.hostname.toLowerCase();
  if (!host.endsWith("drive.google.com") && !host.endsWith("docs.google.com")) {
    return null;
  }

  const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
  if (fileMatch?.[1]) return fileMatch[1];

  const openMatch = url.pathname.match(/\/open\/?$/);
  if (openMatch) {
    const id = url.searchParams.get("id");
    if (id) return id;
  }

  const ucId = url.searchParams.get("id");
  if (
    ucId &&
    (url.pathname.includes("/uc") || url.searchParams.has("export"))
  ) {
    return ucId;
  }

  const foldersSkip = url.pathname.includes("/folders/");
  if (!foldersSkip) {
    const idParam = url.searchParams.get("id");
    if (idParam) return idParam;
  }

  return null;
}

export function isGoogleDriveUrl(raw: string): boolean {
  return extractGoogleDriveFileId(raw) !== null;
}

export type ResolvedMediaSource =
  | { kind: "native"; src: string }
  | { kind: "drive-embed"; src: string; fileId: string }
  | { kind: "drive-image"; src: string; fileId: string };

/** Turn a pasted URL into a playable/viewable source for XP media windows. */
export function resolveMediaSource(
  raw: string,
  media: "video" | "image",
): ResolvedMediaSource {
  const trimmed = raw.trim();
  const fileId = extractGoogleDriveFileId(trimmed);

  if (fileId) {
    if (media === "video") {
      return {
        kind: "drive-embed",
        fileId,
        src: `https://drive.google.com/file/d/${fileId}/preview`,
      };
    }
    return {
      kind: "drive-image",
      fileId,
      src: `https://drive.google.com/uc?export=view&id=${fileId}`,
    };
  }

  return { kind: "native", src: trimmed };
}
