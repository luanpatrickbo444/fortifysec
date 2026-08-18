import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/admin/cursos',
        destination: '/admin/content-studio',
        permanent: false,
      },
      {
        source: '/admin/cursos/:path*',
        destination: '/admin/content-studio/:path*',
        permanent: false,
      },
      {
        source: '/empresa/vagas',
        destination: '/empresa/job-console',
        permanent: false,
      },
      {
        source: '/empresa/vagas/:path*',
        destination: '/empresa/job-console/:path*',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
