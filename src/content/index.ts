import { enContent } from "@/content/en";
import type { SiteContent } from "@/content/types";
import { defaultLocale, type Locale } from "@/i18n/config";

const dictionaries: Record<Locale, SiteContent | null> = {
  en: enContent,
  ar: null, // scaffold — Arabic content to be added later
};

export function getContent(locale: Locale = defaultLocale): SiteContent {
  return dictionaries[locale] ?? enContent;
}

export type { SiteContent } from "@/content/types";
export { enContent };
