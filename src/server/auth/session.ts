import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth, type AuthUser, type Session } from "@/lib/auth/auth";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: "UNAUTHORIZED" | "FORBIDDEN" = "UNAUTHORIZED",
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function getSession(): Promise<Session | null> {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth();

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}

export async function assertAuthenticated(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    throw new AuthError("You must be signed in to continue.", "UNAUTHORIZED");
  }

  return session;
}

export async function assertAdmin(): Promise<Session> {
  const session = await assertAuthenticated();

  if (session.user.role !== "ADMIN") {
    throw new AuthError("Admin access required.", "FORBIDDEN");
  }

  return session;
}
