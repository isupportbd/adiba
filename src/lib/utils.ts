/** Small shared helpers: class names, Bengali dates & numbers, age maths. */

/** Tiny class-name joiner (clsx alternative, no dependency). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const BN_DATE = new Intl.DateTimeFormat("bn-BD", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** "2024-03-12" → "১২ মার্চ ২০২৪" (Bengali digits, Bengali month names). */
export function formatDateBn(iso?: string | null): string {
  if (!iso) return "";
  const d = parseIsoDate(iso);
  if (!d) return "";
  try {
    return BN_DATE.format(d);
  } catch {
    return iso;
  }
}

/** Parse "YYYY-MM-DD" as a LOCAL date (avoids UTC off-by-one). */
export function parseIsoDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Convert Western digits to Bengali digits (for hand-built strings). */
export function bnDigits(input: string | number): string {
  const digits = "০১২৩৪৫৬৭৮৯";
  return String(input).replace(/\d/g, (d) => digits[Number(d)]);
}

/** "2024-03-12" → "২০২৪" (Bengali digits). */
export function yearBn(iso?: string | null): string {
  return iso ? bnDigits(iso.slice(0, 4)) : "";
}

/**
 * Age from a birth date, in Bengali — e.g. "২ বছর ৩ মাস" or "৭ মাস".
 * Returns null when the birth date is unknown or in the future.
 */
export function humanAgeBn(birthDate?: string | null, now: Date = new Date()): string | null {
  if (!birthDate) return null;
  const birth = parseIsoDate(birthDate);
  if (!birth || birth > now) return null;

  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) return null;

  const years = Math.floor(months / 12);
  const restMonths = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${bnDigits(years)} বছর`);
  if (restMonths > 0 || years === 0) parts.push(`${bnDigits(restMonths)} মাস`);
  return parts.join(" ");
}

/** Age in months, used for gallery age-bucket labels when needed. */
export function ageInMonths(birthDate?: string | null, now: Date = new Date()): number | null {
  if (!birthDate) return null;
  const birth = parseIsoDate(birthDate);
  if (!birth || birth > now) return null;
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  return now.getDate() < birth.getDate() ? months - 1 : months;
}
