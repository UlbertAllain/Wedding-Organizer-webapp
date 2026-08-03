# Migrasi Prisma/PostgreSQL ke Firestore + Cloudinary

## Prinsip

Jangan langsung menghapus database lama. Lakukan migrasi dengan urutan:

1. freeze write sementara;
2. export data lama;
3. migrasi file media ke Cloudinary;
4. import data ke Firebase Auth + Firestore;
5. validasi jumlah dan sampel data;
6. pindahkan trafik;
7. simpan database lama read-only selama periode rollback.

## 1. Export dari proyek lama

Salin `migration/export-from-old-project.ts` ke root proyek Prisma lama, lalu jalankan:

```bash
npm install -D tsx
npx tsx export-from-old-project.ts
```

Output: `legacy-export.json`. File dibuat dengan permission owner-only pada sistem yang mendukungnya.

Script tersebut membaca user, package, vendor, booking beserta detail/vendor, payment, gallery, dan chat. **Field password/hash tidak pernah diekspor.** Meskipun demikian, export tetap mengandung data pribadi; jangan commit, kirim melalui chat publik, atau simpan tanpa enkripsi.

> Bila nama relation Prisma pada source lama berbeda, sesuaikan bagian `include` berdasarkan `schema.prisma`. Jangan mengubah database saat export berjalan.

## 2. Pindahkan export ke proyek final

```text
Wedding-Organizer-webapp-final/
└── migration/
    └── legacy-export.json
```

## 3. Migrasi media ke Cloudinary

Bila URL lama menunjuk file lokal di folder `public`, jalankan:

```bash
npm run migrate:media -- migration/legacy-export.json /PATH/KE/PROJECT-LAMA/public
```

Output default:

```text
migration/legacy-export-cloudinary.json
```

Script memperbarui:

- avatar user;
- gambar paket;
- gambar vendor;
- galeri;
- bukti pembayaran.

File yang gagal diunggah dicatat pada `*.failures.json` dan proses keluar dengan status gagal. Periksa laporan tersebut. Item galeri tanpa URL + public ID Cloudinary valid akan dilewati oleh importer agar aplikasi tidak menyimpan media tanpa lifecycle yang dapat dikelola.

## 4. Import Firebase Auth dan Firestore

Pastikan `.env.local` berisi Firebase Admin credentials, lalu:

```bash
npm run migrate:legacy -- migration/legacy-export-cloudinary.json
```

Importer akan:

- mencari user berdasarkan email;
- membuat Firebase Auth account tanpa password bila belum ada;
- membuat map ID user lama → Firebase UID;
- menulis `users/{uid}`;
- mempertahankan ID paket/vendor/booking bila memungkinkan;
- menggabungkan BookingDetail ke dokumen booking;
- memindahkan chat dan timeline ke subcollection booking;
- membangun ulang `bookingCapacity` dari booking aktif;
- menyimpan `legacyId` untuk audit.

Model `Notification` dan `Testimonial` tidak dimigrasikan dengan sengaja karena keduanya dikeluarkan dari core final. Ekspor legacy juga tidak membawa hash password.

## 5. Password pengguna

Hash bcrypt lama tidak dipakai oleh aplikasi final. Akun hasil migrasi yang dibuat tanpa password harus menggunakan tombol **Lupa kata sandi** pada halaman login untuk menetapkan password Firebase.

Jangan mengirim password sementara yang sama ke semua pengguna.

## 6. Mapping data

### User

- Prisma `User.id` → metadata `legacyId`
- Firebase Auth UID → ID dokumen Firestore baru
- `password` lama → tidak disalin
- `role` → `ADMIN` atau `USER`

### Package

- `features` string → `string[]`
- harga → integer rupiah
- image → Cloudinary URL + public ID

### Booking

- `Booking` + `BookingDetail` → satu dokumen
- vendor relation → `selectedVendorIds`
- nama dan harga paket disnapshot
- nama/email pengguna disnapshot

### Payment

- Midtrans order ID dipakai sebagai document ID bila ada
- bukti transfer → Cloudinary

### Chat dan timeline

- chat global → `bookings/{bookingId}/messages/{messageId}`
- timeline global → `bookings/{bookingId}/timeline/{timelineId}`

## 7. Validasi wajib

Bandingkan sebelum dan sesudah:

- jumlah user ber-email valid;
- jumlah paket;
- jumlah vendor;
- jumlah booking per status;
- total nilai booking;
- jumlah payment per status;
- jumlah gallery;
- jumlah chat message;
- booking pada 10 tanggal acak;
- akses gallery per-booking;
- file Cloudinary dapat dibuka.

Gunakan sampel manual, bukan hanya hitungan total.

## 8. Cutover

1. Aktifkan maintenance pada aplikasi lama.
2. Jalankan export delta/final.
3. Jalankan migrasi media dan import final.
4. Validasi.
5. Deploy aplikasi baru.
6. Arahkan domain.
7. Pantau log Firebase, Vercel, Cloudinary, dan Midtrans.

## 9. Pembersihan data migrasi

Setelah cutover tervalidasi dan periode rollback selesai:

1. pindahkan dump PostgreSQL dan export JSON ke penyimpanan backup terenkripsi;
2. hapus `legacy-export*.json` dan `*.failures.json` dari mesin kerja;
3. verifikasi `git status` tidak menampilkan file migrasi atau credential;
4. rotate credential sementara yang digunakan khusus untuk migrasi bila ada.

## 10. Rollback

Rollback valid hanya bila database lama belum menerima write baru setelah cutover. Simpan:

- dump PostgreSQL;
- `legacy-export.json`;
- mapping Cloudinary;
- commit terakhir aplikasi lama;
- waktu cutover.
