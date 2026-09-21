# ARCHITECTURE.md

Dokumen architecture detail berada di [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Architecture Summary

Wedding Organizer adalah modular monolith berbasis Next.js App Router dengan server-authoritative data access.

```text
Browser
├─ Firebase Authentication
└─ Next.js API
   ├─ same-origin guard
   ├─ verified HttpOnly session
   ├─ role/resource authorization
   ├─ Zod validation
   ├─ feature repository / state machine
   └─ Firebase Admin / external provider
```

Firestore Security Rules menolak browser read/write ke business data.

## Trust Boundaries

- Firebase ID token hanya dipakai untuk membuat session.
- Role authoritative berasal dari profile server.
- Booking total dihitung server.
- Capacity booking diputuskan transactionally.
- Payment status tidak boleh menjadi free-form client mutation.
- Midtrans webhook diverifikasi server-side.
- Cloudinary credential server-only.
- Media URL/public ID divalidasi sebelum disimpan.

## Structure

```text
src/
├── app/
│   └── api/
├── components/
├── features/
│   └── <feature>/
├── lib/
│   ├── auth/
│   ├── cloudinary/
│   └── firebase/
├── styles/
└── types/
```

## Decision Rule

Jangan melakukan big-bang folder migration hanya untuk keseragaman. Refactor harus memberi manfaat konkret terhadap security, consistency, testability, atau maintainability.
