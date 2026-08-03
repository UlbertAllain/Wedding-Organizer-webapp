# UI/UX Redesign

## Arah visual

Antarmuka dipindahkan dari tampilan admin generik menjadi wedding operations
workspace dengan pendekatan editorial modern. Sistem tetap profesional untuk
operasional, tetapi memiliki identitas visual yang relevan dengan industri
wedding.

## Perubahan utama

- Landing page kini memiliki visual hierarchy lengkap: navigation, editorial
  hero, ilustrasi lokal, trust strip, capability section, workflow, katalog
  paket, CTA, dan footer.
- Dashboard memakai sidebar informatif, contextual topbar, mobile drawer,
  overview berbasis data API, acara terdekat, progress, dan quick actions.
- Login dan register memakai split-screen experience dengan konteks produk,
  manfaat sistem, dan form yang lebih fokus.
- Form, tabel, badge, empty state, galeri, chat, dan timeline menggunakan satu
  design system yang konsisten.
- Seluruh ilustrasi landing bersifat lokal di `public/images/landing`; media
  operasional yang diunggah pengguna tetap melalui Cloudinary.
- Responsiveness mencakup desktop, tablet, dan mobile. Sidebar berubah menjadi
  drawer pada layar kecil.

## File UI utama

- `src/app/globals.css`
- `src/app/page.tsx`
- `src/components/auth/AuthForm.tsx`
- `src/components/dashboard/DashboardShell.tsx`
- `src/components/dashboard/DashboardOverview.tsx`
- `public/images/landing/*.svg`

## Catatan branding

Nama, monogram, copy, dan tone warna masih dibuat netral agar mudah disesuaikan
ke brand wedding organizer tertentu. Tidak ada aset foto pihak ketiga yang
menjadi dependency runtime.
