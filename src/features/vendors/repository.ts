import { FieldValue } from "firebase-admin/firestore";

import type { VendorInput } from "@/features/vendors/schema";
import { AppError } from "@/lib/errors";
import { getAdminDb } from "@/lib/firebase/admin";
import { documentToRecord } from "@/lib/firebase/converters";
import type { VendorRecord } from "@/types/domain";

function collection() {
  return getAdminDb().collection("vendors");
}

function normalizeVendor(input: Partial<VendorInput>) {
  const nullableKeys = [
    "description",
    "price",
    "contact",
    "imageUrl",
    "imagePublicId",
  ] as const;
  const normalized: Record<string, unknown> = { ...input };

  for (const key of nullableKeys) {
    if (Object.hasOwn(input, key)) normalized[key] = input[key] ?? null;
  }

  return Object.fromEntries(
    Object.entries(normalized).filter(([, value]) => value !== undefined),
  );
}

export async function listVendors(options?: { activeOnly?: boolean }) {
  let query = collection().orderBy("createdAt", "desc").limit(200);
  if (options?.activeOnly) query = query.where("isActive", "==", true);

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => documentToRecord<VendorRecord>(doc));
}

export async function getVendor(id: string) {
  const snapshot = await collection().doc(id).get();
  if (!snapshot.exists) return null;
  return documentToRecord<VendorRecord>(snapshot);
}

export async function createVendor(input: VendorInput) {
  const ref = collection().doc();
  const now = FieldValue.serverTimestamp();

  await ref.set({
    ...normalizeVendor(input),
    description: input.description ?? null,
    price: input.price ?? null,
    contact: input.contact ?? null,
    imageUrl: input.imageUrl ?? null,
    imagePublicId: input.imagePublicId ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return ref.id;
}

export async function updateVendor(id: string, input: Partial<VendorInput>) {
  await collection()
    .doc(id)
    .update({
      ...normalizeVendor(input),
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function deleteVendor(id: string) {
  const booking = await getAdminDb()
    .collection("bookings")
    .where("selectedVendorIds", "array-contains", id)
    .limit(1)
    .get();

  if (!booking.empty) {
    throw new AppError(
      "Vendor is already referenced by a booking. Deactivate it instead.",
      409,
    );
  }

  await collection().doc(id).delete();
}
