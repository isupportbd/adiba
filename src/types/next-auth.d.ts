import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "parent" | "family" | "viewer";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "parent" | "family" | "viewer";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: "parent" | "family" | "viewer";
  }
}
