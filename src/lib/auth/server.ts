import { cookies } from "next/headers";
import { cache } from "react";

import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { getServerEnv } from "@/lib/env";
import { AuthError } from "@/lib/errors";
import type { UserProfile, UserRole } from "@/types/domain";

export { AuthError };

export const getCurrentUser = cache(async (): Promise<UserProfile | null> => {
  const env = getServerEnv();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(env.FIREBASE_SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    const snapshot = await getAdminDb().collection("users").doc(decoded.uid).get();

    if (!snapshot.exists) return null;

    const data = snapshot.data();
    if (!data) return null;

    return {
      id: snapshot.id,
      name: String(data.name ?? decoded.name ?? "User"),
      email: String(data.email ?? decoded.email ?? ""),
      phone: data.phone ? String(data.phone) : null,
      avatarUrl: data.avatarUrl ? String(data.avatarUrl) : null,
      avatarPublicId: data.avatarPublicId ? String(data.avatarPublicId) : null,
      role: data.role === "ADMIN" ? "ADMIN" : "USER",
      createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date(0).toISOString(),
      updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
});

export async function requireUser(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Unauthorized", 401);
  return user;
}

export async function requireRole(role: UserRole): Promise<UserProfile> {
  const user = await requireUser();
  if (user.role !== role) throw new AuthError("Forbidden", 403);
  return user;
}

export async function requireAdmin(): Promise<UserProfile> {
  return requireRole("ADMIN");
}
