import { readFileSync, existsSync } from 'node:fs'

const fail = (message) => {
  console.error(`FortifySec auth foundation guard FAILED: ${message}`)
  process.exit(1)
}

const requiredFiles = [
  'proxy.ts',
  'lib/supabase/proxy.ts',
  'lib/supabase/server.ts',
  'app/admin/layout.tsx',
  'app/painel/layout.tsx',
  'app/empresa/layout.tsx',
]

for (const file of requiredFiles) {
  if (!existsSync(file)) fail(`missing ${file}`)
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
if (pkg.dependencies?.['@supabase/ssr'] !== '0.12.4') {
  fail('@supabase/ssr must be pinned to 0.12.4')
}
if (pkg.dependencies?.['@supabase/supabase-js'] !== '2.111.0') {
  fail('@supabase/supabase-js must be pinned to 2.111.0')
}

const proxy = readFileSync('proxy.ts', 'utf8')
if (!proxy.includes('updateSession')) fail('root proxy must delegate to updateSession')
if (proxy.includes("'/admin/cursos'") || proxy.includes("'/empresa/vagas'")) {
  fail('route compatibility redirects must not live in Proxy')
}

const helper = readFileSync('lib/supabase/proxy.ts', 'utf8')
if (!helper.includes('auth.getClaims()')) fail('Supabase Proxy must call auth.getClaims()')
if (!helper.includes('cacheHeaders')) fail('Supabase Proxy must propagate cache headers')

console.log('FortifySec auth foundation guard: OK')
