import type { Metadata } from "next";
import Link from "next/link";
import { createLetter } from "@/lib/actions";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "নতুন চিঠি" };

export default function NewLetterPage() {
  return (
    <section className="card p-6 sm:p-8">
      <p className="mb-3">
        <Link href="/family" className="text-sm font-semibold text-blush-600 hover:underline">
          ← {t("family.title")}
        </Link>
      </p>
      <h2 className="mb-2 text-xl font-semibold">💌 {t("family.addLetter")}</h2>
      <p className="mb-6 text-sm text-ink-500">
        চিঠিগুলো ডিফল্টে 🔒 নিজস্ব থাকে — মিষ্টি বড় হয়ে পড়বে।
      </p>

      <form action={createLetter} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="title" className="field-label">
              চিঠির শিরোনাম *
            </label>
            <input id="title" name="title" required className="field" placeholder="যেমন: তোমার প্রথম বছরে" />
          </div>
          <div>
            <label htmlFor="writtenOn" className="field-label">
              তারিখ
            </label>
            <input id="writtenOn" name="writtenOn" type="date" className="field" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="authorName" className="field-label">
              লেখকের নাম *
            </label>
            <input id="authorName" name="authorName" required className="field" placeholder="যেমন: রুবিনা রহমান" />
          </div>
          <div>
            <label htmlFor="relationship" className="field-label">
              সম্পর্ক
            </label>
            <input id="relationship" name="relationship" className="field" placeholder="মা / বাবা / দাদি…" />
          </div>
        </div>

        <div>
          <label htmlFor="body" className="field-label">
            চিঠির লেখা *
          </label>
          <textarea id="body" name="body" rows={10} required className="field" placeholder="প্রিয় মিষ্টি, …" />
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <input type="checkbox" name="isPrivate" defaultChecked className="h-4 w-4 rounded border-cream-300" />
          🔒 {t("family.markPrivate")}
        </label>

        <button type="submit" className="btn-primary w-full sm:w-auto">
          {t("common.save")}
        </button>
      </form>
    </section>
  );
}
