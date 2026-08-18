import type { NextConfig } from 'next'

const noStoreHeaders = [
  {
    key: 'Cache-Control',
    value: 'private, no-store, no-cache, max-age=0, must-revalidate',
  },
]

const nextConfig: NextConfig = {
  // Compatibility URLs are handled here instead of Proxy. Next.js applies
  // config redirects before Proxy/filesystem routing, which keeps auth refresh
  // independent from route selection.
  async redirects() {
    return [
      {
        source: '/admin/cursos/:path*',
        destination: '/admin/content-studio/:path*',
        permanent: false,
      },
      {
        source: '/empresa/vagas/:path*',
        destination: '/empresa/job-console/:path*',
        permanent: false,
      },
    ]
  },

  async rewrites() {
    return {
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

  // Only authenticated surfaces receive strict no-store headers. Public pages
  // are intentionally left out of this rule to keep their routing path simple.
  async headers() {
    return [
      { source: '/admin/:path*', headers: noStoreHeaders },
      { source: '/painel/:path*', headers: noStoreHeaders },
      { source: '/empresa/:path*', headers: noStoreHeaders },
      { source: '/curso/:path*', headers: noStoreHeaders },
    ]
  },
}

export default nextConfig
