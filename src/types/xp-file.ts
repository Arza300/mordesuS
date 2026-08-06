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

export type XpFileData = {
  id: string;
  slug: string;
  name: string;
  lang: string;
  content: string;
  icon: XpIconId;
  sortOrder: number;
};

export function isXpIconId(value: string): value is XpIconId {
  return (XP_ICON_IDS as readonly string[]).includes(value);
}

export function normalizeXpIcon(value: string): XpIconId {
  return isXpIconId(value) ? value : "txt";
}
