import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SampleBanner } from "@/components/sample-banner";
import { canViewPrivate } from "@/lib/auth";
import { t, type TranslationKey } from "@/lib/i18n";
import { getAlbums } from "@/lib/queries";
import type { AlbumVM } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "ছবি–ভিডিও" };

const BUCKETS: AlbumVM["ageBucket"][] = ["0-6", "6-12", "1-3", "3+"];

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: { bucket?: string; event?: string };
}) {
  const [albums, includePrivate] = await Promise.all([getAlbums(), canViewPrivate()]);
  const visible = includePrivate ? albums : albums.filter((a) => !a.isPrivate);

  const bucket = (searchParams.bucket ?? "").trim();
  const event = (searchParams.event ?? "").trim();

  const events = Array.from(
    new Set(visible.map((a) => a.eventName).filter(Boolean)),
  ) as string[];

  const filtered = visible.filter(
    (a) => (!bucket || a.ageBucket === bucket) && (!event || a.eventName === event),
  );

  return (
    <div>
      <SampleBanner />

      <header className="mb-6">
        <h1 className="mb-2 section-title">🖼️ {t("gallery.title")}</h1>
        <p className="text-ink-500">{t("gallery.subtitle")}</p>
      </header>

      <section aria-label={t("gallery.filterBucket")} className="mb-4">
        <h2 className="mb-2 text-sm font-semibold text-ink-500">{t("gallery.filterBucket")}</h2>
        <ul className="flex flex-wrap gap-2">
          <GalleryChip label={t("common.all")} href={buildHref("", event)} active={!bucket} />
          {BUCKETS.map((b) => (
            <GalleryChip
              key={b}
              label={t(`gallery.bucket.${b}` as TranslationKey)}
              href={buildHref(b, event)}
              active={bucket === b}
            />
          ))}
        </ul>
      </section>

      {events.length > 0 ? (
        <section aria-label={t("gallery.filterEvent")} className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-ink-500">{t("gallery.filterEvent")}</h2>
          <ul className="flex flex-wrap gap-2">
            <GalleryChip label={t("common.all")} href={buildHref(bucket, "")} active={!event} />
            {events.map((ev) => (
              <GalleryChip
                key={ev}
                label={ev}
                href={buildHref(bucket, ev)}
                active={event === ev}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {filtered.length === 0 ? (
        <p className="card p-6 text-ink-500">{t("gallery.noAlbums")}</p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {filtered.map((album) => (
            <li key={album.id}>
              <Link
                href={`/gallery/${album.id}`}
                className="card group block overflow-hidden transition-shadow hover:shadow-lift"
              >
                <div className="relative aspect-[4/3] w-full bg-cream-100">
                  <Image
                    src={album.cover?.src ?? "/images/placeholder.svg"}
                    alt={album.cover?.alt ?? album.title}
                    width={800}
                    height={600}
                    sizes="(max-width: 640px) 90vw, 45vw"
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                  <span className="absolute left-3 top-3 chip-static bg-white/90">
                    {t(`gallery.bucket.${album.ageBucket}` as TranslationKey)}
                  </span>
                </div>
                <div className="p-4">
                  <h2 className="mb-1 text-lg font-semibold">{album.title}</h2>
                  <p className="text-sm text-ink-500">
                    {album.eventName ? `${album.eventName} · ` : ""}
                    {album.mediaCount} {t("common.mediaCount")}
                    {album.isPrivate ? ` · 🔒 ${t("common.privateShort")}` : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function buildHref(bucket: string, event: string): string {
  const params = new URLSearchParams();
  if (bucket) params.set("bucket", bucket);
  if (event) params.set("event", event);
  const qs = params.toString();
  return `/gallery${qs ? `?${qs}` : ""}`;
}

function GalleryChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "true" : undefined}
        className={cn(
          "chip px-3 py-1.5",
          active
            ? "border-blush-300 bg-blush-200 text-ink-900"
            : "border-cream-300 bg-white/80 text-ink-700 hover:border-blush-200 hover:bg-blush-50",
        )}
      >
        {label}
      </Link>
    </li>
  );
}
