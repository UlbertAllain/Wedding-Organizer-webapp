import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function optionalEnv(name, fallback) {
  return process.env[name]?.trim() || fallback;
}

function futureDate(name, fallback) {
  const value = optionalEnv(name, fallback);
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${name} must be a valid ISO date.`);
  }

  if (date.getTime() <= Date.now()) {
    throw new Error(`${name} must be in the future. Current value: ${value}`);
  }

  return date;
}

function jakartaDayKey(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

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
const email = requiredEnv("SEED_DEMO_EMAIL").toLowerCase();
const password = requiredEnv("SEED_DEMO_PASSWORD");
const name = optionalEnv("SEED_DEMO_NAME", "Nadia & Arga");
const phone = optionalEnv("SEED_DEMO_PHONE", "+62 812 3456 7890");

if (password.length < 8) {
  throw new Error("SEED_DEMO_PASSWORD must contain at least 8 characters.");
}

let account;
try {
  account = await auth.getUserByEmail(email);
  account = await auth.updateUser(account.uid, { displayName: name, password });
} catch (error) {
  if (error?.code !== "auth/user-not-found") throw error;
  account = await auth.createUser({ email, password, displayName: name, emailVerified: true });
}

const userRef = db.collection("users").doc(account.uid);
const userSnapshot = await userRef.get();
const now = FieldValue.serverTimestamp();

await userRef.set(
  {
    name,
    email,
    phone,
    avatarUrl: null,
    avatarPublicId: null,
    role: "USER",
    createdAt: userSnapshot.exists ? userSnapshot.data()?.createdAt ?? now : now,
    updatedAt: now,
  },
  { merge: true },
);

const bookingSeeds = [
  {
    id: "demo-booking-signature",
    packageId: "signature",
    vendorIds: ["photo-cinema", "decor-floral"],
    weddingDate: futureDate("SEED_BOOKING_DATE_ONE", "2027-02-14T09:00:00+07:00"),
    status: "CONFIRMED",
    venue: "The Garden Hall",
    venueAddress: "Jl. Contoh Perayaan No. 18, Jakarta",
    theme: "Romantic garden",
    guestCount: 350,
    groomName: "Arga Pratama",
    brideName: "Nadia Larasati",
    groomPhone: phone,
    bridePhone: phone,
    ceremonyType: "Akad dan resepsi",
    notes: "Seed booking untuk pengujian dashboard dan alur pembayaran.",
  },
  {
    id: "demo-booking-essential",
    packageId: "essential",
    vendorIds: ["makeup-attire"],
    weddingDate: futureDate("SEED_BOOKING_DATE_TWO", "2027-06-20T10:00:00+07:00"),
    status: "PENDING",
    venue: "Serene Ballroom",
    venueAddress: "Jl. Contoh Bahagia No. 27, Bandung",
    theme: "Modern classic",
    guestCount: 500,
    groomName: "Arga Pratama",
    brideName: "Nadia Larasati",
    groomPhone: phone,
    bridePhone: phone,
    ceremonyType: "Pemberkatan dan resepsi",
    notes: "Seed booking kedua untuk menguji daftar dan status booking.",
  },
];

for (const seed of bookingSeeds) {
  const packageRef = db.collection("packages").doc(seed.packageId);
  const vendorRefs = seed.vendorIds.map((id) => db.collection("vendors").doc(id));
  const bookingRef = db.collection("bookings").doc(seed.id);
  const capacityKey = jakartaDayKey(seed.weddingDate);
  const capacityRef = db.collection("bookingCapacity").doc(capacityKey);

  await db.runTransaction(async (transaction) => {
    const packageSnapshot = await transaction.get(packageRef);
    if (!packageSnapshot.exists) {
      throw new Error(`Package ${seed.packageId} not found. Run npm run seed:catalog first.`);
    }

    const vendorSnapshots = vendorRefs.length
      ? await transaction.getAll(...vendorRefs)
      : [];
    const missingVendor = vendorSnapshots.find((snapshot) => !snapshot.exists);
    if (missingVendor) {
      throw new Error(`Vendor ${missingVendor.id} not found. Run npm run seed:catalog first.`);
    }

    const bookingSnapshot = await transaction.get(bookingRef);
    const capacitySnapshot = await transaction.get(capacityRef);
    const packageData = packageSnapshot.data();
    const vendors = vendorSnapshots.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }));
    const vendorTotal = vendors.reduce((total, vendor) => total + Number(vendor.price ?? 0), 0);
    const packagePrice = Number(packageData?.price ?? 0);

    if (!bookingSnapshot.exists) {
      transaction.set(
        capacityRef,
        {
          date: capacityKey,
          reserved: Number(capacitySnapshot.data()?.reserved ?? 0) + 1,
          updatedAt: now,
        },
        { merge: true },
      );
    }

    transaction.set(
      bookingRef,
      {
        userId: account.uid,
        userName: name,
        userEmail: email,
        packageId: packageSnapshot.id,
        packageName: String(packageData?.name ?? seed.packageId),
        packagePrice,
        status: seed.status,
        weddingDate: Timestamp.fromDate(seed.weddingDate),
        venue: seed.venue,
        venueAddress: seed.venueAddress,
        theme: seed.theme,
        guestCount: seed.guestCount,
        groomName: seed.groomName,
        brideName: seed.brideName,
        groomPhone: seed.groomPhone,
        bridePhone: seed.bridePhone,
        ceremonyType: seed.ceremonyType,
        notes: seed.notes,
        selectedVendorIds: vendors.map((vendor) => vendor.id),
        vendorTotal,
        totalPrice: packagePrice + vendorTotal,
        capacityKey,
        seededBy: "scripts/seed-bookings.mjs",
        createdAt: bookingSnapshot.exists ? bookingSnapshot.data()?.createdAt ?? now : now,
        updatedAt: now,
      },
      { merge: true },
    );
  });
}

console.log(`Booking seed complete for ${email}.`);
console.log(`Login with SEED_DEMO_EMAIL and SEED_DEMO_PASSWORD.`);
