import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run admin:set -- admin@example.com");
  process.exit(1);
}

const required = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing environment variable: ${key}`);
}

const app = getApps()[0] ?? initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});
const auth = getAuth(app);
const db = getFirestore(app);
const account = await auth.getUserByEmail(email);
const ref = db.collection("users").doc(account.uid);
const snapshot = await ref.get();

await ref.set({
  name: snapshot.data()?.name ?? account.displayName ?? "Administrator",
  email: account.email ?? email,
  phone: snapshot.data()?.phone ?? account.phoneNumber ?? null,
  avatarUrl: snapshot.data()?.avatarUrl ?? account.photoURL ?? null,
  avatarPublicId: snapshot.data()?.avatarPublicId ?? null,
  role: "ADMIN",
  createdAt: snapshot.data()?.createdAt ?? FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp(),
}, { merge: true });

console.log(`Admin role assigned to ${email} (${account.uid})`);
