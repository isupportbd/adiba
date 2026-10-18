"use client";

/**
 * Grid of photo/video thumbnails. Clicking one opens the accessible
 * lightbox. Used by memory cards, milestone entries and album pages.
 */
import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "@/components/lightbox";
import type { MediaVM } from "@/lib/types";

export function MediaGrid({
  media,
  label,
  columns = 2,
}: {
  media: MediaVM[];
  label: string;
  columns?: 2 | 3;
}) {
  const [open, setOpen] = useState<number | null>(null);

  if (media.length === 0) return null;

  return (
    <>
      <ul
        className={`grid gap-3 ${columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}
      >
        {media.map((m, i) => (
          <li key={m.id} className={i === 0 && media.length > 1 ? "col-span-2" : ""}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group relative block w-full overflow-hidden rounded-2xl focus-visible:ring-2 focus-visible:ring-blush-400"
              aria-label={`${label}: ${m.alt}`}
            >
              <Image
                src={m.src}
                alt={m.alt}
                width={800}
                height={600}
                sizes="(max-width: 640px) 90vw, 45vw"
                className="aspect-[4/3] w-full bg-cream-100 object-cover transition-transform duration-200 group-hover:scale-[1.02]"
              />
              {m.kind === "video" ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center bg-ink-900/25"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-blush-600 shadow-soft">
                    ▶
                  </span>
                </span>
              ) : null}
              {m.isPrivate ? (
                <span className="absolute left-2 top-2 chip-private bg-white/90">🔒</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      {open !== null ? (
        <Lightbox
          items={media}
          startIndex={open}
          onClose={() => setOpen(null)}
          label={label}
        />
      ) : null}
    </>
  );
}
