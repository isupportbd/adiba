/**
 * Server-side upload handling: browser File → MinIO object (+ metadata).
 * Uses sharp to read image dimensions so next/image can size properly.
 */
import sharp from "sharp";
import { newKey, putObject } from "./s3";

export type UploadedFile = {
  key: string;
  mimeType: string;
  bytes: number;
  kind: "image" | "video" | "audio";
  width?: number;
  height?: number;
};

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "audio/mpeg",
  "audio/mp4",
  "audio/webm",
  "text/vtt",
]);

export class UploadError extends Error {}

function maxBytes(): number {
  return (Number(process.env.MAX_UPLOAD_MB) || 200) * 1024 * 1024;
}

function kindOf(mime: string): UploadedFile["kind"] {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "image";
}

/** Stores one file in MinIO under `folder/`. Throws UploadError with a Bengali message. */
export async function storeUpload(folder: string, file: File): Promise<UploadedFile> {
  if (!file || file.size === 0) throw new UploadError("ফাইলটি পাওয়া যায়নি।");
  if (!ALLOWED.has(file.type)) {
    throw new UploadError(`এই ধরনের ফাইল সমর্থিত নয়: ${file.type || "unknown"}`);
  }
  if (file.size > maxBytes()) {
    throw new UploadError(
      `ফাইলটি খুব বড় (সর্বোচ্চ ${(maxBytes() / 1024 / 1024).toFixed(0)} MB অনুমোদিত)।`,
    );
  }

  const buf = new Uint8Array(await file.arrayBuffer());
  const key = newKey(folder, file.name);
  await putObject(key, buf, file.type);

  let width: number | undefined;
  let height: number | undefined;
  if (file.type.startsWith("image/") && !file.name.toLowerCase().endsWith(".svg")) {
    try {
      const meta = await sharp(buf).metadata();
      width = meta.width;
      height = meta.height;
    } catch {
      /* dimensions optional */
    }
  }

  return { key, mimeType: file.type, bytes: buf.byteLength, kind: kindOf(file.type), width, height };
}

export type MediaInput = {
  file: UploadedFile;
  altText: string;
  caption?: string;
  takenOn?: string;
  isPrivate: boolean;
  sortOrder: number;
  captionsKey?: string;
};

/**
 * Splits FormData files into media + caption (.vtt) files.
 * Captions are matched to videos in the order they were picked.
 */
export function splitUploads(files: File[]): { media: File[]; captions: File[] } {
  const media: File[] = [];
  const captions: File[] = [];
  for (const f of files) {
    if (f.name.toLowerCase().endsWith(".vtt") || f.type === "text/vtt") captions.push(f);
    else media.push(f);
  }
  return { media, captions };
}

export function readFiles(formData: FormData, field: string): File[] {
  return formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
}
