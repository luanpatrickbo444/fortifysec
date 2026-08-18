import { existsSync } from 'node:fs'

const required = [
  'app/painel/page.tsx',
  'app/painel/labs/page.tsx',
  'app/painel/desafios/page.tsx',
  'app/painel/ctf/page.tsx',
  'app/painel/ctf/[id]/page.tsx',
  'app/painel/ranking/page.tsx',
  'app/admin/ctf/page.tsx',
  'app/admin/content-studio/page.tsx',
  'app/admin/content-studio/[id]/page.tsx',
  'app/admin/cursos/page.tsx',
  'app/admin/cursos/[id]/page.tsx',
]
const missing = required.filter((file) => !existsSync(file))
if (missing.length) {
  console.error('FortifySec route guard FAILED. Missing required routes:')
  for (const file of missing) console.error(` - ${file}`)
  process.exit(1)
}
console.log(`FortifySec route guard: ${required.length} required routes OK`)
