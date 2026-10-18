import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "প্রবেশ" };

export default async function LoginPage() {
  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="mb-2 section-title">🔐 {t("login.title")}</h1>
        <p className="text-ink-500">{t("login.subtitle")}</p>
      </header>

      <LoginForm />

      <p className="text-center text-sm">
        <Link href="/" className="text-blush-600 hover:underline">
          ← {t("nav.home")}
        </Link>
      </p>
    </div>
  );
}
