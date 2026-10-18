"use client";

/**
 * Age display for the home page.
 *
 * Birth date is PRIVATE, so this component fetches it from an
 * authenticated endpoint and renders nothing for signed-out visitors.
 * The home page itself stays fully static (SSG) this way.
 */
import { useEffect, useState } from "react";
import { humanAgeBn } from "@/lib/utils";

type ProfileResponse = {
  birthDate?: string | null;
  nickname?: string | null;
};

export function AgeBadge() {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/family/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        /* signed out — stay hidden */
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) {
    // Reserve space to avoid layout shift; screen readers get the hint below.
    return <div className="h-9" aria-hidden="true" />;
  }

  if (!data?.birthDate) {
    return (
      <p className="text-sm text-ink-500">🔒 বয়স ও জন্মতারিখ দেখতে হলে পরিবার হিসেবে প্রবেশ করুন</p>
    );
  }

  const age = humanAgeBn(data.birthDate);
  if (!age) return null;

  return (
    <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-blush-600 shadow-soft">
      🎂 {age}
      <span className="font-normal text-ink-300">|</span>
      <span className="font-normal text-ink-500">🔒 পরিবারদের জন্য সংরক্ষিত তথ্য</span>
    </p>
  );
}
