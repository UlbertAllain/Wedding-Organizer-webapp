# Architecture

## Request flow

```text
Browser
  ├─ Firebase Auth (email/password)
  ├─ POST /api/auth/session with ID token
  │    └─ Firebase Admin verifies token and creates HttpOnly session cookie
  └─ Next.js API
       ├─ requireUser / requireAdmin
       ├─ Zod validation
       ├─ feature repository / transaction
       └─ Firestore Admin SDK
```

Media flow:

```text
Browser → authenticated signature endpoint → direct Cloudinary upload
        → API validates folder/URL and stores secure URL + public ID
```

## Folder contract

```text
src/
├─ app/
│  ├─ api/                 HTTP boundary only
│  ├─ (auth)/              login/register
│  └─ dashboard/           role-aware pages
├─ components/
│  ├─ auth/
│  └─ dashboard/
├─ features/
│  └─ <feature>/
│     ├─ schema.ts         input contract
│     ├─ status.ts         state machine when applicable
│     └─ repository.ts     Firestore queries/transactions
├─ lib/
│  ├─ auth/
│  ├─ cloudinary/
│  └─ firebase/
└─ types/domain.ts
```

## Firestore model

```text
users/{uid}
packages/{packageId}
vendors/{vendorId}
bookings/{bookingId}
bookings/{bookingId}/messages/{messageId}
bookings/{bookingId}/timeline/{timelineId}
bookingCapacity/{YYYY-MM-DD}
payments/{paymentIdOrOrderId}
gallery/{galleryId}
```

## Trust boundaries

- Firebase ID token hanya diterima untuk membuat session.
- Browser tidak dapat membaca/menulis Firestore secara langsung.
- Session cookie HttpOnly tidak dibaca JavaScript.
- Role dibaca dari Firestore pada server.
- API secret Cloudinary dan Midtrans tidak memakai prefix `NEXT_PUBLIC_`.
- Harga total dihitung server dari snapshot package/vendor, bukan dari browser.
- Kapasitas booking diputuskan dalam transaksi database.
- Public ID dan URL Cloudinary divalidasi terhadap folder yang diizinkan sebelum disimpan.

## Denormalization

Firestore bukan relational database. Booking menyimpan snapshot:

- `userName`, `userEmail`
- `packageName`, `packagePrice`
- `vendorTotal`, `totalPrice`

Ini disengaja agar invoice/histori tidak berubah ketika master package atau profil pengguna diubah.

## State machine booking

Transisi status didefinisikan satu kali di `src/features/bookings/status.ts`. UI hanya menampilkan transisi valid, tetapi server tetap memvalidasi ulang. Status `PAID` berasal dari verifikasi pembayaran, bukan pilihan bebas pada tabel booking.

## Deletion policy

- Package/vendor yang sudah direferensikan booking tidak boleh dihapus; nonaktifkan.
- Gallery/media dapat dihapus admin dan cleanup Cloudinary dilakukan best-effort.
- User deletion belum diotomatisasi karena memerlukan kebijakan retensi booking/payment.

## Chat

Chat memakai polling 5 detik. Keputusan ini mengurangi dependency dan cocok untuk volume rendah. Realtime sub-second baru layak ditambahkan jika metrik menunjukkan latency chat mengganggu operasi.

## Timezone

Timestamp disimpan dalam UTC. Penentuan kuota tanggal dan tampilan pengguna memakai zona bisnis `Asia/Jakarta` melalui konstanta bersama.
