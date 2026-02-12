/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    minimumCacheTTL: 3600, // Cache optimized images for 1 hour
  },
  // Security headers are set in middleware.ts (single source of truth)
  // This ensures nonce-based CSP works correctly with dynamic generation

  // Fix: Next.js 14.1.0 incorrectly uses eval-source-map devtool for middleware
  // bundles even in production builds. The Edge Runtime sandbox disallows eval(),
  // causing "EvalError: Code generation from strings disallowed for this context".
  // Override webpack config to use a non-eval devtool for middleware.
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.devtool = 'source-map'
    }
    return config
  },
}
module.exports = nextConfig
