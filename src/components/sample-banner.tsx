import { usingSampleData } from "@/lib/queries";
import { t } from "@/lib/i18n";

/**
 * Gentle banner shown only while bundled sample data is being rendered
 * (no database yet / USE_SAMPLE_DATA=1). Disappears automatically once
 * real data exists.
 */
export async function SampleBanner() {
  const sample = await usingSampleData();
  if (!sample) return null;
  return (
    <div
      role="status"
      className="mb-6 rounded-2xl border border-dashed border-lavender-300 bg-lavender-50 px-4 py-3 text-sm leading-6 text-lavender-700"
    >
      ✨ {t("common.sampleBanner")}
    </div>
  );
}
