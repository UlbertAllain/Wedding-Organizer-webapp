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
    description: "Koordinasi inti untuk pernikahan yang ringkas dan terarah.",
    price: 15_000_000,
    features: ["Wedding planning", "Koordinasi hari-H", "Vendor coordination"],
    imageUrl: null,
    imagePublicId: null,
    isActive: true,
  },
  {
    id: "signature",
    name: "Signature",
    slug: "signature",
    description:
      "Perencanaan menyeluruh dengan dukungan vendor dan dokumentasi.",
    price: 30_000_000,
    features: [
      "Full planning",
      "Vendor management",
      "Dokumentasi",
      "Timeline acara",
    ],
    imageUrl: null,
    imagePublicId: null,
    isActive: true,
  },
];

const vendors = [
  {
    id: "photography",
    name: "Photography Partner",
    category: "Dokumentasi",
    description: "Paket foto acara.",
    price: 5_000_000,
    contact: null,
    imageUrl: null,
    imagePublicId: null,
    isActive: true,
  },
  {
    id: "decoration",
    name: "Decoration Partner",
    category: "Dekorasi",
    description: "Dekorasi venue dasar.",
    price: 7_500_000,
    contact: null,
    imageUrl: null,
    imagePublicId: null,
    isActive: true,
  },
];

const batch = db.batch();
for (const item of packages) {
  batch.set(
    db.collection("packages").doc(item.id),
    { ...item, createdAt: now, updatedAt: now },
    { merge: true },
  );
}
for (const item of vendors) {
  batch.set(
    db.collection("vendors").doc(item.id),
    { ...item, createdAt: now, updatedAt: now },
    { merge: true },
  );
}

await batch.commit();
console.log(
  "Seed complete. Review and replace the sample records before production use.",
);
