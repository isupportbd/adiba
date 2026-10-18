import type { Metadata } from "next";
import Link from "next/link";
import { createMilestone } from "@/lib/actions";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "নতুন প্রথম মুহূর্ত" };

const TYPES = [
  ["first_smile", "প্রথম হাসি"],
  ["first_crawl", "প্রথম ঘোরা"],
  ["first_steps", "প্রথম পদক্ষেপ"],
  ["first_word", "প্রথম কথা"],
  ["first_tooth", "প্রথম দাঁত"],
  ["first_food", "প্রথম খাবার"],
  ["first_birthday", "প্রথম জন্মদিন"],
  ["custom", "অন্যান্য বিশেষ মুহূর্ত"],
] as const;

export default function NewMilestonePage() {
  return (
    <section className="card p-6 sm:p-8">
      <p className="mb-3">
        <Link href="/family" className="text-sm font-semibold text-blush-600 hover:underline">
          ← {t("family.title")}
        </Link>
      </p>
      <h2 className="mb-6 text-xl font-semibold">🌟 {t("family.addMilestone")}</h2>

      <form action={createMilestone} className="space-y-5" encType="multipart/form-data">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="milestoneType" className="field-label">
              কী ধরনের মুহূর্ত
            </label>
            <select id="milestoneType" name="milestoneType" className="field" defaultValue="custom">
              {TYPES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="occurredOn" className="field-label">
              তারিখ
            </label>
            <input id="occurredOn" name="occurredOn" type="date" className="field" />
          </div>
        </div>

        <div>
          <label htmlFor="title" className="field-label">
            শিরোনাম *
          </label>
          <input id="title" name="title" required className="field" placeholder="যেমন: প্রথম কথা — ‘মা’" />
        </div>

        <div>
          <label htmlFor="description" className="field-label">
            বিবরণ
          </label>
          <textarea id="description" name="description" rows={4} className="field" />
        </div>

        <fieldset className="rounded-2xl border border-cream-200 bg-cream-50 p-4">
          <legend className="px-2 text-sm font-semibold text-ink-700">ছবি / ভিডিও</legend>
          <div className="space-y-4">
            <div>
              <label htmlFor="files" className="field-label">
                ফাইল বাছুন
              </label>
              <input id="files" name="files" type="file" multiple accept="image/*,video/*,.vtt" className="field" />
              <p className="mt-1 text-xs leading-5 text-ink-500">{t("family.uploadHint")}</p>
            </div>
            <div>
              <label htmlFor="altText" className="field-label">
                {t("family.altRequired")}
              </label>
              <input id="altText" name="altText" className="field" />
            </div>
          </div>
        </fieldset>

        <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <input type="checkbox" name="isPrivate" className="h-4 w-4 rounded border-cream-300" />
          🔒 {t("family.markPrivate")}
        </label>

        <button type="submit" className="btn-primary w-full sm:w-auto">
          {t("common.save")}
        </button>
      </form>
    </section>
  );
}
