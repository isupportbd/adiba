import type { Metadata } from "next";
import Link from "next/link";
import { createMemory } from "@/lib/actions";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "নতুন স্মৃতি" };

export default function NewMemoryPage() {
  return (
    <section className="card p-6 sm:p-8">
      <p className="mb-3">
        <Link href="/family" className="text-sm font-semibold text-blush-600 hover:underline">
          ← {t("family.title")}
        </Link>
      </p>
      <h2 className="mb-6 text-xl font-semibold">📸 {t("family.addMemory")}</h2>

      <form action={createMemory} className="space-y-5" encType="multipart/form-data">
        <div>
          <label htmlFor="title" className="field-label">
            শিরোনাম *
          </label>
          <input id="title" name="title" required className="field" placeholder="যেমন: প্রথম বর্ষার বিকেল" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="occurredOn" className="field-label">
              তারিখ
            </label>
            <input id="occurredOn" name="occurredOn" type="date" className="field" />
          </div>
          <div>
            <label htmlFor="type" className="field-label">
              ধরন
            </label>
            <select id="type" name="type" className="field" defaultValue="mixed">
              <option value="mixed">ছবি + গল্প</option>
              <option value="photo">শুধু ছবি</option>
              <option value="video">শুধু ভিডিও</option>
              <option value="story">শুধু গল্প</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="story" className="field-label">
            গল্প / বিবরণ
          </label>
          <textarea id="story" name="story" rows={5} className="field" placeholder="সেদিনটা কেমন ছিল, কী কী হয়েছিল…" />
        </div>

        <div>
          <label htmlFor="tags" className="field-label">
            বিষয় (ট্যাগ) — কমা দিয়ে আলাদা করুন
          </label>
          <input id="tags" name="tags" className="field" placeholder="বর্ষা, বাড়ি, হাসি" />
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
                {t("family.altRequired")} *
              </label>
              <input
                id="altText"
                name="altText"
                className="field"
                placeholder="যেমন: বারান্দায় বৃষ্টির জল ধরছে আদিবা"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="caption" className="field-label">
                  ছবির ক্যাপশন (ঐচ্ছিক)
                </label>
                <input id="caption" name="caption" className="field" />
              </div>
              <div>
                <label htmlFor="takenOn" className="field-label">
                  তোলার তারিখ (ঐচ্ছিক)
                </label>
                <input id="takenOn" name="takenOn" type="date" className="field" />
              </div>
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
