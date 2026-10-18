import Link from "next/link";
import Image from "next/image";
import { AgeBadge } from "@/components/age-badge";
import { Cloud, Flower, Star } from "@/components/doodles";
import { MemoryTeaser } from "@/components/memory-card";
import { SampleBanner } from "@/components/sample-banner";
import { t } from "@/lib/i18n";
import { getChildProfile, getRecentMemories } from "@/lib/queries";

/**
 * Home — SSG with ISR (revalidate every 5 minutes).
 * Database queries fall back to sample data if the DB is unreachable at
 * build time, and /api/revalidate + server actions refresh the cache
 * immediately after family members add content.
 */
export const revalidate = 300;

export default async function HomePage() {
  const [profile, memories] = await Promise.all([
    getChildProfile(),
    getRecentMemories(3),
  ]);

  const displayName = profile.nickname || profile.displayName || "প্রিয় মেয়ে";
  const featured = profile.featured;

  return (
    <div className="space-y-14">
      <SampleBanner />

      {/* ------------------------------------------------ hero */}
      <section className="relative overflow-hidden rounded-blob bg-gradient-to-br from-blush-50 via-cream-50 to-lavender-50 px-5 py-10 shadow-soft sm:px-10 sm:py-14">
        <Cloud className="pointer-events-none absolute -left-6 top-4 w-40 opacity-70" />
        <Star className="pointer-events-none absolute right-8 top-8 h-7 w-7" />
        <Star className="pointer-events-none absolute right-20 top-24 h-4 w-4 opacity-70" />
        <Flower className="pointer-events-none absolute bottom-6 right-6 h-10 w-10 opacity-60" />

        <div className="relative grid items-center gap-8 sm:grid-cols-[1fr_minmax(0,340px)]">
          <div>
            <p className="mb-2 text-sm font-semibold tracking-wide text-blush-600">
              {t("home.greeting")}
            </p>
            <h1 className="mb-3 text-4xl leading-tight sm:text-5xl">{displayName}</h1>
            {profile.displayName && profile.nickname ? (
              <p className="mb-4 text-ink-500">নাম — {profile.displayName}</p>
            ) : null}

            <div className="mb-6">
              <AgeBadge />
            </div>

            {profile.parentsMessage ? (
              <div className="rounded-3xl border border-white bg-white/70 p-5 shadow-soft">
                <h2 className="mb-2 text-base font-semibold text-blush-600">
                  💗 {t("home.parentsMessage")}
                </h2>
                <p className="whitespace-pre-line leading-7 text-ink-700">
                  {profile.parentsMessage}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mx-auto w-full max-w-[340px]">
            <div className="rotate-1 rounded-[2rem] border-[10px] border-white bg-white p-2 shadow-photo">
              <Image
                src={featured?.src ?? "/images/placeholder.svg"}
                alt={featured?.alt ?? t("home.featuredAlt")}
                width={680}
                height={850}
                priority
                sizes="(max-width: 640px) 90vw, 340px"
                className="aspect-[4/5] w-full rounded-2xl object-cover"
              />
            </div>
            <p className="mt-3 text-center text-xs text-ink-300">
              📸 {t("home.featuredAlt")}
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------- recent memories */}
      <section aria-labelledby="recent-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="recent-heading" className="section-title">
            🌼 {t("home.recentMemories")}
          </h2>
          <Link href="/timeline" className="text-sm font-semibold text-blush-600 hover:underline">
            {t("home.viewAll")} →
          </Link>
        </div>

        {memories.length === 0 ? (
          <p className="card p-6 text-ink-500">{t("common.empty")}</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {memories.map((m) => (
              <MemoryTeaser key={m.id} memory={m} />
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------ quick links */}
      <section aria-labelledby="explore-heading">
        <h2 id="explore-heading" className="section-title mb-5">
          ✨ আরও ঘুরে দেখুন
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <QuickLink href="/milestones" emoji="👣" title={t("nav.milestones")} note="যেসব মুহূর্ত সবকিছু বদলে দিয়েছে" tint="bg-mint-50 border-mint-200" />
          <QuickLink href="/gallery" emoji="🖼️" title={t("nav.gallery")} note="অ্যালবাম ধরে ছবি ও ভিডিও" tint="bg-lavender-50 border-lavender-200" />
          <QuickLink href="/letters" emoji="💌" title={t("nav.letters")} note="ভবিষ্যতে পড়ে মন ভরবে" tint="bg-blush-50 border-blush-200" />
          <QuickLink href="/favorites" emoji="🧸" title={t("nav.favorites")} note="এই মুহূর্তে যা সবচেয়ে ভালো" tint="bg-cream-50 border-cream-300" />
        </div>
      </section>
    </div>
  );
}

function QuickLink({
  href,
  emoji,
  title,
  note,
  tint,
}: {
  href: string;
  emoji: string;
  title: string;
  note: string;
  tint: string;
}) {
  return (
    <Link
      href={href}
      className={`card flex items-center gap-4 border p-5 transition-shadow hover:shadow-lift ${tint}`}
    >
      <span aria-hidden="true" className="text-3xl">
        {emoji}
      </span>
      <span>
        <span className="block font-semibold text-ink-900">{title}</span>
        <span className="block text-sm text-ink-500">{note}</span>
      </span>
    </Link>
  );
}
