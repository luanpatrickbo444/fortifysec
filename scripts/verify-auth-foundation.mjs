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
for (const file of requiredFiles) if (!existsSync(file)) fail(`missing ${file}`)

const proxy = readFileSync('proxy.ts', 'utf8')
if (!proxy.includes('updateSession')) fail('root proxy must delegate to updateSession')
if (proxy.includes("'/admin/cursos'") || proxy.includes("'/empresa/vagas'")) {
  fail('route compatibility redirects must not live in Proxy')
}

const helper = readFileSync('lib/supabase/proxy.ts', 'utf8')
if (!helper.includes('createServerClient')) fail('Supabase Proxy helper missing createServerClient')
if (/redirect\s*\(/.test(helper) || helper.includes('NextResponse.redirect')) fail('session refresh helper must never redirect')

console.log('FortifySec auth foundation guard: OK')
