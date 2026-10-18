"use client";

/**
 * Sign-in / sign-out area of the header.
 *
 * Kept client-side ON PURPOSE: calling auth() in the root layout would
 * force every page to render per-request, killing SSG/ISR. This component
 * hydrates after the static shell paints and shows the right state.
 */
import Link from "next/link";
import { useSession } from "next-auth/react";
import { SignOutButton } from "@/components/sign-out-button";
import { t } from "@/lib/i18n";

export function AuthArea() {
  const { status } = useSession();
  const loggedIn = status === "authenticated";

  if (status === "loading") {
    // Reserve the button's space; keep the shell static.
    return <div className="h-9 w-28" aria-hidden="true" />;
  }

  return loggedIn ? (
    <>
      <Link href="/family" className="btn-primary !px-4 !py-1.5">
        {t("nav.familyArea")}
      </Link>
      <SignOutButton />
    </>
  ) : (
    <Link href="/login" className="btn-ghost !px-4 !py-1.5">
      🔒 {t("nav.login")}
    </Link>
  );
}
