import type { Metadata } from "next";
import Link from "next/link";
import { saveProfile } from "@/lib/actions";
import { t } from "@/lib/i18n";
import { getChildProfile } from "@/lib/queries";

export const metadata: Metadata = { title: "প্রোফাইল সম্পাদনা" };

/**
 * Edit her profile.
 * Public fields are marked 🌐 and private fields 🔒 so it is always
 * obvious what the world can see. (No address / school / routine
 * fields — on purpose.)
 */
export default async function ProfileEditPage() {
  const profile = await getChildProfile();

  return (
    <section className="card p-6 sm:p-8">
      <p className="mb-3">
        <Link href="/family" className="text-sm font-semibold text-blush-600 hover:underline">
          ← {t("family.title")}
        </Link>
      </p>
      <h2 className="mb-6 text-xl font-semibold">✎ {t("family.editProfile")}</h2>

      <form action={saveProfile} className="space-y-6" encType="multipart/form-data">
        <fieldset className="space-y-4 rounded-2xl border border-mint-200 bg-mint-50/50 p-4">
          <legend className="px-2 text-sm font-semibold text-mint-700">
            🌐 সবার জন্য দৃশ্যমান (পাবলিক)
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="displayName" className="field-label">
                {t("about.realName")}
              </label>
              <input id="displayName" name="displayName" defaultValue={profile.displayName ?? ""} className="field" />
            </div>
            <div>
              <label htmlFor="nickname" className="field-label">
                {t("about.nickname")}
              </label>
              <input id="nickname" name="nickname" defaultValue={profile.nickname ?? ""} className="field" />
            </div>
          </div>
          <div>
            <label htmlFor="bio" className="field-label">
              {t("about.bio")}
            </label>
            <textarea id="bio" name="bio" rows={3} defaultValue={profile.bio ?? ""} className="field" />
          </div>
          <div>
            <label htmlFor="parentsMessage" className="field-label">
              {t("home.parentsMessage")} (হোম পেজে দেখাবে)
            </label>
            <textarea
              id="parentsMessage"
              name="parentsMessage"
              rows={5}
              defaultValue={profile.parentsMessage ?? ""}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="familyLines" className="field-label">
              পরিবারের সদস্য — প্রতি লাইনে একজন (মা — নাম)
            </label>
            <textarea
              id="familyLines"
              name="familyLines"
              rows={5}
              defaultValue={profile.familyLines.join("\n")}
              className="field"
              placeholder={"মা — নাম\nবাবা — নাম"}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="featured" className="field-label">
                হোম পেজের প্রধান ছবি (নতুন আপলোড)
              </label>
              <input id="featured" name="featured" type="file" accept="image/*" className="field" />
            </div>
            <div>
              <label htmlFor="featuredAlt" className="field-label">
                প্রধান ছবির বর্ণনা (alt)
              </label>
              <input id="featuredAlt" name="featuredAlt" className="field" placeholder="যেমন: জানালার পাশে হাসছে আদিবা" />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-2xl border border-blush-200 bg-blush-50/50 p-4">
          <legend className="px-2 text-sm font-semibold text-blush-600">
            🔒 শুধু পরিবারের জন্য (প্রাইভেট)
          </legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="birthDate" className="field-label">
                {t("about.birthDate")}
              </label>
              <input id="birthDate" name="birthDate" type="date" defaultValue={profile.birthDate ?? ""} className="field" />
            </div>
            <div>
              <label htmlFor="birthTime" className="field-label">
                {t("about.birthTime")}
              </label>
              <input id="birthTime" name="birthTime" type="time" defaultValue={profile.birthTime ?? ""} className="field" />
            </div>
            <div>
              <label htmlFor="birthWeightKg" className="field-label">
                {t("about.birthWeight")} (কেজি)
              </label>
              <input
                id="birthWeightKg"
                name="birthWeightKg"
                type="number"
                step="0.01"
                min="0"
                defaultValue={profile.birthWeightKg ?? ""}
                className="field"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="birthHeightCm" className="field-label">
                {t("about.birthHeight")} (সেমি)
              </label>
              <input
                id="birthHeightCm"
                name="birthHeightCm"
                type="number"
                step="0.1"
                min="0"
                defaultValue={profile.birthHeightCm ?? ""}
                className="field"
              />
            </div>
          </div>
          <p className="text-xs leading-5 text-ink-500">
            ⚠️ ঠিকানা, স্কুল বা দৈনন্দিন রুটিনের তথ্য এখানে রাখবেন না — সেগুলো সংবেদনশীল
            ব্যক্তিগত তথ্য, এই সাইটে প্রয়োজন নেই।
          </p>
        </fieldset>

        <button type="submit" className="btn-primary w-full sm:w-auto">
          {t("common.save")}
        </button>
      </form>
    </section>
  );
}
