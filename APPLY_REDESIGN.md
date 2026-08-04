# Menerapkan Editorial Redesign

Panduan ini digunakan pada repository Firestore yang sudah berada di branch
`main`.

## 1. Sinkronkan main

```powershell
git switch main
git pull --ff-only origin main
```

Simpan perubahan lokal terlebih dahulu apabila `git status` tidak bersih.

## 2. Buat branch khusus

```powershell
git switch -c redesign/editorial-v2
```

## 3. Terapkan patch UI

Letakkan `wedding-organizer-editorial-ui.patch` sejajar dengan `package.json`,
lalu jalankan:

```powershell
git apply --check .\wedding-organizer-editorial-ui.patch
git apply --whitespace=fix .\wedding-organizer-editorial-ui.patch
Remove-Item .\wedding-organizer-editorial-ui.patch
```

Patch UI tidak menyentuh database, API, environment variable, atau data
Firestore.

## 4. Validasi

```powershell
npm install
npm run check
npm run dev
```

Periksa landing page, login/register, dashboard desktop, dan dashboard mobile.

## 5. Commit dan push

```powershell
git add .
git commit -m "refactor: rebuild wedding organizer editorial interface"
git push -u origin redesign/editorial-v2
```

Buat Pull Request dari `redesign/editorial-v2` menuju `main`.
