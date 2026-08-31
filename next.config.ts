import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/academy', destination: '/solucoes', permanent: true },
      { source: '/labs', destination: '/solucoes', permanent: true },
      { source: '/ctf', destination: '/como-funciona', permanent: true },
      { source: '/talentos', destination: '/contato', permanent: true },
      { source: '/vagas', destination: '/contato', permanent: true },
      { source: '/vagas/:path*', destination: '/contato', permanent: true },
      { source: '/empresa', destination: '/contato', permanent: true },
      { source: '/empresa/:path*', destination: '/contato', permanent: true },
      { source: '/curso/:path*', destination: '/solucoes', permanent: true },
      { source: '/painel/cursos/:path*', destination: '/painel', permanent: false },
      { source: '/painel/labs/:path*', destination: '/painel', permanent: false },
      { source: '/painel/desafios/:path*', destination: '/painel', permanent: false },
      { source: '/painel/ctf/:path*', destination: '/painel', permanent: false },
      { source: '/dashboard', destination: '/painel', permanent: false },
    ]
  },
}
export default nextConfig
