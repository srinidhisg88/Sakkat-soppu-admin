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