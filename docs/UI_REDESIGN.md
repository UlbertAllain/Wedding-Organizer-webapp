# Editorial UI Redesign

## Putusan desain

Antarmuka lama dibuang sebagai bahasa visual karena terlalu bergantung pada
rounded card, ikon dekoratif, gradient, badge, dan copy teknis. Versi ini
menggunakan pendekatan editorial modern yang lebih dekat dengan studio wedding
profesional.

## Perubahan utama

- Landing page dibangun ulang dengan satu fokus visual, foto editorial, layanan
  bernomor, portfolio, proses kerja, paket dinamis, dan CTA konsultasi.
- Informasi Firebase, Firestore, Cloudinary, cookie, serta status sistem dihapus
  dari halaman yang dilihat klien.
- Login/register menggunakan split layout yang sederhana dan copy yang relevan
  bagi pengguna.
- Dashboard tidak lagi memiliki hero dekoratif, orbit, kartu sparkle, atau
  progress palsu berdasarkan status.
- Overview menampilkan data operasional: acara terdekat, booking aktif,
  pembayaran, dokumentasi, dan aktivitas terbaru.
- Booking form dibagi menjadi tiga bagian agar urutan pengisian lebih jelas.
- Ikon dibatasi untuk navigasi dan aksi penting; konten utama mengandalkan
  tipografi, divider, tabel, list, dan whitespace.
- Stylesheet monolitik dipecah berdasarkan domain agar perubahan berikutnya
  lebih mudah dikendalikan.

## Struktur stylesheet

```text
src/styles/
├── tokens.css
├── base.css
├── public.css
├── auth.css
├── dashboard.css
└── workspace.css
```

## Batas perubahan

Redesign tidak mengubah model Firestore, route API, autentikasi, Cloudinary,
atau integrasi pembayaran. Perubahan berfokus pada presentasi, komposisi,
copywriting, serta pengalaman penggunaan.
