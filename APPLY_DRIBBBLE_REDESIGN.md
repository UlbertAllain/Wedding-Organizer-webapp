# Apply Dribbble-inspired redesign

This patch is intended for the Firestore editorial baseline previously delivered for this repository.

## Safe workflow

```powershell
git switch main
git pull --ff-only origin main
git status
git switch -c redesign/dribbble-studio
```

Place `wedding-organizer-dribbble-studio.patch` beside `package.json`, then run:

```powershell
git apply --check ".\wedding-organizer-dribbble-studio.patch"
git apply --whitespace=fix ".\wedding-organizer-dribbble-studio.patch"
Remove-Item ".\wedding-organizer-dribbble-studio.patch"
```

Validate locally:

```powershell
npm install
npm run lint
npm run typecheck
npm run build
npm run dev
```

Commit only after the application has been checked:

```powershell
git add .
git commit -m "refactor: apply Dribbble-inspired wedding studio interface"
git push -u origin redesign/dribbble-studio
```

Then create a pull request into `main`.

## Files changed

- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/components/auth/AuthForm.tsx`
- `src/components/dashboard/DashboardShell.tsx`
- `src/components/dashboard/DashboardOverview.tsx`
- `src/styles/tokens.css`
- `src/styles/base.css`
- `src/styles/public.css`
- `src/styles/auth.css`
- `src/styles/dashboard.css`
- `src/styles/workspace.css`
- `docs/DRIBBBLE_DIRECTION.md`

Backend APIs, Firebase Auth, Firestore repositories, Cloudinary integration, and Midtrans logic are not changed.
