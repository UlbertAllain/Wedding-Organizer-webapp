# Seed data Firestore

## 1. Seed katalog paket dan vendor

Pastikan kredensial Firebase Admin pada `.env.local` sudah terisi, lalu jalankan:

```bash
npm run seed:catalog
```

Perintah ini membuat atau memperbarui tiga paket dengan ID tetap:

- `essential`
- `signature`
- `prestige`

Paket `signature` ditandai sebagai rekomendasi. Script juga membuat tiga vendor contoh. Seed bersifat idempoten: menjalankannya kembali memperbarui record yang sama dan tidak membuat duplikat untuk ID seed tersebut.

Script tidak menghapus paket yang sebelumnya dibuat manual melalui dashboard.

## 2. Seed akun user dan booking demo

Tambahkan nilai berikut ke `.env.local`:

```env
SEED_DEMO_EMAIL=demo@example.com
SEED_DEMO_PASSWORD=ganti-password-demo
SEED_DEMO_NAME=Nadia & Arga
SEED_DEMO_PHONE=+62 812 3456 7890
SEED_BOOKING_DATE_ONE=2027-02-14T09:00:00+07:00
SEED_BOOKING_DATE_TWO=2027-06-20T10:00:00+07:00
```

Tanggal harus valid dan masih berada di masa depan. Kemudian jalankan:

```bash
npm run seed:bookings
```

Script membuat atau memperbarui:

- satu akun Firebase Authentication untuk user demo;
- satu profile pada collection `users`;
- dua booking demo;
- counter `bookingCapacity` untuk tanggal booking yang digunakan.

Jalankan katalog lebih dahulu karena booking demo mereferensikan paket dan vendor seed:

```bash
npm run seed:all
```

Jangan gunakan kredensial demo yang lemah pada environment production.
