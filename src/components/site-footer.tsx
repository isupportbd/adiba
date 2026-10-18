import Link from "next/link";
import { t } from "@/lib/i18n";
import { NAV, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-cream-200 bg-cream-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <nav aria-label="ফুটার নেভিগেশন">
          <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-500">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-blush-600 hover:underline">
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-xs leading-5 text-ink-500">
          {SITE.privateNote}
          <br />© {new Date().getFullYear()} {SITE.name} · {t("site.rights")}
        </p>
      </div>
    </footer>
  );
}
