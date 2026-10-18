import { NextResponse } from "next/server";
import { getSessionOrNull } from "@/lib/auth";
import { getChildProfile } from "@/lib/queries";

/**
 * 🔒 Private profile fields for signed-in family members only.
 * Used by the home page AgeBadge and the About page lock notice.
 * Never caches, never leaks: returns 401 when signed out.
 */
export async function GET() {
  const session = await getSessionOrNull();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const profile = await getChildProfile();
  return NextResponse.json(
    {
      birthDate: profile.birthDate ?? null,
      birthTime: profile.birthTime ?? null,
      birthWeightKg: profile.birthWeightKg ?? null,
      birthHeightCm: profile.birthHeightCm ?? null,
      nickname: profile.nickname ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
