import Image from "next/image";
import { MediaGrid } from "@/components/media-grid";
import { formatDateBn, yearBn } from "@/lib/utils";
import type { MemoryVM } from "@/lib/types";
import { t } from "@/lib/i18n";

/** One memory on the timeline / home page. */
export function MemoryCard({ memory }: { memory: MemoryVM }) {
  return (
    <article className="card p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {memory.occurredOn ? (
          <time
            dateTime={memory.occurredOn}
            className="chip border-blush-200 bg-blush-50 text-blush-600"
          >
            📅 {formatDateBn(memory.occurredOn)}
          </time>
        ) : (
          <span className="chip border-cream-300 bg-cream-50 text-ink-500">
            {t("common.unknownDate")}
          </span>
        )}
        {memory.isPrivate ? <span className="chip-private">🔒 {t("common.private")}</span> : null}
        {memory.tags.map((tag) => (
          <span key={tag} className="chip-static">
            #{tag}
          </span>
        ))}
      </div>

      <h3 className="mb-2 text-xl font-semibold">{memory.title}</h3>

      {memory.story ? (
        <p className="mb-4 whitespace-pre-line leading-7 text-ink-700">{memory.story}</p>
      ) : null}

      <MediaGrid media={memory.media} label={memory.title} />
    </article>
  );
}

/** Compact card for the home page's "recent memories" row. */
export function MemoryTeaser({ memory }: { memory: MemoryVM }) {
  const cover = memory.media.find((m) => m.kind === "image") ?? memory.media[0];
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      {cover ? (
        <div className="relative aspect-[4/3] w-full bg-cream-100">
          <Image
            src={cover.src}
            alt={cover.alt}
            width={640}
            height={480}
            sizes="(max-width: 640px) 90vw, 33vw"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-cream-50 text-4xl">
          🌷
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-xs font-medium text-blush-600">
          {memory.occurredOn ? formatDateBn(memory.occurredOn) : t("common.unknownDate")}
          {memory.isPrivate ? ` · 🔒 ${t("common.privateShort")}` : ""}
        </p>
        <h3 className="mb-1 text-lg font-semibold leading-snug">{memory.title}</h3>
        {memory.story ? (
          <p className="line-clamp-3 text-sm leading-6 text-ink-500">{memory.story}</p>
        ) : null}
        <p className="mt-auto pt-3 text-xs text-ink-300">
          {yearBn(memory.occurredOn) ? `${yearBn(memory.occurredOn)} সাল` : ""}
        </p>
      </div>
    </article>
  );
}
