import type { DocumentData, DocumentSnapshot } from "firebase-admin/firestore";

function serializeValue(value: unknown): unknown {
  if (value && typeof value === "object" && "toDate" in value) {
    const timestamp = value as { toDate(): Date };
    return timestamp.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, serializeValue(item)]),
    );
  }

  return value;
}

export function documentToRecord<T>(snapshot: DocumentSnapshot<DocumentData>): T {
  return {
    id: snapshot.id,
    ...(serializeValue(snapshot.data()) as object),
  } as T;
}
