# Wedding Organizer

Wedding Organizer adalah sistem operasional wedding organizer berbasis web untuk mengelola paket, vendor, booking, timeline acara, pembayaran, galeri, chat, dan profil pengguna.

Arsitektur berfokus pada server-authoritative data access: browser hanya menggunakan Firebase Authentication, sementara seluruh business data diproses melalui Next.js API + Firebase Admin SDK.

## Fitur Utama

- Authentication dan role `ADMIN` / `USER`.
- Paket wedding dan vendor.
- Booking dengan daily capacity.
- Timeline acara per booking.
- Pembayaran Midtrans atau bukti transfer manual.
- Gallery umum dan per-booking.
- Chat per-booking.
- Profil pengguna.
- Cloudinary signed upload.

## Tech Stack

- Next.js 16 App Router
- React 19 + TypeScript
- Firebase Authentication
- Cloud Firestore melalui Firebase Admin SDK
- Cloudinary
- Midtrans Snap opsional
- Zod
- ESLint + GitHub Actions

## Architecture

```text
Browser
├─ Firebase Authentication
└─ Next.js API
   ├─ same-origin mutation guard
   ├─ verified HttpOnly session
   ├─ role/resource authorization
   ├─ Zod validation
   ├─ feature repository / state machine
   └─ Firebase Admin / external provider
```

Browser tidak memiliki direct access ke Firestore business collections. Firestore Rules menggunakan deny-all untuk client read/write.

Detail:
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [ENGINEERING_STANDARD.md](ENGINEERING_STANDARD.md)
- [AGENTS.md](AGENTS.md)

## Security Highlights

- Session cookie HttpOnly.
- Role authoritative dibaca dari server profile.
- Booking price dihitung server.
- Booking capacity diputuskan transactionally.
- Payment status tidak berasal dari free-form browser mutation.
- Midtrans webhook diverifikasi server-side.
- Cloudinary signed upload memakai secret server-only.
- Media URL/public ID divalidasi sebelum disimpan.
- Mutation berbasis session menggunakan same-origin guard.

## Project Structure

```text
src/
├── app/
│   └── api/
├── components/
├── features/
├── lib/
│   ├── auth/
│   ├── cloudinary/
│   └── firebase/
├── styles/
└── types/

docs/
scripts/
migration/
```

## Local Setup

Gunakan Node.js 22 agar konsisten dengan CI.

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Dokumentasi setup:
- [SETUP.md](SETUP.md)
- [MIGRATION_FIRESTORE.md](MIGRATION_FIRESTORE.md)

## Environment

Gunakan `.env.example` sebagai kontrak konfigurasi. Jangan commit `.env.local`, service-account JSON, private key, migration export, backup database, atau bukti pembayaran pengguna.

## Quality Gate

```bash
npm run check
```

Gate repository menjalankan TypeScript, ESLint, dan Next.js production build. GitHub Actions menambahkan deterministic `npm ci`, dependency audit report, dan blocking high/critical vulnerability threshold.

## Operational Commands

```bash
npm run seed
npm run admin:set -- admin@example.com
npm run migrate:media -- migration/legacy-export.json /path/to/old/public
npm run migrate:legacy -- migration/legacy-export-cloudinary.json
```

Seed/migration hanya dijalankan pada environment yang memang membutuhkan bootstrap atau migrasi.

## Documentation

- [AUDIT_REPORT.md](AUDIT_REPORT.md)
- [SETUP.md](SETUP.md)
- [MIGRATION_FIRESTORE.md](MIGRATION_FIRESTORE.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/VALIDATION.md](docs/VALIDATION.md)
- [docs/UI_REDESIGN.md](docs/UI_REDESIGN.md)

## Engineering Rule

Perubahan pada booking capacity, payment, Midtrans webhook, Cloudinary upload, authentication/session, booking ownership, atau role authorization wajib mempertahankan server-side validation dan authorization. Jangan mengembalikan direct Firestore access ke browser.
