# AGENTS.md

## Purpose

Aturan kerja untuk developer dan coding agent pada Wedding Organizer.

Baca sebelum coding:
- `ARCHITECTURE.md`
- `ENGINEERING_STANDARD.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`

## Stack

- Next.js 16 + React 19 + TypeScript
- Firebase Authentication
- Firestore via Firebase Admin SDK
- Cloudinary signed upload
- Midtrans optional
- Zod

## Core Flow

```text
Browser
↓
Authenticated API route
↓
Same-origin check for mutation
↓
Verified session
↓
Role/resource authorization
↓
Zod validation
↓
Repository / transaction
↓
Firebase Admin SDK
↓
Firestore
```

Browser tidak boleh mengakses Firestore business collections secara langsung.

## Sensitive Areas

Perubahan pada:
- booking capacity;
- payment;
- Midtrans webhook;
- Cloudinary upload;
- gallery;
- auth/session;
- booking ownership;
- role authorization;

wajib mempertahankan security boundary dan transaction integrity.

## Folder Responsibilities

- `src/app/api/`: HTTP boundary tipis.
- `src/features/`: schema, state machine, repository/domain logic per feature.
- `src/lib/auth/`: verified session + role guards.
- `src/lib/firebase/`: Admin bootstrap/converters.
- `src/lib/cloudinary/`: upload/signature/validation.
- `src/components/`: UI composition.
- `docs/`: architecture, validation, redesign notes.
- `scripts/`: seed/admin operational scripts.

## Rules

- Route handler tidak boleh menjadi tempat business logic besar.
- Jangan percaya total price/status/role dari browser.
- Mutation browser harus same-origin.
- Session cookie HttpOnly.
- Midtrans webhook tidak memakai user session; verifikasi signature dan amount/order.
- Cloudinary URL/public ID harus divalidasi terhadap folder yang diizinkan.
- Firestore Rules tetap deny-all untuk browser business data.
- Jangan commit secret, service account, migration export, atau payment proof.

## Verification

```bash
npm run check
```

CI juga harus memblokir dependency vulnerability level high/critical.
