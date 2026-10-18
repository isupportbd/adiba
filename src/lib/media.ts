/**
 * Media URL helpers + the /api/media proxy contract.
 *
 * Two kinds of keys exist:
 *  - "local:/images/sample/photo-1.svg" → a placeholder bundled in /public
 *    (used by the seed script so the site works with zero setup).
 *  - "memories/<uuid>/photo.jpg"        → an object stored in MinIO,
 *    streamed through /api/media/<key> so private media stays gated.
 */
import type { MediaVM } from "./types";

const LOCAL_PREFIX = "local:";

export function isLocalKey(key: string): boolean {
  return key.startsWith(LOCAL_PREFIX);
}

export function mediaSrc(key: string): string {
  if (isLocalKey(key)) return key.slice(LOCAL_PREFIX.length);
  return "/api/media/" + key.split("/").map(encodeURIComponent).join("/");
}

type MediaRow = {
  id: string;
  kind: "image" | "video" | "audio";
  storageKey: string;
  captionsKey?: string | null;
  altText?: string | null;
  caption?: string | null;
  takenOn?: string | null;
  isPrivate: boolean;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
};

export function toMediaVM(row: MediaRow): MediaVM {
  return {
    id: row.id,
    kind: row.kind,
    src: mediaSrc(row.storageKey),
    captionsSrc: row.captionsKey ? mediaSrc(row.captionsKey) : undefined,
    alt: row.altText?.trim() || "পরিবারের আপনাদের জন্য রাখা ছবি",
    caption: row.caption ?? undefined,
    takenOn: row.takenOn ?? undefined,
    isPrivate: row.isPrivate,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    bytes: row.bytes ?? undefined,
  };
}
