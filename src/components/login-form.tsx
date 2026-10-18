"use client";

import { useFormState, useFormStatus } from "react-dom";
import { authenticate } from "@/lib/login-action";
import { t } from "@/lib/i18n";

export function LoginForm() {
  const [error, formAction] = useFormState(authenticate, undefined);

  return (
    <form
      action={formAction}
      className="card mx-auto max-w-md space-y-4 p-6 sm:p-8"
      aria-describedby="login-hint"
    >
      <div>
        <label htmlFor="email" className="field-label">
          {t("login.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field"
          dir="ltr"
        />
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          {t("login.password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="field"
          dir="ltr"
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-2xl bg-blush-50 px-4 py-3 text-sm font-medium text-blush-600">
          {error}
        </p>
      ) : null}

      <SubmitButton />

      <p id="login-hint" className="text-xs leading-5 text-ink-500">
        🔒 এই সাইটটি শুধু পরিবারের জন্য। পাসওয়ার্ড ভুলে গেলে বাবা–মাকে বলুন — তাঁরা নতুন
        পাসওয়ার্ড দিতে পারবেন।
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
      {pending ? t("common.loading") : `🔒 ${t("login.submit")}`}
    </button>
  );
}
