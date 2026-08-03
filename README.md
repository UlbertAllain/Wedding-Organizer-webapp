# Wedding Organizer — Firestore Refactor

Refactor bersih untuk sistem Wedding Organizer berbasis Next.js App Router, Firebase Authentication, Firestore, Cloudinary, dan Midtrans opsional.

## Tujuan arsitektur

- Satu dashboard berbasis role, tanpa duplikasi pohon halaman admin dan user.
- Firebase Authentication untuk identitas; session cookie HttpOnly untuk autentikasi server.
- Firestore sebagai sumber data tunggal.
- Cloudinary signed upload untuk seluruh gambar.
- Route handler tipis: validasi → otorisasi → repository/service → respons.
- Booking capacity menggunakan transaksi Firestore agar aman dari race condition.
- Midtrans webhook diverifikasi dengan SHA-512 dan `timingSafeEqual`.
- Tidak ada akses Firestore langsung dari browser; semua data bisnis melalui API server.

## Stack

- Next.js 16 + React 19 + TypeScript strict
- Firebase Auth + Firestore Admin SDK
- Cloudinary
- Midtrans Snap (opsional)
- Zod
- ESLint + GitHub Actions

## Modul

- Autentikasi dan role `ADMIN` / `USER`
- Paket
- Vendor
- Booking dan kuota harian
- Timeline acara per booking
- Pembayaran Midtrans atau bukti transfer manual
- Galeri umum / per-booking
- Chat per-booking
- Profil pengguna

## Mulai cepat

```bash
cp .env.example .env.local
npm install
npm run dev
```

Baca dokumen berikut sebelum menjalankan produksi:

- [`SETUP.md`](SETUP.md)
- [`AUDIT_REPORT.md`](AUDIT_REPORT.md)
- [`MIGRATION_FIRESTORE.md`](MIGRATION_FIRESTORE.md)
- [`GITHUB_PUSH.md`](GITHUB_PUSH.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/VALIDATION.md`](docs/VALIDATION.md)

## Quality gate

```bash
npm run typecheck
npm run lint
npm run build
# atau semuanya:
npm run check
```

## Perintah operasional

```bash
npm run seed
npm run admin:set -- admin@example.com
npm run migrate:media -- migration/legacy-export.json /path/to/old/public
npm run migrate:legacy -- migration/legacy-export-cloudinary.json
```

> Jangan commit `.env.local`, service-account JSON, private key, atau kredensial Midtrans/Cloudinary.


## Antarmuka

Versi ini menggunakan editorial wedding design system untuk landing, autentikasi,
dan dashboard. Detail perubahan UI terdapat di [`docs/UI_REDESIGN.md`](docs/UI_REDESIGN.md).
