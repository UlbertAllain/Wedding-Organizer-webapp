# Design System

## Arah visual

Antarmuka menggunakan pendekatan editorial yang tenang dan fungsional. Tipografi, ruang kosong, garis pemisah, dan foto menjadi pembentuk hierarki utama. Ikon dibatasi untuk navigasi dan tindakan yang benar-benar membutuhkan simbol.

## Token utama

- `--forest`: warna aksi dan navigasi utama.
- `--clay`: aksen editorial, bukan warna dekoratif pada setiap komponen.
- `--paper`: latar aplikasi.
- `--surface`: bidang konten.
- `--line`: pemisah struktur.
- `--font-serif`: headline dan nama acara.
- `--font-sans`: antarmuka dan data operasional.

## Prinsip komponen

1. Card hanya digunakan untuk satu unit informasi yang memang berdiri sendiri.
2. Halaman operasional mengutamakan tabel, list, dan divider.
3. Maksimal dua radius: 8 px untuk kontrol dan 14 px untuk panel.
4. Status memakai warna semantik, bukan warna dekoratif.
5. Copy antarmuka konsisten menggunakan Bahasa Indonesia.
6. Informasi teknis Firebase, Firestore, Cloudinary, dan cookie tidak ditampilkan kepada klien.

## Struktur stylesheet

- `tokens.css`: variabel desain.
- `base.css`: reset, tombol, badge, dan utilitas umum.
- `public.css`: landing page.
- `auth.css`: login dan registrasi.
- `dashboard.css`: shell dan overview.
- `workspace.css`: form, tabel, timeline, galeri, chat, dan state umum.
