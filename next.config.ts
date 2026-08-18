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
