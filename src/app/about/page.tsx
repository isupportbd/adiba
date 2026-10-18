import type { Metadata } from "next";
import { BirthDetails } from "@/components/birth-details";
import { SampleBanner } from "@/components/sample-banner";
import { t } from "@/lib/i18n";
import { getChildProfile } from "@/lib/queries";

export const revalidate = 300;

export const metadata: Metadata = { title: "আমার সম্পর্কে" };

/**
 * About her — fully static (SSG + ISR).
 * Public fields are rendered at build/revalidate time; private birth
 * details are fetched client-side by <BirthDetails /> so they only ever
 * reach signed-in family members.
 */
export default async function AboutPage() {
  const profile = await getChildProfile();

  return (
    <div className="space-y-8">
      <SampleBanner />

      <header>
        <h1 className="mb-2 section-title">🌿 {t("about.title")}</h1>
        {profile.bio ? <p className="max-w-2xl leading-7 text-ink-700">{profile.bio}</p> : null}
      </header>

      <section aria-labelledby="identity" className="card p-6">
        <h2 id="identity" className="mb-4 text-lg font-semibold">
          পরিচয়
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label={t("about.realName")} value={profile.displayName} />
          <Detail label={t("about.nickname")} value={profile.nickname} />
        </dl>
      </section>

      <section aria-labelledby="birth" className="card p-6">
        <h2 id="birth" className="mb-4 text-lg font-semibold">
          🎂 {t("about.birth")}
        </h2>
        <BirthDetails />
      </section>

      {profile.familyLines.length > 0 ? (
        <section aria-labelledby="family" className="card p-6">
          <h2 id="family" className="mb-4 text-lg font-semibold">
            👨‍👩‍👧 {t("about.family")}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {profile.familyLines.map((line) => (
              <li
                key={line}
                className="flex items-center gap-3 rounded-2xl bg-cream-50 px-4 py-3 text-ink-700"
              >
                <span aria-hidden="true" className="text-xl">
                  🌸
                </span>
                {line}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
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
