import fs from 'node:fs'

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const server = fs.readFileSync('lib/supabase/server.ts', 'utf8')
const proxy = fs.readFileSync('lib/supabase/proxy.ts', 'utf8')
const root = fs.readFileSync('app/layout.tsx', 'utf8')

const failures = []
if (pkg.dependencies?.['@supabase/ssr'] !== '0.7.0') failures.push('@supabase/ssr must remain pinned to 0.7.0 until auth migration is revalidated')
if (pkg.dependencies?.['@supabase/supabase-js'] !== '2.57.4') failures.push('@supabase/supabase-js must remain pinned to 2.57.4 until auth migration is revalidated')
if (!proxy.includes('auth.getUser()')) failures.push('protected Proxy must use the known-good getUser() refresh flow')
if (proxy.includes('auth.getClaims()')) failures.push('getClaims() migration is disabled in the compatibility reset')
if (/setAll\s*\(\s*cookiesToSet\s*,/.test(proxy) || /setAll\s*\(\s*cookiesToSet\s*,/.test(server)) failures.push('0.7.x setAll must not use the newer second-argument contract')
if (/supabase|cookies\(|redirect\(/.test(root)) failures.push('public RootLayout must remain auth-free')

if (failures.length) {
  console.error('FortifySec auth compatibility guard FAILED:')
  failures.forEach((f) => console.error(' -', f))
  process.exit(1)
}
console.log('FortifySec auth compatibility guard: OK')
