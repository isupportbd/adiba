import { NextResponse } from "next/server";
import { getSessionOrNull } from "@/lib/auth";
import { findMediaByKey } from "@/lib/queries";
import { getObject } from "@/lib/s3";

export const dynamic = "force-dynamic";

/**
 * Media proxy: /api/media/<storage key>
 *
 * Every photo/video is streamed from MinIO through this route so that:
 *  • private media is only served to signed-in family members, and
 *  • the MinIO endpoint/credentials never appear in the browser.
 *
 * Supports HTTP Range requests so <video> can seek.
 */
export async function GET(
  request: Request,
  { params }: { params: { key: string[] } },
) {
  const key = params.key.map(decodeURIComponent).join("/");
  if (!key || key.includes("..")) {
    return NextResponse.json({ error: "bad key" }, { status: 400 });
  }

  // The key must correspond to a known media/captions row — this route is
  // NOT an open proxy to the whole bucket.
  const owner = await findMediaByKey(key);
  if (!owner) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (owner.is_private) {
    const session = await getSessionOrNull();
    if (!session?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const obj = await getObject(key, request.headers.get("range"));
    if (!obj.stream) return NextResponse.json({ error: "empty object" }, { status: 404 });

    const headers = new Headers({
      "Content-Type": obj.contentType ?? "application/octet-stream",
      "Accept-Ranges": obj.acceptRanges ?? "bytes",
      // Public media may be cached briefly at the CDN; private never is.
      "Cache-Control": owner.is_private ? "private, no-store" : "public, max-age=3600",
    });
    if (obj.contentLength) headers.set("Content-Length", String(obj.contentLength));
    if (obj.contentRange) headers.set("Content-Range", obj.contentRange);
    if (obj.etag) headers.set("ETag", obj.etag);

    return new Response(obj.stream as ReadableStream<Uint8Array>, {
      status: obj.contentRange ? 206 : 200,
      headers,
    });
  } catch (err) {
    console.error("[media] proxy error:", (err as Error).message);
    return NextResponse.json({ error: "storage unavailable" }, { status: 502 });
  }
}
