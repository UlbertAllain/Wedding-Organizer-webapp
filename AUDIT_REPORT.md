# Audit Teknis Mendalam

## Putusan

Versi lama layak disebut **prototype yang tumbuh lewat penambahan fitur**, bukan sistem production-ready. Masalah utamanya bukan tampilan, melainkan batas tanggung jawab yang kabur: autentikasi, database, realtime, upload, payment, dan aturan bisnis tersebar tanpa satu pola yang konsisten. Hasilnya terlihat lengkap dari menu, tetapi biaya pemeliharaan terlalu tinggi untuk ukuran produknya.

Audit ini dilakukan terhadap struktur dan source yang dapat dibaca dari branch `main` repositori publik. Karena arsip Git tidak dapat di-clone dari lingkungan pengerjaan, paket final ini merupakan **clean replacement yang mempertahankan kapabilitas inti**, bukan patch byte-per-byte terhadap semua file lama.

## Temuan kritis

### 1. Proteksi halaman memberi rasa aman palsu

`middleware.ts` lama melindungi halaman melalui NextAuth, tetapi matcher mengecualikan seluruh `/api`. Ini bukan otomatis salah bila setiap endpoint mempunyai guard sendiri, tetapi di proyek lama tidak ada boundary terpusat yang menjamin konsistensi. Satu handler yang lupa memeriksa session sudah cukup untuk membocorkan operasi backend.

**Perbaikan:** setiap endpoint final memakai `requireUser`, `requireRole`, atau `requireAdmin`. Halaman dashboard juga melakukan guard server-side.

### 2. `PrismaClient` dibuat lebih dari sekali

`lib/auth.ts` membuat instance Prisma sendiri, sementara `lib/prisma.ts` sudah menyiapkan singleton. Pada development/hot reload dan serverless, pola ini memboroskan connection pool dan menambah risiko error koneksi.

**Perbaikan:** Prisma dihapus seluruhnya. Firestore Admin dibuat singleton dari Firebase Admin app.

### 3. Kuota booking rentan race condition

Versi lama menghitung booking pada tanggal tertentu, membandingkan angka hardcoded `3`, lalu membuat booking pada operasi terpisah. Dua request simultan dapat sama-sama membaca kuota tersedia dan keduanya lolos.

**Perbaikan:** dokumen `bookingCapacity/{YYYY-MM-DD}` diperbarui dalam transaksi Firestore yang sama dengan pembuatan booking. Batas dipindahkan ke `MAX_BOOKINGS_PER_DAY`.

### 4. Role hanya hidup di lapisan presentasi

Memisahkan folder `/admin` dan `/user` tidak sama dengan otorisasi. Role harus diverifikasi di boundary backend untuk setiap operasi sensitif.

**Perbaikan:** menu memang role-aware, tetapi API tetap menjadi sumber kebenaran. Pengguna tidak dapat membuat paket/vendor atau mengesahkan pembayaran meskipun memanggil endpoint secara manual.

### 5. Webhook pembayaran harus dianggap input tak terpercaya

Status pembayaran tidak boleh dipercaya hanya karena payload menyebut `settlement` atau `capture`.

**Perbaikan:** webhook final menghitung ulang signature SHA-512 Midtrans dan membandingkannya dengan `timingSafeEqual` sebelum mengubah pembayaran/booking.

### 6. Payment intent tidak boleh dibuat berulang

Versi naif akan membuat order Midtrans baru setiap tombol dibuka/klik diulang. Ini menghasilkan transaksi ganda, rekonsiliasi membingungkan, dan potensi pembayaran pada order yang salah.

**Perbaikan:** satu dokumen payment intent Midtrans dipertahankan per booking. Intent `PENDING` yang masih mempunyai URL digunakan kembali; webhook mencari payment berdasarkan `orderId` yang tersimpan.

### 7. API cookie membutuhkan perlindungan origin

Session cookie HttpOnly tidak cukup untuk seluruh skenario request lintas-origin. Mengandalkan UI atau header yang kebetulan dikirim browser bukan boundary yang eksplisit.

**Perbaikan:** seluruh POST/PATCH/DELETE berbasis session menolak `Sec-Fetch-Site: cross-site` dan memvalidasi header `Origin` terhadap origin request. Webhook Midtrans dikecualikan karena memakai signature provider sebagai trust boundary.

## Kritik struktur lama

### Duplikasi `/admin` dan `/user`

Dua pohon halaman terpisah menyebabkan layout, navigasi, tabel, loading state, dan aturan akses mudah menyimpang. Banyak halaman berbeda hanya pada aksi yang tersedia.

**Keputusan final:** satu `/dashboard`, menu dan aksi ditentukan oleh role. Ini memotong duplikasi tanpa melemahkan keamanan.

### Route handler terlalu dekat dengan database

Validasi, query, aturan bisnis, transformasi data, dan respons HTTP bercampur. Sulit dites dan mudah menghasilkan perilaku berbeda antar endpoint.

**Keputusan final:**

- `src/app/api/**`: boundary HTTP
- `src/features/*/schema.ts`: kontrak input
- `src/features/*/repository.ts`: transaksi/query database
- `src/lib/auth/server.ts`: identitas dan otorisasi
- `src/types/domain.ts`: model data aplikasi

### Model `Booking` + `BookingDetail` berlebihan

Untuk akses utama sistem ini, detail acara selalu dibutuhkan bersama booking. Memisahkannya menambah join, nullable state, dan failure mode tanpa manfaat nyata.

**Keputusan final:** detail acara digabung ke satu dokumen booking. Data paket dan pengguna yang penting disnapshot agar histori tetap benar walau master data berubah.

### `features` sebagai string

Daftar fitur paket disimpan sebagai string sehingga UI harus menebak delimiter dan validasi menjadi buruk.

**Keputusan final:** `features: string[]`.

### Relasi galeri lemah

`uploadedBy` lama berupa string bebas, bukan identitas yang terjaga. Media juga tidak mempunyai lifecycle yang jelas.

**Keputusan final:** `uploadedBy` menyimpan UID, `imageUrl` dan `imagePublicId` disimpan berpasangan, dan delete API menghapus aset Cloudinary.

## Fitur/dependensi yang dibuang

### Pusher dan `pusher-js`

Untuk chat sederhana antara admin dan klien, vendor realtime tambahan berarti secret tambahan, endpoint auth tambahan, biaya tambahan, dan dua sumber failure. Tidak masuk akal sebelum volume percakapan membuktikan kebutuhan realtime sub-second.

**Pengganti:** polling 5 detik pada chat per-booking. Bila skala meningkat, pindahkan ke Firestore listener dengan rules per-user atau layanan realtime khusus setelah ada metrik.

### Timeline dipertahankan

Timeline adalah fitur yang relevan secara operasional: admin dan klien perlu melihat agenda acara yang sama. Pada final, timeline dipindahkan menjadi subcollection setiap booking sehingga boundary aksesnya jelas dan query tidak bercampur antar acara.

### Testimonial ditunda dari core

Testimonial tanpa workflow moderasi, persetujuan publikasi, dan penempatan landing page hanya menjadi CRUD tambahan. Fitur ini sebaiknya dibuat ketika alur meminta ulasan dan moderasi sudah ditentukan, bukan sekadar karena ada model database.

### Model Notification

Notifikasi tanpa delivery channel, preference, read-state workflow yang jelas, dan proses background hanya menjadi tabel mati. Badge di UI bukan sistem notifikasi.

**Keputusan:** dibuang dari core. Status booking/payment sudah terlihat di dashboard.

### `ngrok` sebagai dependency aplikasi

Ngrok adalah alat development, bukan runtime dependency production. Menaruhnya di dependency aplikasi membengkakkan install dan membingungkan deployment.

**Keputusan:** dihapus. Gunakan CLI lokal hanya saat menguji webhook.

### `formidable`

Upload multipart ke server aplikasi memperbesar beban serverless dan membuat lifecycle file sementara rumit.

**Keputusan:** signed direct upload ke Cloudinary. Server hanya membuat signature.

### NextAuth + Prisma adapter + bcrypt

Tiga komponen ini membentuk jalur auth lama yang tidak lagi dibutuhkan setelah migrasi Firebase Authentication. Menyisakannya akan menciptakan dua sumber identitas.

**Keputusan:** dihapus total, bukan dibiarkan “untuk jaga-jaga”.

### Settings generik

Halaman settings yang tidak memiliki schema konfigurasi, audit perubahan, dan dampak runtime hanya menjadi form kosmetik. Konfigurasi bisnis yang benar-benar diperlukan—seperti kuota harian—dipindahkan ke env. Settings baru hanya boleh ditambahkan ketika ada parameter yang memang harus diubah admin tanpa deployment.

### `AGENTS.md` dan `CLAUDE.md`

File instruksi tool/AI tidak dibutuhkan runtime. Bila memang dipakai tim, pindahkan ke dokumentasi engineering internal. Jangan biarkan file tersebut menjadi pengganti README dan ADR.

### README bawaan `create-next-app`

Ini tanda proyek belum memiliki kontrak operasional. Developer baru tidak dapat mengetahui env, data model, role, webhook, atau cara deploy.

**Keputusan:** diganti dokumentasi setup, migrasi, arsitektur, dan push.

## Data model final

- `users/{uid}`
- `packages/{packageId}`
- `vendors/{vendorId}`
- `bookings/{bookingId}`
- `bookings/{bookingId}/messages/{messageId}`
- `bookings/{bookingId}/timeline/{timelineId}`
- `bookingCapacity/{YYYY-MM-DD}`
- `payments/{paymentIdOrOrderId}`
- `gallery/{galleryId}`

Tidak ada koleksi yang dibuat hanya karena “mungkin dipakai nanti”.

## Keputusan efisiensi

1. Satu identitas: Firebase Auth UID.
2. Satu database bisnis: Firestore.
3. Satu media provider: Cloudinary.
4. Satu dashboard: role-aware.
5. Semua write sensitif: server API.
6. Semua input: Zod.
7. Semua tanggal Firestore: `Timestamp`.
8. Harga paket/vendor disnapshot saat booking.
9. Master data yang sudah direferensikan tidak dihapus; dinonaktifkan.
10. Rules Firestore browser di-deny-all karena browser tidak memakai Firestore langsung.

## Hal yang masih wajib diuji sebelum produksi

- Uji end-to-end login, register, logout, reset password.
- Uji dua booking simultan pada tanggal dengan satu slot tersisa.
- Uji callback Midtrans sandbox untuk `settlement`, `expire`, `deny`, dan refund.
- Uji permission seluruh endpoint dengan akun USER dan tanpa session.
- Uji penghapusan gambar Cloudinary lama.
- Uji index Firestore setelah deployment.
- Uji timezone bisnis; sistem menyimpan UTC dan menampilkan tanggal dengan zona Asia/Jakarta.
- Tambahkan rate limiting/WAF pada login-adjacent API dan upload signature sebelum trafik publik besar.

## Penilaian akhir

Versi lama: **fitur cukup, disiplin arsitektur lemah**.

Versi refactor: **lebih kecil, lebih tegas, lebih mudah diaudit**. Tidak mencoba terlihat kompleks. Setiap dependency dan koleksi memiliki alasan operasional yang nyata.
