import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionOrNull } from "@/lib/auth";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "পরিবার কক্ষ",
  robots: { index: false, follow: false },
};

/**
 * 🔒 Family-only shell. Middleware already blocks unauthenticated
 * requests; this belt-and-braces check protects against matcher slips.
 */
export default async function FamilyLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionOrNull();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6">
      <header className="card bg-gradient-to-br from-blush-50 to-lavender-50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="mb-1 text-2xl font-semibold">🏠 {t("family.title")}</h1>
            <p className="text-sm text-ink-500">{t("family.subtitle")}</p>
          </div>
          <p className="text-sm text-ink-700">
            {session.user.name || session.user.email}
            {session.user.role === "parent" ? (
              <span className="chip-static ml-2">বাবা–মা</span>
            ) : null}
          </p>
        </div>

        <nav aria-label="পরিবার কক্ষ নেভিগেশন" className="mt-4">
          <ul className="flex flex-wrap gap-2">
            {[
              { href: "/family", label: "ড্যাশবোর্ড" },
              { href: "/family/memories/new", label: `+ ${t("family.addMemory")}` },
              { href: "/family/albums/new", label: `+ ${t("family.addAlbum")}` },
              { href: "/family/milestones/new", label: `+ ${t("family.addMilestone")}` },
              { href: "/family/letters/new", label: `+ ${t("family.addLetter")}` },
              { href: "/family/favorites/new", label: `+ ${t("family.addFavorite")}` },
              { href: "/family/growth/new", label: `+ ${t("family.addGrowth")}` },
              { href: "/family/profile", label: `✎ ${t("family.editProfile")}` },
              { href: "/family/users", label: `👥 ${t("family.manageUsers")}` },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="chip border-white bg-white/80 text-ink-700 shadow-sm hover:bg-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {children}
    </div>
  );
}
