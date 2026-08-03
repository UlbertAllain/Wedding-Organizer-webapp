import { FieldValue, Timestamp } from "firebase-admin/firestore";

import type { TimelineCreateInput, TimelineUpdateInput } from "@/features/timeline/schema";
import { AppError } from "@/lib/errors";
import { getAdminDb } from "@/lib/firebase/admin";
import { documentToRecord } from "@/lib/firebase/converters";
import type { TimelineRecord } from "@/types/domain";

function collection(bookingId: string) {
  return getAdminDb().collection("bookings").doc(bookingId).collection("timeline");
}

export async function listTimeline(bookingId: string) {
  const snapshot = await collection(bookingId).orderBy("eventTime", "asc").limit(300).get();
  return snapshot.docs.map((doc) => documentToRecord<TimelineRecord>(doc));
}

export async function createTimeline(input: TimelineCreateInput) {
  const ref = collection(input.bookingId).doc();
  const now = FieldValue.serverTimestamp();
  await ref.set({
    bookingId: input.bookingId,
    title: input.title,
    description: input.description ?? null,
    eventTime: Timestamp.fromDate(new Date(input.eventTime)),
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateTimeline(id: string, input: TimelineUpdateInput) {
  const ref = collection(input.bookingId).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new AppError("Timeline item not found", 404);
  const { bookingId: _bookingId, eventTime, ...rest } = input;
  void _bookingId;
  await ref.update({
    ...rest,
    ...(eventTime ? { eventTime: Timestamp.fromDate(new Date(eventTime)) } : {}),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteTimeline(bookingId: string, id: string) {
  const ref = collection(bookingId).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new AppError("Timeline item not found", 404);
  await ref.delete();
}
