import Link from "next/link";
import { deleteLetter, deleteMemory, toggleFavorite } from "@/lib/actions";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { t } from "@/lib/i18n";
import { getFavorites, getLetters, getMemories } from "@/lib/queries";
import { formatDateBn } from "@/lib/utils";

const SAVED_MESSAGES: Record<string, string> = {
  memory: "নতুন স্মৃতি সংরক্ষণ হয়েছে ✓",
  album: "নতুন অ্যালবাম সংরক্ষণ হয়েছে ✓",
  milestone: "নতুন প্রথম মুহূর্ত সংরক্ষণ হয়েছে ✓",
  letter: "নতুন চিঠি সংরক্ষণ হয়েছে ✓",
  favorite: "প্রিয় জিনিস সংরক্ষণ হয়েছে ✓",
  growth: "নতুন মাপ সংরক্ষণ হয়েছে ✓",
  profile: "প্রোফাইল আপডেট হয়েছে ✓",
};

/** Family dashboard: confirmation banner + recent items with quick actions. */
export default async function FamilyDashboard({
  searchParams,
}: {
  searchParams: { saved?: string; deleted?: string };
}) {
  const [memories, letters, favorites] = await Promise.all([
    getMemories(),
    getLetters(),
    getFavorites(),
  ]);

  const banner = searchParams.saved
    ? SAVED_MESSAGES[searchParams.saved] ?? t("family.saved")
    : searchParams.deleted
      ? t("family.deleted")
      : null;

  return (
    <>
      {banner ? (
        <p role="status" className="rounded-2xl bg-mint-50 px-4 py-3 font-medium text-mint-700">
          {banner}
        </p>
      ) : null}

      <section aria-labelledby="recent-memories" className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-memories" className="text-lg font-semibold">
            📖 সাম্প্রতিক স্মৃতি
          </h2>
          <Link href="/family/memories/new" className="btn-primary !px-4 !py-1.5">
            + {t("family.addMemory")}
          </Link>
        </div>
        <ul className="divide-y divide-cream-100">
          {memories.slice(0, 6).map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink-900">{m.title}</p>
                <p className="text-xs text-ink-500">
                  {m.occurredOn ? formatDateBn(m.occurredOn) : t("common.unknownDate")}
                  {m.isPrivate ? " · 🔒" : ""}
                </p>
              </div>
              <form action={deleteMemory}>
                <input type="hidden" name="id" value={m.id} />
                <ConfirmSubmit>🗑 {t("common.delete")}</ConfirmSubmit>
              </form>
            </li>
          ))}
          {memories.length === 0 ? <li className="py-3 text-ink-500">{t("common.empty")}</li> : null}
        </ul>
      </section>

      <section aria-labelledby="recent-letters" className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-letters" className="text-lg font-semibold">
            💌 চিঠি
          </h2>
          <Link href="/family/letters/new" className="btn-primary !px-4 !py-1.5">
            + {t("family.addLetter")}
          </Link>
        </div>
        <ul className="divide-y divide-cream-100">
          {letters.slice(0, 5).map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink-900">{l.title}</p>
                <p className="text-xs text-ink-500">
                  {l.authorName} · {l.writtenOn ? formatDateBn(l.writtenOn) : ""}
                </p>
              </div>
              <form action={deleteLetter}>
                <input type="hidden" name="id" value={l.id} />
                <ConfirmSubmit>🗑 {t("common.delete")}</ConfirmSubmit>
              </form>
            </li>
          ))}
          {letters.length === 0 ? <li className="py-3 text-ink-500">{t("common.empty")}</li> : null}
        </ul>
      </section>

      <section aria-labelledby="fav-list" className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="fav-list" className="text-lg font-semibold">
            🎀 প্রিয় জিনিস
          </h2>
          <Link href="/family/favorites/new" className="btn-primary !px-4 !py-1.5">
            + {t("family.addFavorite")}
          </Link>
        </div>
        <ul className="divide-y divide-cream-100">
          {favorites.slice(0, 8).map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink-900">
                  {f.name}{" "}
                  <span className="text-xs font-normal text-ink-300">
                    ({t(`favorites.category.${f.category}`)})
                  </span>
                </p>
              </div>
              <form action={toggleFavorite}>
                <input type="hidden" name="id" value={f.id} />
                <input type="hidden" name="current" value={String(f.isCurrent)} />
                <ConfirmSubmit confirmText={f.isCurrent ? "আগের তালিকায় পাঠাবেন?" : "আবার বর্তমান তালিকায় আনবেন?"}>
                  {f.isCurrent ? "⏳ আগের" : "💚 বর্তমান"}
                </ConfirmSubmit>
              </form>
            </li>
          ))}
          {favorites.length === 0 ? <li className="py-3 text-ink-500">{t("common.empty")}</li> : null}
        </ul>
      </section>
    </>
  );
}
