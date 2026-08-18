import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/admin/cursos', destination: '/admin?view=courses', permanent: false },
      { source: '/admin/content-studio', destination: '/admin?view=courses', permanent: false },
      { source: '/admin/cursos/:id', destination: '/admin?view=course&course=:id', permanent: false },
      { source: '/admin/content-studio/:id', destination: '/admin?view=course&course=:id', permanent: false },
    ]
  },
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
