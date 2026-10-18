/**
 * Edge-safe Auth.js config — used by middleware.ts.
 *
 * IMPORTANT: this file must never import the database driver (pg) or the
 * Drizzle adapter, because middleware runs on the Edge runtime. The full
 * config (adapter + credentials provider) lives in auth.ts.
 */
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  // No providers here — middleware only validates the JWT cookie.
  providers: [],
  callbacks: {
    /**
     * Called by middleware for the routes listed in its matcher.
     * Unauthenticated visitors are redirected to /login.
     */
    authorized({ auth }) {
      return !!auth?.user;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? "family";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as "parent" | "family" | "viewer") ?? "family";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
