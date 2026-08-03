import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { z } from "zod";

import { getServerEnv } from "@/lib/env";
import { AuthError } from "@/lib/errors";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { assertSameOrigin, apiSuccess, handleApiError } from "@/lib/http";

const sessionSchema = z.object({
  idToken: z.string().min(100),
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(30).optional(),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const input = sessionSchema.parse(await request.json());
    const env = getServerEnv();
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(input.idToken, true).catch(() => {
      throw new AuthError("Invalid or expired Firebase token", 401);
    });
    const expiresIn = env.SESSION_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    const sessionCookie = await auth.createSessionCookie(input.idToken, { expiresIn });

    const userRef = getAdminDb().collection("users").doc(decoded.uid);
    const userSnapshot = await userRef.get();
    const now = FieldValue.serverTimestamp();

    if (!userSnapshot.exists) {
      await userRef.set({
        name: input.name ?? decoded.name ?? "User",
        email: decoded.email ?? "",
        phone: input.phone ?? null,
        avatarUrl: decoded.picture ?? null,
        avatarPublicId: null,
        role: "USER",
        createdAt: now,
        updatedAt: now,
      });
    } else if (input.name || input.phone) {
      await userRef.update({
        ...(input.name ? { name: input.name } : {}),
        ...(input.phone ? { phone: input.phone } : {}),
        updatedAt: now,
      });
    }

    const cookieStore = await cookies();
    cookieStore.set(env.FIREBASE_SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return apiSuccess({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const env = getServerEnv();
    const cookieStore = await cookies();
    cookieStore.set(env.FIREBASE_SESSION_COOKIE_NAME, "", {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return apiSuccess({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
