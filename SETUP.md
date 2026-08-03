# Panduan Setup

## 1. Prasyarat

- Node.js 20 atau 22
- npm 10+
- Firebase project
- Cloudinary account
- Midtrans account bila pembayaran otomatis dipakai

## 2. Firebase Authentication

1. Buka Firebase Console.
2. Buat atau pilih project.
3. Tambahkan **Web App**.
4. Buka **Authentication → Sign-in method**.
5. Aktifkan **Email/Password**.
6. Salin konfigurasi Web SDK ke variabel `NEXT_PUBLIC_FIREBASE_*`.

## 3. Firestore

1. Buka **Firestore Database**.
2. Buat database dalam production mode.
3. Pilih region yang paling dekat dengan mayoritas pengguna.
4. Install/login Firebase CLI bila belum ada:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
```

5. Deploy rules dan index:

```bash
firebase deploy --only firestore
```

Rules final sengaja menolak akses browser ke seluruh koleksi bisnis. Browser memakai API Next.js; Admin SDK melewati rules dan setiap route memvalidasi session/role.

## 4. Firebase Admin service account

1. Firebase Console → Project Settings → Service accounts.
2. Generate private key.
3. Isi tiga env berikut, jangan commit file JSON:

```env
FIREBASE_PROJECT_ID=project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Private key harus tetap mengandung `\n` ketika dimasukkan ke `.env.local` atau dashboard Vercel.

## 5. Cloudinary

1. Ambil cloud name, API key, dan API secret dari Cloudinary Console.
2. Isi:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=wedding-organizer
```

Upload dilakukan langsung dari browser dengan signature berumur pendek dari server. API secret tidak pernah dikirim ke browser.

## 6. Midtrans opsional

Untuk sandbox:

```env
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Atur Payment Notification URL di Midtrans:

```text
https://DOMAIN-ANDA/api/payments/midtrans/notification
```

Tanpa `MIDTRANS_SERVER_KEY`, tombol pembayaran Midtrans akan mengembalikan status 503; upload bukti transfer manual tetap dapat digunakan.

## 7. Environment lengkap

```bash
cp .env.example .env.local
```

Isi seluruh nilai wajib. Jangan gunakan placeholder untuk runtime nyata.

## 8. Install dan jalankan

```bash
npm install
# Commit package-lock.json yang dihasilkan agar instalasi CI reproducible.
npm run typecheck
npm run lint
npm run dev
```

Buka `http://localhost:3000`.

## 9. Data awal

Seed hanya contoh dan harus ditinjau sebelum produksi:

```bash
npm run seed
```

## 10. Membuat admin pertama

1. Daftarkan akun melalui `/register`, atau buat user di Firebase Authentication.
2. Jalankan:

```bash
npm run admin:set -- admin@example.com
```

3. Logout lalu login kembali.

Role disimpan pada `users/{firebaseUid}`. Jangan mengandalkan menu UI; endpoint admin tetap memvalidasi role di server.

## 11. Quality gate

```bash
npm run check
```

Urutannya: typecheck, lint, lalu production build.

## 12. Deploy Vercel

1. Import repository ke Vercel.
2. Tambahkan semua env dari `.env.local` ke Project Settings → Environment Variables.
3. Ubah `NEXT_PUBLIC_APP_URL` menjadi URL production yang tepat (protokol + domain, tanpa path). Nilai ini dipakai untuk callback pembayaran Midtrans.
4. Deploy.
5. Pasang URL webhook production di Midtrans.
6. Jalankan smoke test dengan akun USER dan ADMIN.

## 13. Checklist production

- Firestore rules dan index sudah deployed.
- Tidak ada service account JSON di repository.
- Cloudinary secret hanya di server environment.
- Midtrans sandbox sudah diuji sebelum production key.
- `NEXT_PUBLIC_APP_URL` sesuai domain final untuk callback pembayaran.
- `package-lock.json` sudah dibuat dan di-commit setelah `npm install`.
- Admin pertama sudah dibuat.
- Package/vendor sample sudah diganti.
- Backup database lama sudah disimpan offline.
