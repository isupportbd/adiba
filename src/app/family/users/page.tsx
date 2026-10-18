import type { Metadata } from "next";
import Link from "next/link";
import { createUser, deleteUser, resetUserPassword } from "@/lib/actions";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { getSessionOrNull } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { listUsers } from "@/lib/queries";

export const metadata: Metadata = { title: "পরিবারের সদস্য" };

/** Manage who can sign in. Parent role only for user management. */
export default async function UsersPage({
  searchParams,
}: {
  searchParams: { saved?: string; deleted?: string };
}) {
  const [session, users] = await Promise.all([getSessionOrNull(), listUsers()]);
  const isParentUser = session?.user?.role === "parent";

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <p className="mb-3">
          <Link href="/family" className="text-sm font-semibold text-blush-600 hover:underline">
            ← {t("family.title")}
          </Link>
        </p>
        <h2 className="mb-4 text-lg font-semibold">👥 {t("family.manageUsers")}</h2>

        {searchParams.saved ? (
          <p role="status" className="mb-3 rounded-2xl bg-mint-50 px-4 py-3 text-mint-700">
            {t("family.saved")}
          </p>
        ) : null}

        <ul className="divide-y divide-cream-100">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium text-ink-900">{u.name || "—"}</p>
                <p className="text-xs text-ink-500" dir="ltr">
                  {u.email} · {u.role}
                </p>
              </div>
              {isParentUser && u.id !== session?.user?.id ? (
                <div className="flex flex-wrap items-center gap-2">
                  <form action={resetUserPassword} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <label className="sr-only" htmlFor={`pw-${u.id}`}>
                      নতুন পাসওয়ার্ড
                    </label>
                    <input
                      id={`pw-${u.id}`}
                      name="password"
                      type="password"
                      minLength={8}
                      required
                      placeholder="নতুন পাসওয়ার্ড"
                      className="field !w-44 !py-1.5"
                      dir="ltr"
                    />
                    <button type="submit" className="chip border-lavender-200 bg-lavender-50 text-lavender-700">
                      পাসওয়ার্ড বদলান
                    </button>
                  </form>
                  <form action={deleteUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <ConfirmSubmit>🗑 {t("common.delete")}</ConfirmSubmit>
                  </form>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {isParentUser ? (
        <section className="card p-6">
          <h2 className="mb-4 text-lg font-semibold">➕ নতুন সদস্য যোগ করুন</h2>
          <form action={createUser} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="field-label">
                নাম
              </label>
              <input id="name" name="name" required className="field" />
            </div>
            <div>
              <label htmlFor="email" className="field-label">
                {t("login.email")}
              </label>
              <input id="email" name="email" type="email" required className="field" dir="ltr" />
            </div>
            <div>
              <label htmlFor="password" className="field-label">
                {t("login.password")} (৮+ অক্ষর)
              </label>
              <input id="password" name="password" type="password" minLength={8} required className="field" dir="ltr" />
            </div>
            <div>
              <label htmlFor="role" className="field-label">
                ভূমিকা
              </label>
              <select id="role" name="role" className="field" defaultValue="family">
                <option value="parent">বাবা–মা (সম্পূর্ণ অনুমতি)</option>
                <option value="family">পরিবার (স্মৃতি যোগ করতে পারবেন)</option>
                <option value="viewer">দর্শক (শুধু দেখবেন)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">
                {t("common.add")}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <p className="rounded-2xl bg-cream-50 px-4 py-3 text-sm text-ink-500">
          সদস্য যোগ বা পরিবর্তন করার অনুমতি শুধু বাবা–মাকে আছে।
        </p>
      )}
    </div>
  );
}
