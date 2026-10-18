import type { Metadata } from "next";
import { MediaGrid } from "@/components/media-grid";
import { SampleBanner } from "@/components/sample-banner";
import { canViewPrivate } from "@/lib/auth";
import { t, type TranslationKey } from "@/lib/i18n";
import { getMilestones } from "@/lib/queries";
import type { MilestoneVM } from "@/lib/types";
import { formatDateBn } from "@/lib/utils";

export const metadata: Metadata = { title: "প্রথম মুহূর্ত" };

const ICONS: Record<string, string> = {
  first_smile: "😊",
  first_crawl: "🐛",
  first_steps: "👣",
  first_word: "💬",
  first_tooth: "🦷",
  first_food: "🥣",
  first_birthday: "🎂",
  custom: "🌟",
};

export default async function MilestonesPage() {
  const [milestones, includePrivate] = await Promise.all([
    getMilestones(),
    canViewPrivate(),
  ]);
  const visible = includePrivate ? milestones : milestones.filter((m) => !m.isPrivate);

  return (
    <div>
      <SampleBanner />

      <header className="mb-8">
        <h1 className="mb-2 section-title">🌟 {t("milestones.title")}</h1>
        <p className="text-ink-500">{t("milestones.subtitle")}</p>
      </header>

      {visible.length === 0 ? (
        <p className="card p-6 text-ink-500">{t("common.empty")}</p>
      ) : (
        <ol className="space-y-6">
          {visible.map((m) => (
            <MilestoneItem key={m.id} milestone={m} />
          ))}
        </ol>
      )}
    </div>
  );
}

function typeLabel(m: MilestoneVM): string {
  return t(`milestones.${m.milestoneType}` as TranslationKey);
}

function MilestoneItem({ milestone: m }: { milestone: MilestoneVM }) {
  return (
    <li className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start gap-4">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-100 to-lavender-100 text-2xl"
        >
          {ICONS[m.milestoneType] ?? "🌟"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="chip border-mint-200 bg-mint-50 text-mint-700">{typeLabel(m)}</span>
            {m.occurredOn ? (
              <time dateTime={m.occurredOn} className="text-sm text-ink-500">
                📅 {formatDateBn(m.occurredOn)}
              </time>
            ) : (
              <span className="text-sm text-ink-300">{t("common.unknownDate")}</span>
            )}
            {m.isPrivate ? <span className="chip-private">🔒 {t("common.private")}</span> : null}
          </div>
          <h2 className="mb-2 text-xl font-semibold">{m.title}</h2>
          {m.description ? (
            <p className="mb-3 whitespace-pre-line leading-7 text-ink-700">{m.description}</p>
          ) : null}
          <MediaGrid media={m.media} label={m.title} columns={3} />
        </div>
      </div>
    </li>
  );
}
