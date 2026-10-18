import { bn, type TranslationKey } from "./bn";
import { en } from "./en";

/** Active locale — Bengali is primary; set NEXT_PUBLIC_LOCALE=en for English. */
const locale = process.env.NEXT_PUBLIC_LOCALE === "en" ? "en" : "bn";

const dict: Record<TranslationKey, string> = { ...bn, ...en };

/** Translate a UI string: t("nav.home") → "হোম". */
export function t(key: TranslationKey): string {
  return dict[key] ?? bn[key] ?? key;
}

export type { TranslationKey };
export { bn };
