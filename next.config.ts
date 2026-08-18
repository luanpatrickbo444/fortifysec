import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      // Mantém somente o comportamento já existente da home pública.
      // IMPORTANTE: /admin/cursos NÃO deve ser reescrito.
      // O App Router deve resolver diretamente app/admin/cursos/page.tsx
      // e app/admin/cursos/[id]/page.tsx.
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
