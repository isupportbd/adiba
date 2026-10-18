/**
 * Route protection.
 *
 * Only the family-only areas are guarded; the rest of the site is
 * intentionally viewable by relatives who have the link (it carries
 * noindex headers, and birth date etc. is still withheld).
 */
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/family/:path*", "/growth/:path*", "/letters/:path*"],
};
