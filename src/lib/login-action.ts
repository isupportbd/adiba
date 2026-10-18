"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { t } from "@/lib/i18n";

/** Credentials sign-in action (used with useFormState on /login). */
export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/family",
    });
  } catch (error) {
    // Successful sign-in throws NEXT_REDIRECT — never swallow that.
    if (error instanceof AuthError) {
      return t("login.error");
    }
    throw error;
  }
  return t("login.error");
}
