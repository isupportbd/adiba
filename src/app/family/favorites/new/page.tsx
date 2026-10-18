import type { Metadata } from "next";
import Link from "next/link";
import { createFavorite } from "@/lib/actions";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "নতুন প্রিয় জিনিস" };

const CATEGORIES = [
  ["toy", "🧸 খেলনা"],
  ["food", "🍌 খাবার"],
  ["song", "🎵 গান–কবিতা"],
  ["cartoon", "📺 কার্টুন"],
  ["book", "📚 বই"],
  ["other", "✨ অন্যান্য"],
] as const;

export default function NewFavoritePage() {
  return (
    <section className="card p-6 sm:p-8">
      <p className="mb-3">
        <Link href="/family" className="text-sm font-semibold text-blush-600 hover:underline">
          ← {t("family.title")}
        </Link>
      </p>
      <h2 className="mb-6 text-xl font-semibold">🎀 {t("family.addFavorite")}</h2>

      <form action={createFavorite} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="field-label">
              ধরন
            </label>
            <select id="category" name="category" className="field" defaultValue="toy">
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="name" className="field-label">
              নাম *
            </label>
            <input id="name" name="name" required className="field" placeholder="যেমন: নরম খরগোশ রুফি" />
          </div>
        </div>

        <div>
          <label htmlFor="note" className="field-label">
            ছোট্ট মন্তব্য
          </label>
          <input id="note" name="note" className="field" placeholder="ঘুমের আগে অবশ্যই লাগবে" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sinceOn" className="field-label">
              কবে থেকে প্রিয়
            </label>
            <input id="sinceOn" name="sinceOn" type="date" className="field" />
          </div>
          <label className="mt-7 flex items-center gap-2 text-sm font-medium text-ink-700">
            <input type="checkbox" name="isCurrent" defaultChecked className="h-4 w-4 rounded border-cream-300" />
            এখনও প্রিয় (আনচেক করলে “আগের প্রিয়” তালিকায় যাবে)
          </label>
        </div>

        <button type="submit" className="btn-primary w-full sm:w-auto">
          {t("common.save")}
        </button>
      </form>
    </section>
  );
}
