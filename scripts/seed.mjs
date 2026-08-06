import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
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

const db = getFirestore(app);
const now = FieldValue.serverTimestamp();

const packages = [
  {
    id: "essential",
    name: "Essential",
    slug: "essential",
    description:
      "Koordinasi terarah untuk pasangan yang sudah menyiapkan konsep dan vendor utama.",
    price: 12_000_000,
    features: [
      "Wedding Day Coordination",
      "Finalisasi timeline dan rundown",
      "Koordinasi vendor menjelang hari H",
      "Manajemen acara pada hari pernikahan",
    ],
    imageUrl: null,
    imagePublicId: null,
    isActive: true,
    isFeatured: false,
  },
  {
    id: "signature",
    name: "Signature",
    slug: "signature",
    description:
      "Pendampingan lengkap dari penyusunan konsep sampai seluruh rangkaian perayaan selesai.",
    price: 28_000_000,
    features: [
      "Full Wedding Planning",
      "Konsep dan desain pernikahan",
      "Kurasi serta koordinasi vendor",
      "Pendampingan menyeluruh sampai hari H",
    ],
    imageUrl: null,
    imagePublicId: null,
    isActive: true,
    isFeatured: true,
  },
  {
    id: "prestige",
    name: "Prestige",
    slug: "prestige",
    description:
      "Layanan bespoke untuk pernikahan dengan kebutuhan kompleks dan pendampingan intensif.",
    price: 45_000_000,
    features: [
      "Seluruh layanan Signature",
      "Konsep dan styling eksklusif",
      "Vendor premium sesuai kebutuhan",
      "Pendampingan intensif dan personal",
    ],
    imageUrl: null,
    imagePublicId: null,
    isActive: true,
    isFeatured: false,
  },
];

const vendors = [
  {
    id: "photo-cinema",
    name: "Lumière Photo & Cinema",
    category: "Dokumentasi",
    description: "Dokumentasi foto dan cinematic wedding film.",
    price: 8_500_000,
    contact: "+62 812 1000 2001",
    imageUrl: null,
    imagePublicId: null,
    isActive: true,
  },
  {
    id: "decor-floral",
    name: "Maison Floral Styling",
    category: "Dekorasi",
    description: "Styling venue, floral arrangement, dan dekorasi pelaminan.",
    price: 18_000_000,
    contact: "+62 812 1000 2002",
    imageUrl: null,
    imagePublicId: null,
    isActive: true,
  },
  {
    id: "makeup-attire",
    name: "Atelier Bridal",
    category: "Makeup & Attire",
    description: "Makeup pengantin serta konsultasi busana untuk pasangan.",
    price: 7_500_000,
    contact: "+62 812 1000 2003",
    imageUrl: null,
    imagePublicId: null,
    isActive: true,
  },
];

const batch = db.batch();
const existingFeatured = await db.collection("packages").where("isFeatured", "==", true).get();
for (const snapshot of existingFeatured.docs) {
  batch.update(snapshot.ref, { isFeatured: false, updatedAt: now });
}

for (const item of packages) {
  const ref = db.collection("packages").doc(item.id);
  const snapshot = await ref.get();

  batch.set(
    ref,
    {
      ...item,
      createdAt: snapshot.exists ? snapshot.data()?.createdAt ?? now : now,
      updatedAt: now,
    },
    { merge: true },
  );
}

for (const item of vendors) {
  const ref = db.collection("vendors").doc(item.id);
  const snapshot = await ref.get();

  batch.set(
    ref,
    {
      ...item,
      createdAt: snapshot.exists ? snapshot.data()?.createdAt ?? now : now,
      updatedAt: now,
    },
    { merge: true },
  );
}

await batch.commit();
console.log(`Catalog seed complete: ${packages.length} packages and ${vendors.length} vendors.`);
