import fs from 'node:fs'

const proxy = fs.readFileSync('proxy.ts', 'utf8')
const header = fs.readFileSync('components/SiteHeader.tsx', 'utf8')
const auth = fs.readFileSync('lib/auth.ts', 'utf8')

const failures = []

if (proxy.includes("'/login/:path*'") || proxy.includes("'/login'")) {
  failures.push('Proxy matcher must not include /login')
}
if (!proxy.includes("'/painel/:path*'")) failures.push('Proxy must cover /painel')
if (!proxy.includes("pathname === '/admin/login'")) failures.push('Proxy must bypass /admin/login')
if (!proxy.includes("pathname === '/empresa/login'")) failures.push('Proxy must bypass /empresa/login')

for (const forbidden of ['createClient', 'getUser(', 'getSession(', 'onAuthStateChange', 'router.refresh']) {
  if (header.includes(forbidden)) failures.push(`SiteHeader must not contain ${forbidden}`)
}

if (!auth.includes("if (!user) redirect('/admin/login')")) {
  failures.push('requireAdmin must use /admin/login for anonymous admins')
}

if (failures.length) {
  console.error('FortifySec login boundary guard FAILED:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('FortifySec login boundary guard: OK')
