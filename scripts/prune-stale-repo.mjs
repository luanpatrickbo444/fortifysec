import { readdir, readFile, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const KEEP = new Set([
  "app/academy/page.tsx",
  "app/actions.ts",
  "app/admin/aulas/page.tsx",
  "app/admin/ctf/page.tsx",
  "app/admin/cursos/[id]/page.tsx",
  "app/admin/cursos/page.tsx",
  "app/admin/desafios/page.tsx",
  "app/admin/labs/page.tsx",
  "app/admin/login/page.tsx",
  "app/admin/matriculas/page.tsx",
  "app/admin/pagamentos/page.tsx",
  "app/admin/page.tsx",
  "app/admin/site/page.tsx",
  "app/admin/usuarios/page.tsx",
  "app/api/checkout/route.ts",
  "app/api/webhooks/mercadopago/route.ts",
  "app/atualizar-senha/page.tsx",
  "app/auth/callback/route.ts",
  "app/auth/confirm/route.ts",
  "app/bloqueado/page.tsx",
  "app/cadastro/page.tsx",
  "app/ctf/page.tsx",
  "app/curso/[slug]/page.tsx",
  "app/curso/[slug]/server-actions.ts",
  "app/dashboard/error.tsx",
  "app/dashboard/loading.tsx",
  "app/dashboard/page.tsx",
  "app/globals.css",
  "app/labs/page.tsx",
  "app/layout.tsx",
  "app/login/page.tsx",
  "app/page.tsx",
  "app/painel/ctf/page.tsx",
  "app/painel/cursos/page.tsx",
  "app/painel/desafios/[slug]/page.tsx",
  "app/painel/desafios/error.tsx",
  "app/painel/desafios/layout.tsx",
  "app/painel/desafios/loading.tsx",
  "app/painel/desafios/page.tsx",
  "app/painel/labs/[slug]/page.tsx",
  "app/painel/labs/error.tsx",
  "app/painel/labs/layout.tsx",
  "app/painel/labs/loading.tsx",
  "app/painel/labs/page.tsx",
  "app/painel/layout.tsx",
  "app/painel/pagamentos/page.tsx",
  "app/painel/page.tsx",
  "app/painel/perfil/page.tsx",
  "app/painel/ranking/page.tsx",
  "app/planos/page.tsx",
  "app/recuperar-senha/page.tsx",
  "app/talentos/page.tsx",
  "components/AcademyPublic.tsx",
  "components/DashboardNav.tsx",
  "components/DashboardShell.tsx",
  "components/LogoutButton.tsx",
  "components/SiteHeader.tsx",
  "components/ui/CheckoutForm.tsx",
  "components/ui/DifficultyMeter.tsx",
  "components/ui/SubmitButton.tsx",
  "lib/auth.ts",
  "lib/platform-access.ts",
  "lib/profile-sync.ts",
  "lib/site-settings.ts",
  "lib/supabase/admin.ts",
  "lib/supabase/client.ts",
  "lib/supabase/config.ts",
  "lib/supabase/server.ts"
])
const MANAGED_DIRS = ['app', 'components', 'lib']
const LEGACY_DIRS = ['src', 'pages']
const LEGACY_ROOT_FILES = [
  'middleware.ts','middleware.js','middleware.mjs','middleware.cjs',
  'proxy.js','proxy.mjs','proxy.cjs',
  'next.config.js','next.config.mjs','next.config.cjs',
  'tailwind.config.js','tailwind.config.ts','tailwind.config.mjs','tailwind.config.cjs',
  'postcss.config.js','postcss.config.cjs','postcss.config.ts',
  'vercel.json',
]

async function exists(p) {
  try { await stat(p); return true } catch { return false }
}

async function walk(dir) {
  if (!(await exists(dir))) return []
  const entries = await readdir(dir, { withFileTypes: true })
  const out = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...await walk(full))
    else if (entry.isFile() || entry.isSymbolicLink()) out.push(full)
  }
  return out
}

const removed = []
for (const d of LEGACY_DIRS) {
  const full = path.join(ROOT, d)
  if (await exists(full)) {
    await rm(full, { recursive: true, force: true })
    removed.push(`${d}/`)
  }
}

for (const rel of LEGACY_ROOT_FILES) {
  const full = path.join(ROOT, rel)
  if (await exists(full)) {
    await rm(full, { recursive: true, force: true })
    removed.push(rel)
  }
}

for (const d of MANAGED_DIRS) {
  const base = path.join(ROOT, d)
  for (const full of await walk(base)) {
    const rel = path.relative(ROOT, full).split(path.sep).join('/')
    if (!KEEP.has(rel)) {
      await rm(full, { force: true })
      removed.push(rel)
    }
  }
}

// Hard assertions: never publish without the exact V7.12 CSS pipeline.
const cssPath = path.join(ROOT, 'app/globals.css')
const rootLayoutPath = path.join(ROOT, 'app/layout.tsx')
const painelPath = path.join(ROOT, 'app/painel')
if (!(await exists(cssPath))) throw new Error('[FortifySec prebuild] FATAL: app/globals.css is missing')
if (!(await exists(rootLayoutPath))) throw new Error('[FortifySec prebuild] FATAL: app/layout.tsx is missing')
const rootLayout = await readFile(rootLayoutPath, 'utf8')
if (!rootLayout.includes("import './globals.css'")) {
  throw new Error("[FortifySec prebuild] FATAL: app/layout.tsx must import './globals.css'")
}
let shellRefs = 0
for (const full of await walk(painelPath)) {
  if (!/\.(tsx|ts|jsx|js)$/.test(full)) continue
  const text = await readFile(full, 'utf8')
  shellRefs += (text.match(/<DashboardShell\b/g) || []).length
}
if (shellRefs !== 1) {
  throw new Error(`[FortifySec prebuild] FATAL: expected exactly 1 DashboardShell in app/painel, found ${shellRefs}`)
}

console.log('[FortifySec prebuild] canonical V7.12.7 source prune complete')
if (removed.length) {
  console.log(`[FortifySec prebuild] removed ${removed.length} stale entries:`)
  for (const rel of removed.sort()) console.log(`  - ${rel}`)
} else {
  console.log('[FortifySec prebuild] no stale source entries found')
}
console.log('[FortifySec prebuild] DESIGN ASSERTIONS OK: globals.css + root import + exactly 1 DashboardShell')
