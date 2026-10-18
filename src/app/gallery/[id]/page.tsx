import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaGrid } from "@/components/media-grid";
import { SampleBanner } from "@/components/sample-banner";
import { canViewPrivate } from "@/lib/auth";
import { t, type TranslationKey } from "@/lib/i18n";
import { getAlbum } from "@/lib/queries";

export const metadata: Metadata = { title: "অ্যালবাম" };

export default async function AlbumPage({ params }: { params: { id: string } }) {
  const [album, includePrivate] = await Promise.all([
    getAlbum(params.id),
    canViewPrivate(),
  ]);
  if (!album || (album.isPrivate && !includePrivate)) notFound();

  return (
    <div>
      <SampleBanner />

      <p className="mb-3">
        <Link href="/gallery" className="text-sm font-semibold text-blush-600 hover:underline">
          ← {t("nav.gallery")}
        </Link>
      </p>

      <header className="mb-6">
        <h1 className="mb-2 section-title">{album.title}</h1>
        <p className="text-sm text-ink-500">
          {album.eventName ? `${album.eventName} · ` : ""}
          {t(`gallery.bucket.${album.ageBucket}` as TranslationKey)} · {album.mediaCount}{" "}
          {t("common.mediaCount")}
          {album.isPrivate ? ` · 🔒 ${t("common.private")}` : ""}
        </p>
        {album.description ? (
          <p className="mt-3 max-w-2xl leading-7 text-ink-700">{album.description}</p>
        ) : null}
      </header>

      <MediaGrid media={album.media} label={album.title} columns={3} />
    </div>
  );
}
