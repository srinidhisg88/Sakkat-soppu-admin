# Admin Frontend

React + Vite + TypeScript + Tailwind admin dashboard for Sakkat Soppu.

- Auth via admin login (httpOnly cookie)
- Orders, Products, Farmers management
- axios with withCredentials
- Toasts via react-hot-toast

## Env

Create `.env` (or `.env.local`):

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Scripts

- dev: start Vite dev server
- build: typecheck and build
- preview: preview production build

## Notes

- Dev server proxies `/api` to `VITE_API_BASE_URL` (see `vite.config.ts`).
- Ensure backend sets CORS with `credentials: true` and allows origin of the dev URL.

## Netlify deploy

1. Add this repo to Netlify (New site from Git → pick your repo folder `admin-frontend`).
2. Set build command and publish dir automatically from `netlify.toml` or manually:
	- Build command: `npm run build`
	- Publish directory: `dist`
3. Set environment variable in Site settings → Build & deploy → Environment:
	- `VITE_API_BASE_URL` = your backend API, e.g. `https://sakkat-soppu-be-production.up.railway.app/api`
4. Deploy. Netlify will serve SPA via redirects config in `netlify.toml`.