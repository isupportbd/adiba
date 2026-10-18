/**
 * Full Auth.js (NextAuth v5) configuration — Node runtime only.
 *
 * - Credentials provider (email + password, bcrypt-hashed).
 * - DrizzleAdapter storing users in PostgreSQL.
 * - JWT sessions (no server session table needed).
 *
 * Sign in via `signIn()` from this module (server actions) or
 * `handlers` mounted at /api/auth/[...nextauth].
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { getDb } from "./db";
import { users } from "./db/schema";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().min(3),
  password: z.string().min(1),
});

export const isSampleMode = process.env.USE_SAMPLE_DATA === "1";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // In sample-only mode there is no database, so no adapter.
  adapter: isSampleMode ? undefined : DrizzleAdapter(getDb()),
  providers: [
    Credentials({
      credentials: {
        email: { label: "ইমেইল", type: "email" },
        password: { label: "পাসওয়ার্ড", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // SAMPLE MODE: lets you explore the family area without any database.
        if (isSampleMode) {
          return {
            id: "sample-user",
            name: "নমুনা পরিবার সদস্য",
            email: "family@example.com",
            role: "parent",
          };
        }

        const db = getDb();
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});

/** Returns the current session or null. Never throws. */
export async function getSessionOrNull() {
  try {
    return await auth();
  } catch {
    return null;
  }
}

/** True when a logged-in family member is viewing. */
export async function canViewPrivate(): Promise<boolean> {
  const session = await getSessionOrNull();
  return !!session?.user;
}

/** True when the signed-in user may manage users / delete anything. */
export async function isParent(): Promise<boolean> {
  const session = await getSessionOrNull();
  return session?.user?.role === "parent";
}

/** Guard for server actions — throws if called without a session. */
export async function requireFamily() {
  const session = await getSessionOrNull();
  if (!session?.user) throw new Error("Not authenticated");
  return session;
}
