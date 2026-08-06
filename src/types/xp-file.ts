export const XP_ICON_IDS = [
  "html",
  "css",
  "js",
  "txt",
  "image",
  "code",
  "doc",
  "music",
] as const;

export type XpIconId = (typeof XP_ICON_IDS)[number];

/** Reserved Project.category — excluded from portfolio listings. */
export const XP_FILE_CATEGORY = "__xp_file__";

/** Stored in Project.imageUrl for XP file rows. */
export const XP_FILE_IMAGE_URL = "xp-file";
export const XP_FILE_LINK_IMAGE_URL = "xp-file-link";

export const XP_OPEN_MODES = ["script", "link"] as const;
export type XpOpenMode = (typeof XP_OPEN_MODES)[number];

export type XpFileData = {
  id: string;
  slug: string;
  name: string;
  lang: string;
  content: string;
  icon: XpIconId;
  sortOrder: number;
  /** Optional external URL when openMode is "link". */
  href: string | null;
  /** "script" = show contents; "link" = embed href in the XP window. */
  openMode: XpOpenMode;
};

export function isXpIconId(value: string): value is XpIconId {
  return (XP_ICON_IDS as readonly string[]).includes(value);
}

export function normalizeXpIcon(value: string): XpIconId {
  return isXpIconId(value) ? value : "txt";
}

export function imageUrlForOpenMode(mode: XpOpenMode): string {
  return mode === "link" ? XP_FILE_LINK_IMAGE_URL : XP_FILE_IMAGE_URL;
}

export function openModeFromImageUrl(imageUrl: string): XpOpenMode {
  return imageUrl === XP_FILE_LINK_IMAGE_URL ? "link" : "script";
}
