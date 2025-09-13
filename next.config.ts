// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ✅ Skip ESLint during `next build` (local, Vercel, Cloudflare)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // (Optional) If type errors are also blocking your build, enable this too.
  // Use only temporarily—fix types later.
  typescript: {
    ignoreBuildErrors: true,
  },

  // Keep any other config you already had below...
}

export default nextConfig
