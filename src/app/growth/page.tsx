import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GrowthChart } from "@/components/growth-chart";
import { SampleBanner } from "@/components/sample-banner";
import { getSessionOrNull } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { getGrowthEntries } from "@/lib/queries";

export const metadata: Metadata = { title: "বৃদ্ধি" };

/** Growth data is private — middleware requires sign-in for this route. */
export default async function GrowthPage() {
  const session = await getSessionOrNull();
  if (!session?.user) redirect("/login");

  const entries = await getGrowthEntries();

  return (
    <div>
      <SampleBanner />

      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-2 section-title">📈 {t("growth.title")}</h1>
          <p className="text-ink-500">{t("growth.subtitle")}</p>
        </div>
        <Link href="/family/growth" className="btn-primary">
          + {t("family.addGrowth")}
        </Link>
      </header>

      <GrowthChart entries={entries} />
    </div>
  );
}
