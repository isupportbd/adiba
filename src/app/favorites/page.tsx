import type { Metadata } from "next";
import { SampleBanner } from "@/components/sample-banner";
import { t, type TranslationKey } from "@/lib/i18n";
import { getFavorites } from "@/lib/queries";
import type { FavoriteVM } from "@/lib/types";
import { formatDateBn } from "@/lib/utils";

export const metadata: Metadata = { title: "প্রিয় জিনিস" };

const ORDER: FavoriteVM["category"][] = ["toy", "food", "song", "cartoon", "book", "other"];
const EMOJI: Record<string, string> = {
  toy: "🧸",
  food: "🍌",
  song: "🎵",
  cartoon: "📺",
  book: "📚",
  other: "✨",
};

export default async function FavoritesPage() {
  const favorites = await getFavorites();

  return (
    <div>
      <SampleBanner />

      <header className="mb-8">
        <h1 className="mb-2 section-title">🎀 {t("favorites.title")}</h1>
        <p className="text-ink-500">{t("favorites.subtitle")}</p>
      </header>

      {favorites.length === 0 ? (
        <p className="card p-6 text-ink-500">{t("common.empty")}</p>
      ) : (
        <div className="space-y-8">
          {ORDER.filter((c) => favorites.some((f) => f.category === c)).map((category) => (
            <section key={category} aria-labelledby={`cat-${category}`}>
              <h2 id={`cat-${category}`} className="mb-3 text-lg font-semibold">
                <span aria-hidden="true">{EMOJI[category]}</span>{" "}
                {t(`favorites.category.${category}` as TranslationKey)}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {favorites
                  .filter((f) => f.category === category)
                  .map((f) => (
                    <li
                      key={f.id}
                      className={`card flex items-start justify-between gap-3 p-4 ${
                        f.isCurrent ? "" : "opacity-70"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-ink-900">{f.name}</p>
                        {f.note ? (
                          <p className="mt-0.5 text-sm text-ink-500">{f.note}</p>
                        ) : null}
                        {f.sinceOn ? (
                          <p className="mt-1 text-xs text-ink-300">
                            {t("favorites.since")}: {formatDateBn(f.sinceOn)}
                          </p>
                        ) : null}
                      </div>
                      {!f.isCurrent ? (
                        <span className="chip border-cream-300 bg-cream-50 text-ink-500">
                          {t("favorites.former")}
                        </span>
                      ) : (
                        <span aria-hidden="true" className="text-xl">
                          💛
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
