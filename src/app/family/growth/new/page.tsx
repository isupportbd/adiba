import type { Metadata } from "next";
import Link from "next/link";
import { createGrowthEntry, deleteGrowthEntry } from "@/lib/actions";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { t } from "@/lib/i18n";
import { getGrowthEntries } from "@/lib/queries";
import { bnDigits, formatDateBn } from "@/lib/utils";

export const metadata: Metadata = { title: "নতুন মাপ" };

export default async function NewGrowthPage() {
  const entries = await getGrowthEntries();

  return (
    <div className="space-y-6">
      <section className="card p-6 sm:p-8">
        <p className="mb-3">
          <Link href="/family" className="text-sm font-semibold text-blush-600 hover:underline">
            ← {t("family.title")}
          </Link>
        </p>
        <h2 className="mb-6 text-xl font-semibold">📏 {t("family.addGrowth")}</h2>

        <form action={createGrowthEntry} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="measuredOn" className="field-label">
              তারিখ *
            </label>
            <input id="measuredOn" name="measuredOn" type="date" required className="field" />
          </div>
          <div>
            <label htmlFor="heightCm" className="field-label">
              {t("growth.height")}
            </label>
            <input id="heightCm" name="heightCm" type="number" step="0.1" min="0" className="field" />
          </div>
          <div>
            <label htmlFor="weightKg" className="field-label">
              {t("growth.weight")}
            </label>
            <input id="weightKg" name="weightKg" type="number" step="0.01" min="0" className="field" />
          </div>
          <div>
            <label htmlFor="headCircumferenceCm" className="field-label">
              {t("growth.head")}
            </label>
            <input
              id="headCircumferenceCm"
              name="headCircumferenceCm"
              type="number"
              step="0.1"
              min="0"
              className="field"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="note" className="field-label">
              {t("growth.note")}
            </label>
            <input id="note" name="note" className="field" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary w-full sm:w-auto">
              {t("common.save")}
            </button>
          </div>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="mb-4 text-lg font-semibold">আগের মাপগুলো</h2>
        <ul className="divide-y divide-cream-100">
          {[...entries].reverse().map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div>
                <span className="font-medium text-ink-900">{formatDateBn(e.measuredOn)}</span>
                <span className="ml-3 text-ink-500">
                  {e.heightCm ? `${bnDigits(e.heightCm)} সেমি` : ""}
                  {e.weightKg ? ` · ${bnDigits(e.weightKg)} কেজি` : ""}
                  {e.note ? ` · ${e.note}` : ""}
                </span>
              </div>
              <form action={deleteGrowthEntry}>
                <input type="hidden" name="id" value={e.id} />
                <ConfirmSubmit>🗑 {t("common.delete")}</ConfirmSubmit>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
