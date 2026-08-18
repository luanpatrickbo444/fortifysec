import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      // Hard guarantee: the public root always renders the Academy content
      // while keeping the browser URL as `/`.
      beforeFiles: [
        {
          source: '/',
          destination: '/academy',
        },
        {
          // Stable internal target for the Admin Content Studio.
          // Keeps the browser URL as /admin/cursos while avoiding stale
          // App Router route state after production deployments.
          source: '/admin/cursos',
          destination: '/admin/content-studio',
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
  async headers() {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },
}

export default nextConfig
