import type { Metadata } from "next";
import { SampleBanner } from "@/components/sample-banner";
import { canViewPrivate } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { getLetters } from "@/lib/queries";
import { formatDateBn } from "@/lib/utils";

export const metadata: Metadata = { title: "চিঠিপত্র" };

/**
 * Letters from family. Letters are private by default, so signed-out
 * visitors only see public ones (usually none) — middleware additionally
 * requires sign-in for this whole route.
 */
export default async function LettersPage() {
  const [letters, includePrivate] = await Promise.all([getLetters(), canViewPrivate()]);
  const visible = includePrivate ? letters : letters.filter((l) => !l.isPrivate);

  return (
    <div>
      <SampleBanner />

      <header className="mb-8">
        <h1 className="mb-2 section-title">💌 {t("letters.title")}</h1>
        <p className="text-ink-500">{t("letters.subtitle")}</p>
      </header>

      {visible.length === 0 ? (
        <p className="card p-6 text-ink-500">{t("letters.empty")}</p>
      ) : (
        <ul className="space-y-6">
          {visible.map((letter) => (
            <li
              key={letter.id}
              className="card relative overflow-hidden border-l-8 border-l-blush-200 p-6 sm:p-8"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-4 -top-4 text-7xl opacity-10"
              >
                ✉️
              </span>
              <h2 className="mb-1 text-xl font-semibold">{letter.title}</h2>
              <p className="mb-4 text-sm text-ink-500">
                {t("letters.from")}: <strong className="text-ink-700">{letter.authorName}</strong>
                {letter.relationship ? ` · ${letter.relationship}` : ""}
                {letter.writtenOn ? ` · ${formatDateBn(letter.writtenOn)}` : ""}
              </p>
              <p className="whitespace-pre-line leading-8 text-ink-700">{letter.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
