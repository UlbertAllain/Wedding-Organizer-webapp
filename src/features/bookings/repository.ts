import { FieldValue, Timestamp } from "firebase-admin/firestore";

import type { BookingCreateInput } from "@/features/bookings/schema";
import { BOOKING_TRANSITIONS } from "@/features/bookings/status";
import { BUSINESS_TIME_ZONE } from "@/lib/constants";
import { getServerEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { getAdminDb } from "@/lib/firebase/admin";
import { documentToRecord } from "@/lib/firebase/converters";
import type {
  BookingRecord,
  BookingStatus,
  PackageRecord,
  UserProfile,
  VendorRecord,
} from "@/types/domain";

function collection() { return getAdminDb().collection("bookings"); }
function capacityCollection() { return getAdminDb().collection("bookingCapacity"); }

function dayKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export async function listBookings(user: UserProfile) {
  let query = collection().orderBy("createdAt", "desc");
  if (user.role !== "ADMIN") query = query.where("userId", "==", user.id);
  const snapshot = await query.limit(200).get();
  return snapshot.docs.map((doc) => documentToRecord<BookingRecord>(doc));
}

export async function getBooking(id: string, user: UserProfile) {
  const snapshot = await collection().doc(id).get();
  if (!snapshot.exists) return null;
  const record = documentToRecord<BookingRecord>(snapshot);
  if (user.role !== "ADMIN" && record.userId !== user.id) return null;
  return record;
}

export async function createBooking(user: UserProfile, input: BookingCreateInput) {
  const env = getServerEnv();
  const weddingDate = new Date(input.weddingDate);
  if (Number.isNaN(weddingDate.getTime())) throw new AppError("Invalid wedding date", 400);
  if (weddingDate.getTime() < Date.now()) throw new AppError("Wedding date must be in the future", 400);

  const packageRef = getAdminDb().collection("packages").doc(input.packageId);
  const vendorRefs = input.selectedVendorIds.map((id) => getAdminDb().collection("vendors").doc(id));
  const bookingRef = collection().doc();
  const capacityRef = capacityCollection().doc(dayKey(weddingDate));

  await getAdminDb().runTransaction(async (transaction) => {
    const packageSnapshot = await transaction.get(packageRef);
    if (!packageSnapshot.exists) throw new AppError("Package not found", 404);
    const selectedPackage = documentToRecord<PackageRecord>(packageSnapshot);
    if (!selectedPackage.isActive) throw new AppError("Package is inactive", 409);

    const vendorSnapshots = vendorRefs.length
      ? await transaction.getAll(...vendorRefs)
      : [];
    const vendors = vendorSnapshots.map((snapshot) => {
      if (!snapshot.exists) throw new AppError("One or more vendors do not exist", 404);
      return documentToRecord<VendorRecord>(snapshot);
    });
    if (vendors.some((vendor) => !vendor.isActive)) {
      throw new AppError("One or more vendors are inactive", 409);
    }

    const capacitySnapshot = await transaction.get(capacityRef);
    const reserved = Number(capacitySnapshot.data()?.reserved ?? 0);
    if (reserved >= env.MAX_BOOKINGS_PER_DAY) {
      throw new AppError("Booking capacity for this date is full", 409);
    }

    const vendorTotal = vendors.reduce((sum, vendor) => sum + (vendor.price ?? 0), 0);
    const now = FieldValue.serverTimestamp();

    transaction.set(capacityRef, {
      date: dayKey(weddingDate),
      reserved: reserved + 1,
      updatedAt: now,
    });

    transaction.set(bookingRef, {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      packagePrice: selectedPackage.price,
      status: "PENDING" satisfies BookingStatus,
      weddingDate: Timestamp.fromDate(weddingDate),
      venue: input.venue,
      venueAddress: input.venueAddress,
      theme: input.theme ?? null,
      guestCount: input.guestCount,
      groomName: input.groomName,
      brideName: input.brideName,
      groomPhone: input.groomPhone,
      bridePhone: input.bridePhone,
      ceremonyType: input.ceremonyType,
      notes: input.notes ?? null,
      selectedVendorIds: vendors.map((vendor) => vendor.id),
      vendorTotal,
      totalPrice: selectedPackage.price + vendorTotal,
      capacityKey: dayKey(weddingDate),
      createdAt: now,
      updatedAt: now,
    });
  });

  return bookingRef.id;
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  actor: UserProfile,
) {
  const ref = collection().doc(id);
  await getAdminDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new AppError("Booking not found", 404);
    const booking = snapshot.data();
    if (!booking) throw new AppError("Booking not found", 404);

    if (actor.role !== "ADMIN") {
      const userCanCancel = booking.userId === actor.id && ["PENDING", "CONFIRMED"].includes(booking.status);
      if (!(userCanCancel && status === "CANCELLED")) throw new AppError("Forbidden status transition", 403);
    }

    if (actor.role === "ADMIN" && status !== booking.status) {
      const currentStatus = booking.status as BookingStatus;
      if (!BOOKING_TRANSITIONS[currentStatus].includes(status)) {
        throw new AppError(`Transition ${currentStatus} → ${status} is not allowed`, 409);
      }
    }

    const wasActive = !["REJECTED", "CANCELLED"].includes(booking.status);
    const becomesInactive = ["REJECTED", "CANCELLED"].includes(status);
    const becomesActive = !becomesInactive;

    if (wasActive !== becomesActive && booking.capacityKey) {
      const capacityRef = capacityCollection().doc(String(booking.capacityKey));
      const capacitySnapshot = await transaction.get(capacityRef);
      const reserved = Number(capacitySnapshot.data()?.reserved ?? 0);
      if (becomesActive && reserved >= getServerEnv().MAX_BOOKINGS_PER_DAY) {
        throw new AppError("Booking capacity for this date is full", 409);
      }
      transaction.set(
        capacityRef,
        {
          date: booking.capacityKey,
          reserved: Math.max(0, reserved + (becomesActive ? 1 : -1)),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    transaction.update(ref, { status, updatedAt: FieldValue.serverTimestamp() });
  });
}
