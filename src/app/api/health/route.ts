import { NextResponse } from "next/server";

/** Tiny liveness probe for Docker/Coolify healthchecks. */
export async function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() });
}
