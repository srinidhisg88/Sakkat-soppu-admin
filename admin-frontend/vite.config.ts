import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_API_BASE_URL || 'http://localhost:5001/api'
  let target = 'http://localhost:5001'
  try {
    target = new URL(base).origin
  } catch {}

  const isLocalTarget = /^(http:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(target)

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      // Only proxy to local backend; for remote APIs axios uses full baseURL
      proxy: isLocalTarget
        ? {
            '/api': {
              target,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
  }
})
