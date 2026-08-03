import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { getServerEnv } from "@/lib/env";

const firebaseGlobal = globalThis as typeof globalThis & {
  __weddingOrganizerAdminApp?: App;
  __weddingOrganizerFirestoreConfigured?: boolean;
};

function getAdminApp() {
  if (firebaseGlobal.__weddingOrganizerAdminApp) {
    return firebaseGlobal.__weddingOrganizerAdminApp;
  }

  const existing = getApps()[0];
  if (existing) {
    firebaseGlobal.__weddingOrganizerAdminApp = existing;
    return existing;
  }

  const env = getServerEnv();
  const app = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
  firebaseGlobal.__weddingOrganizerAdminApp = app;
  return app;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  const db = getFirestore(getAdminApp());
  if (!firebaseGlobal.__weddingOrganizerFirestoreConfigured) {
    db.settings({ ignoreUndefinedProperties: true });
    firebaseGlobal.__weddingOrganizerFirestoreConfigured = true;
  }
  return db;
}
