import { access } from 'node:fs/promises'

const requiredRoutes = [
  'app/painel/page.tsx',
  'app/painel/labs/page.tsx',
  'app/painel/desafios/page.tsx',
  'app/painel/ctf/page.tsx',
  'app/painel/ctf/[id]/page.tsx',
  'app/painel/ranking/page.tsx',
  'app/admin/ctf/page.tsx',
  'app/admin/cursos/page.tsx',
  'app/admin/cursos/[id]/page.tsx',
  'app/admin/content-studio/page.tsx',
]

const missing = []
for (const route of requiredRoutes) {
  try {
    await access(route)
  } catch {
    missing.push(route)
  }
}

if (missing.length) {
  console.error('FortifySec route guard failed. Missing required routes:')
  for (const route of missing) console.error(` - ${route}`)
  process.exit(1)
}

console.log(`FortifySec route guard: ${requiredRoutes.length} required routes OK`)
