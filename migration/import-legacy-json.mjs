import fs from "node:fs/promises";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const source = process.argv[2] ?? "migration/legacy-export.json";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function asTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Timestamp.fromDate(date);
}

function clean(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  );
}

function parseFeatures(value) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(String).map((item) => item.trim()).filter(Boolean);
    }
  } catch {
    // Legacy value is plain text, not JSON.
  }

  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function dayKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid wedding date: ${value}`);
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const mapped = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${mapped.year}-${mapped.month}-${mapped.day}`;
}

function normalizeBookingStatus(value) {
  const status = String(value ?? "PENDING").toUpperCase();
  const allowed = new Set([
    "PENDING",
    "CONFIRMED",
    "REJECTED",
    "PAID",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ]);

  if (allowed.has(status)) return status;
  if (["PROCESSING", "ACTIVE", "ONGOING"].includes(status)) return "IN_PROGRESS";
  if (["APPROVED", "ACCEPTED"].includes(status)) return "CONFIRMED";

  console.warn(`Unknown booking status "${status}"; mapped to PENDING.`);
  return "PENDING";
}

function normalizePaymentStatus(value) {
  const status = String(value ?? "PENDING").toUpperCase();
  if (["PAID", "SUCCESS", "SETTLEMENT", "CAPTURE"].includes(status)) return "PAID";
  if (["FAILED", "DENY", "DENIED", "EXPIRE", "EXPIRED", "CANCEL"].includes(status)) {
    return "FAILED";
  }
  if (["REFUNDED", "REFUND", "PARTIAL_REFUND"].includes(status)) return "REFUNDED";
  return "PENDING";
}

const raw = JSON.parse(await fs.readFile(source, "utf8"));
const app =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: requiredEnv("FIREBASE_PROJECT_ID"),
      clientEmail: requiredEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: requiredEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
  });
const auth = getAuth(app);
const db = getFirestore(app);
const userIdMap = new Map();

async function write(collectionName, id, data) {
  await db
    .collection(collectionName)
    .doc(String(id))
    .set(clean(data), { merge: true });
}

for (const item of raw.users ?? []) {
  if (!item.email) {
    console.warn(`Skipping user without email: ${item.id}`);
    continue;
  }

  let account;
  try {
    account = await auth.getUserByEmail(item.email);
  } catch {
    account = await auth.createUser({
      email: item.email,
      displayName: item.name ?? "User",
      emailVerified: false,
    });
  }

  userIdMap.set(String(item.id), account.uid);
  await write("users", account.uid, {
    name: item.name ?? account.displayName ?? "User",
    email: item.email,
    phone: item.phone ?? null,
    avatarUrl: item.imageUrl ?? item.avatar ?? item.image ?? null,
    avatarPublicId: item.imagePublicId ?? null,
    role: item.role === "ADMIN" ? "ADMIN" : "USER",
    createdAt: asTimestamp(item.createdAt) ?? Timestamp.now(),
    updatedAt: asTimestamp(item.updatedAt) ?? Timestamp.now(),
    legacyId: item.id,
  });
}

for (const item of raw.packages ?? []) {
  await write("packages", item.id, {
    name: item.name,
    slug:
      item.slug ??
      String(item.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-"),
    description: item.description ?? "Legacy package",
    price: Number(item.price ?? 0),
    features: parseFeatures(item.features),
    imageUrl: item.imageUrl ?? item.image ?? null,
    imagePublicId: item.imagePublicId ?? null,
    isActive: item.isActive ?? true,
    createdAt: asTimestamp(item.createdAt) ?? Timestamp.now(),
    updatedAt: asTimestamp(item.updatedAt) ?? Timestamp.now(),
    legacyId: item.id,
  });
}

for (const item of raw.vendors ?? []) {
  await write("vendors", item.id, {
    name: item.name,
    category: item.category ?? item.type ?? "Lainnya",
    description: item.description ?? null,
    price: item.price == null ? null : Number(item.price),
    contact: item.contact ?? null,
    imageUrl: item.imageUrl ?? item.image ?? null,
    imagePublicId: item.imagePublicId ?? null,
    isActive: item.isActive ?? true,
    createdAt: asTimestamp(item.createdAt) ?? Timestamp.now(),
    updatedAt: asTimestamp(item.updatedAt) ?? Timestamp.now(),
    legacyId: item.id,
  });
}

const capacity = new Map();
for (const item of raw.bookings ?? []) {
  const weddingDate = item.weddingDate ?? item.bookingDetails?.weddingDate;
  if (!weddingDate) {
    console.warn(`Skipping booking without wedding date: ${item.id}`);
    continue;
  }
  if (!item.packageId) {
    console.warn(`Skipping booking without packageId: ${item.id}`);
    continue;
  }

  const capacityKey = dayKey(weddingDate);
  const userId = userIdMap.get(String(item.userId)) ?? String(item.userId);
  const selectedVendorIds = (item.vendors ?? []).map((vendor) =>
    String(vendor.vendorId ?? vendor.vendor?.id ?? vendor.id),
  );
  const vendorTotal = Number(
    item.vendorTotal ??
      (item.vendors ?? []).reduce(
        (sum, vendor) => sum + Number(vendor.vendor?.price ?? 0),
        0,
      ),
  );
  const packagePrice = Number(item.package?.price ?? item.packagePrice ?? 0);
  const status = normalizeBookingStatus(item.status);

  await write("bookings", item.id, {
    userId,
    userName: item.user?.name ?? item.userName ?? "Legacy user",
    userEmail: item.user?.email ?? item.userEmail ?? "",
    packageId: String(item.packageId),
    packageName: item.package?.name ?? item.packageName ?? "Legacy package",
    packagePrice,
    status,
    weddingDate: asTimestamp(weddingDate),
    venue: item.venue ?? item.bookingDetails?.venue ?? "-",
    venueAddress: item.venueAddress ?? item.bookingDetails?.venueAddress ?? "-",
    theme: item.theme ?? item.bookingDetails?.theme ?? null,
    guestCount: Number(item.guestCount ?? item.bookingDetails?.guestCount ?? 1),
    groomName: item.groomName ?? item.bookingDetails?.groomName ?? "-",
    brideName: item.brideName ?? item.bookingDetails?.brideName ?? "-",
    groomPhone: item.groomPhone ?? item.bookingDetails?.groomPhone ?? "-",
    bridePhone: item.bridePhone ?? item.bookingDetails?.bridePhone ?? "-",
    ceremonyType:
      item.ceremonyType ?? item.bookingDetails?.ceremonyType ?? "-",
    notes: item.notes ?? item.bookingDetails?.additionalNotes ?? null,
    selectedVendorIds,
    vendorTotal,
    totalPrice: Number(item.totalPrice ?? packagePrice + vendorTotal),
    capacityKey,
    createdAt: asTimestamp(item.createdAt) ?? Timestamp.now(),
    updatedAt: asTimestamp(item.updatedAt) ?? Timestamp.now(),
    legacyId: item.id,
  });

  for (const timeline of item.timelines ?? []) {
    await db
      .collection("bookings")
      .doc(String(item.id))
      .collection("timeline")
      .doc(String(timeline.id))
      .set(
        {
          bookingId: String(item.id),
          title: timeline.title,
          description: timeline.description ?? null,
          eventTime: asTimestamp(timeline.eventTime),
          isCompleted: timeline.isCompleted ?? false,
          createdAt: asTimestamp(timeline.createdAt) ?? Timestamp.now(),
          updatedAt: asTimestamp(timeline.updatedAt) ?? Timestamp.now(),
          legacyId: timeline.id,
        },
        { merge: true },
      );
  }

  if (!["REJECTED", "CANCELLED"].includes(status)) {
    capacity.set(capacityKey, (capacity.get(capacityKey) ?? 0) + 1);
  }
}

for (const [date, reserved] of capacity) {
  await write("bookingCapacity", date, {
    date,
    reserved,
    updatedAt: Timestamp.now(),
  });
}

for (const item of raw.payments ?? []) {
  const documentId = item.midtransOrderId ?? item.orderId ?? item.id;
  await write("payments", documentId, {
    bookingId: String(item.bookingId),
    userId:
      userIdMap.get(String(item.userId ?? item.booking?.userId)) ??
      String(item.userId ?? item.booking?.userId ?? ""),
    userName: item.userName ?? item.booking?.user?.name ?? "Legacy user",
    amount: Number(item.amount ?? 0),
    provider:
      item.paymentMethod === "MIDTRANS" || item.midtransOrderId
        ? "MIDTRANS"
        : "MANUAL",
    status: normalizePaymentStatus(item.status),
    orderId: item.midtransOrderId ?? item.orderId ?? null,
    paymentUrl: item.midtransSnapUrl ?? item.paymentUrl ?? null,
    proofUrl: item.proofImage ?? item.proofUrl ?? null,
    proofPublicId: item.proofPublicId ?? null,
    paidAt: asTimestamp(item.paidAt),
    createdAt: asTimestamp(item.createdAt) ?? Timestamp.now(),
    updatedAt: asTimestamp(item.updatedAt) ?? Timestamp.now(),
    legacyId: item.id,
  });
}

for (const item of raw.gallery ?? []) {
  const imageUrl = item.imageUrl ?? item.image ?? item.url;
  if (!imageUrl || !item.imagePublicId) {
    console.warn(`Skipping gallery without migrated Cloudinary media: ${item.id}`);
    continue;
  }

  await write("gallery", item.id, {
    bookingId: item.bookingId ?? null,
    imageUrl,
    imagePublicId: item.imagePublicId,
    caption: item.caption ?? null,
    uploadedBy:
      userIdMap.get(String(item.uploadedBy ?? item.userId)) ??
      String(item.uploadedBy ?? item.userId ?? "legacy"),
    createdAt: asTimestamp(item.createdAt) ?? Timestamp.now(),
    legacyId: item.id,
  });
}

for (const item of raw.chatMessages ?? []) {
  if (!item.bookingId) {
    console.warn(`Skipping chat message without bookingId: ${item.id}`);
    continue;
  }

  const bookingId = String(item.bookingId);
  await db
    .collection("bookings")
    .doc(bookingId)
    .collection("messages")
    .doc(String(item.id))
    .set(
      {
        bookingId,
        senderId:
          userIdMap.get(String(item.senderId)) ?? String(item.senderId),
        senderName: item.sender?.name ?? item.senderName ?? "Legacy user",
        senderRole: item.sender?.role === "ADMIN" ? "ADMIN" : "USER",
        message: item.message ?? item.content ?? "",
        createdAt: asTimestamp(item.createdAt) ?? Timestamp.now(),
        legacyId: item.id,
      },
      { merge: true },
    );
}

console.log(
  "Legacy data imported. Existing users should use 'Lupa kata sandi' to establish a Firebase password.",
);
