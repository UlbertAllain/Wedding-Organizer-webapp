import { FieldValue, type QuerySnapshot } from "firebase-admin/firestore";

import { getBooking } from "@/features/bookings/repository";
import { galleryCreateSchema } from "@/features/gallery/schema";
import { requireAdmin, requireUser } from "@/lib/auth/server";
import { safeDeleteCloudinaryAsset } from "@/lib/cloudinary/server";
import { assertCloudinaryAsset } from "@/lib/cloudinary/validation";
import { getAdminDb } from "@/lib/firebase/admin";
import { documentToRecord } from "@/lib/firebase/converters";
import {
  assertSameOrigin,
  apiError,
  apiSuccess,
  handleApiError,
} from "@/lib/http";
import type { GalleryRecord } from "@/types/domain";

function records(snapshot: QuerySnapshot) {
  return snapshot.docs.map((doc) => documentToRecord<GalleryRecord>(doc));
}

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const bookingId = new URL(request.url).searchParams.get("bookingId");
    const gallery = getAdminDb().collection("gallery");

    if (user.role === "ADMIN") {
      let query = gallery.orderBy("createdAt", "desc").limit(300);
      if (bookingId) query = query.where("bookingId", "==", bookingId);
      return apiSuccess(records(await query.get()));
    }

    const bookingSnapshot = await getAdminDb()
      .collection("bookings")
      .where("userId", "==", user.id)
      .limit(200)
      .get();
    const allowedIds = bookingSnapshot.docs.map((doc) => doc.id);

    if (bookingId) {
      if (!allowedIds.includes(bookingId)) {
        return apiError("Gallery not found", 404);
      }

      const snapshot = await gallery
        .where("bookingId", "==", bookingId)
        .orderBy("createdAt", "desc")
        .limit(300)
        .get();
      return apiSuccess(records(snapshot));
    }

    const snapshots = [
      await gallery
        .where("bookingId", "==", null)
        .orderBy("createdAt", "desc")
        .limit(300)
        .get(),
    ];

    for (let index = 0; index < allowedIds.length; index += 30) {
      const chunk = allowedIds.slice(index, index + 30);
      if (!chunk.length) continue;

      snapshots.push(
        await gallery
          .where("bookingId", "in", chunk)
          .orderBy("createdAt", "desc")
          .limit(300)
          .get(),
      );
    }

    const result = snapshots
      .flatMap(records)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 300);

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const admin = await requireAdmin();
    const input = galleryCreateSchema.parse(await request.json());
    assertCloudinaryAsset(input.imageUrl, input.imagePublicId, "gallery");

    if (input.bookingId && !(await getBooking(input.bookingId, admin))) {
      return apiError("Booking not found", 404);
    }

    const ref = getAdminDb().collection("gallery").doc();
    await ref.set({
      ...input,
      bookingId: input.bookingId ?? null,
      caption: input.caption ?? null,
      uploadedBy: admin.id,
      createdAt: FieldValue.serverTimestamp(),
    });

    return apiSuccess({ id: ref.id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdmin();

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return apiError("Gallery id is required", 400);

    const ref = getAdminDb().collection("gallery").doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return apiError("Gallery item not found", 404);

    const publicId = String(snapshot.data()?.imagePublicId ?? "");
    await ref.delete();
    await safeDeleteCloudinaryAsset(publicId);

    return apiSuccess({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
