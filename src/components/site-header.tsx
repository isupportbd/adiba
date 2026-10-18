import Link from "next/link";
import { AuthArea } from "@/components/auth-area";
import { t } from "@/lib/i18n";
import { NAV, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Site header — soft cream bar with chip-style navigation.
 * The nav wraps on mobile instead of hiding behind a hamburger, so every
 * page stays one tap away and works without JavaScript.
 *
 * NOTE: this component must NOT call auth()/headers() — that would force
 * every page to render per-request. Session state is handled client-side
 * by <AuthArea />.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream-100/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-display text-lg font-bold text-ink-900 hover:text-blush-600"
          aria-label={`${SITE.name} — ${t("nav.home")}`}
        >
          🌸 {SITE.name}
        </Link>

        <nav aria-label="প্রধান নেভিগেশন" className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1">
          <ul className="flex flex-wrap gap-1.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "chip border-cream-300 bg-white/70 text-ink-700 hover:border-blush-200 hover:bg-blush-50",
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="order-2 ml-auto flex items-center gap-2 sm:order-3">
          <AuthArea />
        </div>
      </div>
    </header>
  );
}
