import { FieldValue } from "firebase-admin/firestore";

import type { PackageInput } from "@/features/packages/schema";
import { AppError } from "@/lib/errors";
import { getAdminDb } from "@/lib/firebase/admin";
import { documentToRecord } from "@/lib/firebase/converters";
import type { PackageRecord } from "@/types/domain";

function collection() {
  return getAdminDb().collection("packages");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizePackage(input: Partial<PackageInput>) {
  return Object.fromEntries(
    Object.entries({
      ...input,
      ...(Object.hasOwn(input, "imageUrl") ? { imageUrl: input.imageUrl ?? null } : {}),
      ...(Object.hasOwn(input, "imagePublicId")
        ? { imagePublicId: input.imagePublicId ?? null }
        : {}),
    }).filter(([, value]) => value !== undefined),
  );
}

async function unfeatureOtherPackages(featuredId: string) {
  const snapshot = await collection().where("isFeatured", "==", true).get();
  const others = snapshot.docs.filter((doc) => doc.id !== featuredId);
  if (!others.length) return;

  const batch = getAdminDb().batch();
  const updatedAt = FieldValue.serverTimestamp();
  for (const doc of others) {
    batch.update(doc.ref, { isFeatured: false, updatedAt });
  }
  await batch.commit();
}

export async function listPackages(options?: { activeOnly?: boolean }) {
  let query = collection().orderBy("createdAt", "desc").limit(100);
  if (options?.activeOnly) query = query.where("isActive", "==", true);

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => documentToRecord<PackageRecord>(doc));
}

export async function getPackage(id: string) {
  const snapshot = await collection().doc(id).get();
  if (!snapshot.exists) return null;
  return documentToRecord<PackageRecord>(snapshot);
}

export async function createPackage(input: PackageInput) {
  const now = FieldValue.serverTimestamp();
  const ref = collection().doc();

  await ref.set({
    ...normalizePackage(input),
    imageUrl: input.imageUrl ?? null,
    imagePublicId: input.imagePublicId ?? null,
    isFeatured: input.isFeatured ?? false,
    slug: slugify(input.name),
    createdAt: now,
    updatedAt: now,
  });

  if (input.isFeatured) await unfeatureOtherPackages(ref.id);
  return ref.id;
}

export async function updatePackage(id: string, input: Partial<PackageInput>) {
  await collection()
    .doc(id)
    .update({
      ...normalizePackage(input),
      ...(input.name ? { slug: slugify(input.name) } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });

  if (input.isFeatured) await unfeatureOtherPackages(id);
}

export async function deletePackage(id: string) {
  const booking = await getAdminDb()
    .collection("bookings")
    .where("packageId", "==", id)
    .limit(1)
    .get();

  if (!booking.empty) {
    throw new AppError(
      "Package is already referenced by a booking. Deactivate it instead.",
      409,
    );
  }

  await collection().doc(id).delete();
}
