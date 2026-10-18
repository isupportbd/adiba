"use client";

import { signOut } from "next-auth/react";
import { t } from "@/lib/i18n";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="btn-ghost !px-4 !py-1.5"
    >
      {t("nav.logout")}
    </button>
  );
}
