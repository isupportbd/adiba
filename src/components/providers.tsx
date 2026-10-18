"use client";

import { SessionProvider } from "next-auth/react";

/** Supplies the session to client components (AuthArea, sign-out). */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
