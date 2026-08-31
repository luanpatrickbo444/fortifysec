import type { MetadataRoute } from 'next'
export default function sitemap():MetadataRoute.Sitemap{
  const base='https://www.fortifysec.com.br'
  const paths=['','/solucoes','/como-funciona','/planos','/contato','/privacidade','/termos','/en','/en/solutions','/en/how-it-works','/en/plans','/en/contact']
  return paths.map(path=>({url:`${base}${path}`,lastModified:new Date(),changeFrequency:path===''||path==='/en'?'weekly':'monthly',priority:path===''||path==='/en'?1:.7}))
}
