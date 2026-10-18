import type { Metadata } from "next";
import Link from "next/link";
import { MemoryCard } from "@/components/memory-card";
import { SampleBanner } from "@/components/sample-banner";
import { canViewPrivate } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { getMemories } from "@/lib/queries";
import type { MemoryVM } from "@/lib/types";
import { cn, yearBn } from "@/lib/utils";

export const metadata: Metadata = { title: "স্মৃতিপথ" };

/**
 * Memory timeline.
 *
 * Filtering is done with plain links (?year=&tag=) — no client JS needed,
 * works with keyboards, and each filter combination is bookmarkable.
 * Reading searchParams makes this route dynamic; the home page stays SSG.
 */
export default async function TimelinePage({
  searchParams,
}: {
  searchParams: { year?: string; tag?: string };
}) {
  const [all, includePrivate] = await Promise.all([getMemories(), canViewPrivate()]);
  const visible = includePrivate ? all : all.filter((m) => !m.isPrivate);

  // Available facets, derived from the data itself.
  const years = Array.from(
    new Set(
      visible
        .map((m) => (m.occurredOn ? m.occurredOn.slice(0, 4) : ""))
        .filter((y): y is string => Boolean(y)),
    ),
  ).sort((a, b) => b.localeCompare(a));
  const tags = Array.from(new Set(visible.flatMap((m) => m.tags))).sort();

  const year = searchParams.year?.trim() || "";
  const tag = searchParams.tag?.trim() || "";
  const memories = visible.filter(
    (m) =>
      (!year || (m.occurredOn?.startsWith(year) ?? false)) &&
      (!tag || m.tags.includes(tag)),
  );

  return (
    <div>
      <SampleBanner />

      <header className="mb-6">
        <h1 className="mb-2 section-title">📖 {t("timeline.title")}</h1>
        <p className="text-ink-500">{t("timeline.subtitle")}</p>
      </header>

      <FilterBar
        title={t("timeline.filterYear")}
        items={years.map((y) => ({ value: y, label: yearBn(y), href: buildHref(y, tag) }))}
        active={year}
      />
      <FilterBar
        title={t("timeline.filterTag")}
        items={tags.map((tg) => ({ value: tg, label: `#${tg}`, href: buildHref(year, tg) }))}
        active={tag}
      />

      {memories.length === 0 ? (
        <p className="card p-6 text-ink-500">{t("timeline.noResults")}</p>
      ) : (
        <ol className="relative space-y-6 border-r-2 border-dashed border-blush-200 pr-4 sm:pr-8">
          {memories.map((m) => (
            <TimelineItem key={m.id} memory={m} />
          ))}
        </ol>
      )}
    </div>
  );
}

function buildHref(year: string, tag: string): string {
  const params = new URLSearchParams();
  if (year) params.set("year", year);
  if (tag) params.set("tag", tag);
  const qs = params.toString();
  return `/timeline${qs ? `?${qs}` : ""}`;
}

function FilterBar({
  title,
  items,
  active,
}: {
  title: string;
  items: { value: string; label: string; href: string }[];
  active: string;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title} className="mb-4">
      <h2 className="mb-2 text-sm font-semibold text-ink-500">{title}</h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isActive = item.value === active;
          const cleared = item.href.split("?")[1]
            ? (() => {
                const p = new URLSearchParams(item.href.split("?")[1]);
                p.delete(title.includes("বছর") ? "year" : "tag");
                const s = p.toString();
                return `/timeline${s ? `?${s}` : ""}`;
              })()
            : "/timeline";
          return (
            <li key={item.value}>
              <Link
                href={isActive ? cleared : item.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "chip px-3 py-1.5 transition-colors",
                  isActive
                    ? "border-blush-300 bg-blush-200 text-ink-900"
                    : "border-cream-300 bg-white/80 text-ink-700 hover:border-blush-200 hover:bg-blush-50",
                )}
              >
                {item.label}
                {isActive ? " ✕" : ""}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TimelineItem({ memory }: { memory: MemoryVM }) {
  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className="absolute -right-[1.35rem] top-6 h-3.5 w-3.5 rounded-full border-2 border-white bg-blush-300 shadow-soft sm:-right-[2.35rem]"
      />
      <MemoryCard memory={memory} />
    </li>
  );
}
