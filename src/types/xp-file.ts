export const XP_ICON_IDS = [
  "html",
  "css",
  "js",
  "txt",
  "image",
  "photo",
  "video",
  "film",
  "code",
  "doc",
  "music",
] as const;

export type XpIconId = (typeof XP_ICON_IDS)[number];

/** Reserved Project.category — excluded from portfolio listings. */
export const XP_FILE_CATEGORY = "__xp_file__";

/** Stored in Project.imageUrl for XP file rows (optionally `base||bcryptHash`). */
export const XP_FILE_IMAGE_URL = "xp-file";
export const XP_FILE_LINK_IMAGE_URL = "xp-file-link";
export const XP_FILE_MEDIA_IMAGE_URL = "xp-file-image";
export const XP_FILE_VIDEO_IMAGE_URL = "xp-file-video";

const XP_PIN_SEP = "||";

export const XP_OPEN_MODES = ["script", "link", "image", "video"] as const;
export type XpOpenMode = (typeof XP_OPEN_MODES)[number];

export type XpFileData = {
  id: string;
  slug: string;
  name: string;
  lang: string;
  content: string;
  icon: XpIconId;
  sortOrder: number;
  /** URL for link / image / video modes. */
  href: string | null;
  openMode: XpOpenMode;
  /** True when a numeric unlock PIN is set (PIN itself is never sent to the client). */
  locked: boolean;
};

export function isXpIconId(value: string): value is XpIconId {
  return (XP_ICON_IDS as readonly string[]).includes(value);
}

export function normalizeXpIcon(value: string): XpIconId {
  return isXpIconId(value) ? value : "txt";
}

function modeToken(mode: XpOpenMode): string {
  switch (mode) {
    case "link":
      return XP_FILE_LINK_IMAGE_URL;
    case "image":
      return XP_FILE_MEDIA_IMAGE_URL;
    case "video":
      return XP_FILE_VIDEO_IMAGE_URL;
    default:
      return XP_FILE_IMAGE_URL;
  }
}

export function imageUrlForOpenMode(
  mode: XpOpenMode,
  pinHash?: string | null,
): string {
  const base = modeToken(mode);
  return pinHash ? `${base}${XP_PIN_SEP}${pinHash}` : base;
}

export function openModeFromImageUrl(imageUrl: string): XpOpenMode {
  const base = imageUrl.split(XP_PIN_SEP)[0] ?? imageUrl;
  switch (base) {
    case XP_FILE_LINK_IMAGE_URL:
      return "link";
    case XP_FILE_MEDIA_IMAGE_URL:
      return "image";
    case XP_FILE_VIDEO_IMAGE_URL:
      return "video";
    default:
      return "script";
  }
}

export function pinHashFromImageUrl(imageUrl: string): string | null {
  const sep = imageUrl.indexOf(XP_PIN_SEP);
  if (sep === -1) return null;
  const hash = imageUrl.slice(sep + XP_PIN_SEP.length);
  return hash.length > 0 ? hash : null;
}

export function openModeNeedsHref(mode: XpOpenMode): boolean {
  return mode === "link" || mode === "image" || mode === "video";
}
