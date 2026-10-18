import type { Metadata } from "next";
import Link from "next/link";
import { createAlbum } from "@/lib/actions";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "নতুন অ্যালবাম" };

export default function NewAlbumPage() {
  return (
    <section className="card p-6 sm:p-8">
      <p className="mb-3">
        <Link href="/family" className="text-sm font-semibold text-blush-600 hover:underline">
          ← {t("family.title")}
        </Link>
      </p>
      <h2 className="mb-6 text-xl font-semibold">🗂️ {t("family.addAlbum")}</h2>

      <form action={createAlbum} className="space-y-5" encType="multipart/form-data">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="title" className="field-label">
              অ্যালবামের নাম *
            </label>
            <input id="title" name="title" required className="field" placeholder="যেমন: এক বছরের আনন্দ" />
          </div>
          <div>
            <label htmlFor="eventName" className="field-label">
              অনুষ্ঠান
            </label>
            <input id="eventName" name="eventName" className="field" placeholder="জন্মদিন / ভ্রমণ / বাড়ি" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ageBucket" className="field-label">
              বয়সের ধাপ
            </label>
            <select id="ageBucket" name="ageBucket" className="field" defaultValue="unknown">
              <option value="0-6">০–৬ মাস</option>
              <option value="6-12">৬–১২ মাস</option>
              <option value="1-3">১–৩ বছর</option>
              <option value="3+">৩ বছরের পরে</option>
              <option value="unknown">অন্যান্য</option>
            </select>
          </div>
          <div>
            <label htmlFor="description" className="field-label">
              বিবরণ
            </label>
            <input id="description" name="description" className="field" />
          </div>
        </div>

        <fieldset className="rounded-2xl border border-cream-200 bg-cream-50 p-4">
          <legend className="px-2 text-sm font-semibold text-ink-700">ছবি / ভিডিও</legend>
          <div className="space-y-4">
            <div>
              <label htmlFor="files" className="field-label">
                ফাইল বাছুন (একাধিক হতে পারে)
              </label>
              <input id="files" name="files" type="file" multiple accept="image/*,video/*,.vtt" className="field" />
              <p className="mt-1 text-xs leading-5 text-ink-500">
                {t("family.uploadHint")} প্রথম ছবিটি অ্যালবামের প্রচ্ছদ হিসেবে ব্যবহৃত হবে।
              </p>
            </div>
            <div>
              <label htmlFor="altText" className="field-label">
                {t("family.altRequired")} *
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
