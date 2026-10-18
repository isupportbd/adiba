import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * On-demand revalidation, e.g.:
 *   curl -X POST https://site/api/revalidate -H "x-revalidate-secret: $REVALIDATE_SECRET"
 * (Server actions already revalidate automatically; this is a manual override.)
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
