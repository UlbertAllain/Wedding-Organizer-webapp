import { FieldValue } from "firebase-admin/firestore";

import { getBooking } from "@/features/bookings/repository";
import { chatMessageSchema } from "@/features/chat/schema";
import { requireUser } from "@/lib/auth/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { documentToRecord } from "@/lib/firebase/converters";
import {
  assertSameOrigin,
  apiError,
  apiSuccess,
  handleApiError,
} from "@/lib/http";
import type { ChatMessageRecord } from "@/types/domain";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const bookingId = new URL(request.url).searchParams.get("bookingId");
    if (!bookingId) return apiError("bookingId is required", 400);

    const booking = await getBooking(bookingId, user);
    if (!booking) return apiError("Booking not found", 404);

    const snapshot = await getAdminDb()
      .collection("bookings")
      .doc(bookingId)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .limit(200)
      .get();

    return apiSuccess(
      snapshot.docs.map((doc) => documentToRecord<ChatMessageRecord>(doc)),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const input = chatMessageSchema.parse(await request.json());
    const booking = await getBooking(input.bookingId, user);
    if (!booking) return apiError("Booking not found", 404);

    const ref = getAdminDb()
      .collection("bookings")
      .doc(input.bookingId)
      .collection("messages")
      .doc();

    await ref.set({
      bookingId: input.bookingId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      message: input.message,
      createdAt: FieldValue.serverTimestamp(),
    });

    return apiSuccess({ id: ref.id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
