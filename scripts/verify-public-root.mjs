import fs from 'node:fs'

const file = 'app/layout.tsx'
const source = fs.readFileSync(file, 'utf8')

const forbidden = [
  "@/lib/auth",
  "@/lib/supabase",
  "@supabase/",
  "site-settings",
  "next/headers",
  "redirect(",
  "cookies(",
  "headers(",
  "getUser(",
  "getClaims(",
]

const found = forbidden.filter((token) => source.includes(token))
if (found.length) {
  console.error(`FortifySec public root guard: forbidden tokens in ${file}: ${found.join(', ')}`)
  process.exit(1)
}

if (/export\s+default\s+async\s+function\s+RootLayout/.test(source)) {
  console.error('FortifySec public root guard: RootLayout must not be async')
  process.exit(1)
}

console.log('FortifySec public root guard: OK')
