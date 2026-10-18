"use client";

/**
 * 🔒 Private birth details, fetched client-side from an authenticated
 * endpoint — so the About page itself can stay fully static (SSG) and
 * private data never enters the static HTML for signed-out visitors.
 */
import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { formatDateBn } from "@/lib/utils";

type BirthData = {
  birthDate?: string | null;
  birthTime?: string | null;
  birthWeightKg?: number | null;
  birthHeightCm?: number | null;
};

export function BirthDetails() {
  const [data, setData] = useState<BirthData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/family/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        /* signed out */
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) return <div className="h-24" aria-hidden="true" />;

  if (!data?.birthDate && !data?.birthTime) {
    return (
      <p className="rounded-2xl bg-cream-50 px-4 py-3 text-sm text-ink-500">
        🔒 {t("about.privateLocked")}
      </p>
    );
  }

  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      <Detail
        label={t("about.birthDate")}
        value={data.birthDate ? formatDateBn(data.birthDate) : undefined}
      />
      <Detail
        label={t("about.birthTime")}
        value={data.birthTime ? `${data.birthTime.replace(/^0/, "")} টা` : undefined}
      />
      <Detail
        label={t("about.birthWeight")}
        value={data.birthWeightKg ? `${data.birthWeightKg} কেজি` : undefined}
      />
      <Detail
        label={t("about.birthHeight")}
        value={data.birthHeightCm ? `${data.birthHeightCm} সেমি` : undefined}
      />
    </dl>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-ink-500">{label}</dt>
      <dd className="mt-1 font-semibold text-ink-900">{value || "—"}</dd>
    </div>
  );
}
