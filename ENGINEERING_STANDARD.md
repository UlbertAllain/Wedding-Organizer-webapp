# ENGINEERING_STANDARD.md

## Principles

Gunakan Clean Code, Separation of Concerns, SRP, DRY, KISS, YAGNI, strict TypeScript, runtime validation, dan security-first design.

## API Boundary

Route handler ideal:

```text
same-origin (mutation)
→ auth
→ authorization
→ validation
→ repository/service
→ safe response
```

Jangan memasukkan query/mutation kompleks langsung ke route bila sudah menjadi domain operation.

## Validation

Gunakan Zod untuk request/input.

Server harus menghitung/validasi ulang:
- booking price;
- capacity;
- payment amount;
- state transition;
- media ownership/folder.

## Authentication and Authorization

- Session cookie HttpOnly.
- Role dari Firestore/server profile.
- Resource ownership dicek server.
- USER tidak boleh mengakses booking/payment/gallery milik user lain.
- ADMIN-only action harus tetap memiliki server guard.

## Firestore

Browser business access tetap deny-all.

Untuk state terkait yang harus konsisten, gunakan transaction/batch yang sesuai.

## Cloudinary

- Upload menggunakan authenticated signature endpoint.
- Secret tidak boleh ada di `NEXT_PUBLIC_*`.
- Folder/path harus allowlisted.
- Delete media dilakukan best-effort setelah database authorization berhasil.

## Midtrans

Webhook wajib memverifikasi signature, amount, order ID, dan status mapping. Jangan mengandalkan payload browser untuk menandai pembayaran berhasil.

## Errors

Jangan expose raw Firebase/Admin/Cloudinary/Midtrans error atau secret ke browser.

## Quality Gate

```bash
npm run typecheck
npm run lint
npm run build
```

Atau:

```bash
npm run check
```

CI harus memakai `npm ci` dan memblokir high/critical dependency vulnerability.
