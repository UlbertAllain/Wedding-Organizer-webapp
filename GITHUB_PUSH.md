# Cara Push Refactor ke Repository GitHub Lama

Gunakan branch baru. Jangan langsung menimpa `main` sebelum build dan smoke test lolos.

## Opsi aman — pertahankan history repository

### PowerShell (Windows)

```powershell
git clone https://github.com/UlbertAllain/Wedding-Organizer-webapp.git
cd Wedding-Organizer-webapp
git checkout -b refactor/firebase-firestore

# Backup file lokal penting bila ada, lalu bersihkan file tracked lama
git rm -r .

# Ekstrak ZIP final di folder lain, kemudian salin seluruh isinya ke folder repo ini.
# Jangan menyalin folder .git dari tempat lain.

Copy-Item "D:\PATH\Wedding-Organizer-webapp-final\*" . -Recurse -Force
Copy-Item "D:\PATH\Wedding-Organizer-webapp-final\.github" . -Recurse -Force
Copy-Item "D:\PATH\Wedding-Organizer-webapp-final\.gitignore" . -Force
Copy-Item "D:\PATH\Wedding-Organizer-webapp-final\.env.example" . -Force

npm install
# package-lock.json akan dibuat; pastikan ikut di-commit.
npm run check

git status
git add .
git commit -m "refactor: migrate wedding organizer to Firebase and Cloudinary"
git push -u origin refactor/firebase-firestore
```

Buka Pull Request dari `refactor/firebase-firestore` ke `main`. Review daftar file terhapus dan file baru sebelum merge.

### Bash / Git Bash

```bash
git clone https://github.com/UlbertAllain/Wedding-Organizer-webapp.git
cd Wedding-Organizer-webapp
git checkout -b refactor/firebase-firestore
git rm -r .
cp -a /path/to/Wedding-Organizer-webapp-final/. .
npm install
# package-lock.json akan dibuat; pastikan ikut di-commit.
npm run check
git status
git add .
git commit -m "refactor: migrate wedding organizer to Firebase and Cloudinary"
git push -u origin refactor/firebase-firestore
```

## Merge setelah validasi

```bash
git checkout main
git pull origin main
git merge --no-ff refactor/firebase-firestore
git push origin main
```

Lebih aman melakukan merge melalui Pull Request karena GitHub Actions akan menjalankan typecheck, lint, dan build.

## Jangan pernah di-push

- `.env.local`
- service-account JSON
- Firebase private key
- Cloudinary API secret
- Midtrans server key
- dump database
- `legacy-export.json`
- file bukti pembayaran pengguna

Semua item tersebut sudah dicakup `.gitignore`; tetap periksa `git status` sebelum commit.

## Bila terlanjur menaruh secret di Git

Menghapus file pada commit terbaru tidak cukup. Segera:

1. rotate/revoke secret;
2. hapus dari history dengan `git filter-repo` atau BFG;
3. force-push hanya setelah koordinasi;
4. update seluruh environment deployment.

## Tag versi lama

Sebelum merge, tandai versi lama agar rollback source mudah:

```bash
git checkout main
git pull
git tag legacy-prisma-final
git push origin legacy-prisma-final
```
