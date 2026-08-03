import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { requireUser } from "@/lib/auth/server";
import { safeDeleteCloudinaryAsset } from "@/lib/cloudinary/server";
import { assertCloudinaryAsset } from "@/lib/cloudinary/validation";
import { getAdminDb } from "@/lib/firebase/admin";
import { assertSameOrigin, apiSuccess, handleApiError } from "@/lib/http";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  avatarPublicId: z.string().trim().nullable().optional(),
});

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const input = schema.parse(await request.json());
    if (input.avatarUrl !== user.avatarUrl || input.avatarPublicId !== user.avatarPublicId) {
      assertCloudinaryAsset(input.avatarUrl, input.avatarPublicId, "avatars");
    }
    await getAdminDb().collection("users").doc(user.id).update({ ...input, updatedAt: FieldValue.serverTimestamp() });
    if ("avatarPublicId" in input && input.avatarPublicId !== user.avatarPublicId) {
      await safeDeleteCloudinaryAsset(user.avatarPublicId);
    }
    return apiSuccess({ id: user.id });
  } catch (error) {
    return handleApiError(error);
  }
}
