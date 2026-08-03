import { FieldValue } from "firebase-admin/firestore";

import { AppError } from "@/lib/errors";
import { getAdminDb } from "@/lib/firebase/admin";
import { documentToRecord } from "@/lib/firebase/converters";
import type { PaymentRecord, PaymentStatus, UserProfile } from "@/types/domain";

function collection() {
  return getAdminDb().collection("payments");
}

const PAYMENT_TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
  PENDING: ["PAID", "FAILED"],
  PAID: ["REFUNDED"],
  FAILED: ["PENDING"],
  REFUNDED: [],
};

export async function listPayments(user: UserProfile) {
  let query = collection().orderBy("createdAt", "desc");
  if (user.role !== "ADMIN") query = query.where("userId", "==", user.id);

  const snapshot = await query.limit(200).get();
  return snapshot.docs.map((doc) => documentToRecord<PaymentRecord>(doc));
}

export async function getPayment(id: string) {
  const snapshot = await collection().doc(id).get();
  if (!snapshot.exists) return null;
  return documentToRecord<PaymentRecord>(snapshot);
}

export async function upsertPayment(
  input: Omit<PaymentRecord, "id" | "createdAt" | "updatedAt">,
  documentId?: string,
) {
  const resolvedId = documentId ?? input.orderId;
  const ref = resolvedId ? collection().doc(resolvedId) : collection().doc();
  const snapshot = await ref.get();
  const now = FieldValue.serverTimestamp();

  await ref.set(
    {
      ...input,
      createdAt: snapshot.exists ? snapshot.data()?.createdAt ?? now : now,
      updatedAt: now,
    },
    { merge: true },
  );

  return ref.id;
}

export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  options?: { ignoreStaleTransition?: boolean },
) {
  const ref = collection().doc(paymentId);

  await getAdminDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new AppError("Payment not found", 404);

    const payment = snapshot.data();
    if (!payment) throw new AppError("Payment not found", 404);

    const currentStatus = payment.status as PaymentStatus;
    if (currentStatus !== status && !PAYMENT_TRANSITIONS[currentStatus]?.includes(status)) {
      if (options?.ignoreStaleTransition) return;
      throw new AppError(
        `Payment transition ${currentStatus} → ${status} is not allowed`,
        409,
      );
    }

    const bookingRef = getAdminDb()
      .collection("bookings")
      .doc(String(payment.bookingId));
    const bookingSnapshot =
      status === "PAID" ? await transaction.get(bookingRef) : null;

    transaction.update(ref, {
      status,
      paidAt:
        status === "PAID"
          ? payment.paidAt ?? FieldValue.serverTimestamp()
          : payment.paidAt ?? null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const bookingStatus = bookingSnapshot?.data()?.status;
    const canMarkBookingPaid =
      status === "PAID" &&
      bookingSnapshot?.exists &&
      !["CANCELLED", "REJECTED", "COMPLETED"].includes(bookingStatus);

    if (canMarkBookingPaid) {
      transaction.update(bookingRef, {
        status: "PAID",
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  });
}
