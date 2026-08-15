import { existsSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()

const stale = [
  'app/painel/cursos/layout.tsx',
  'app/painel/labs/layout.tsx',
  'app/painel/desafios/layout.tsx',
  'app/painel/ctf/layout.tsx',
  'app/painel/ranking/layout.tsx',
  'app/painel/perfil/layout.tsx',
  'app/painel/pagamentos/layout.tsx',
  'components/PanelSectionShell.tsx',
]

for (const rel of stale) {
  const file = resolve(root, rel)
  if (existsSync(file)) {
    rmSync(file, { force: true })
    console.log(`[ui-guard] removed stale file: ${rel}`)
  }
}

const required = [
  'app/globals.css',
  'app/layout.tsx',
  'app/painel/layout.tsx',
  'app/painel/panel.css',
  'components/DashboardShell.tsx',
]

for (const rel of required) {
  const file = resolve(root, rel)
  if (!existsSync(file)) throw new Error(`[ui-guard] missing required UI file: ${rel}`)
}

const globalCss = resolve(root, 'app/globals.css')
const panelCss = resolve(root, 'app/painel/panel.css')
if (statSync(globalCss).size < 20000) throw new Error('[ui-guard] globals.css looks truncated')
if (statSync(panelCss).size < 20000) throw new Error('[ui-guard] panel.css looks truncated')

function ensureCssImport(rel, cssFile) {
  const file = resolve(root, rel)
  let source = readFileSync(file, 'utf8')
  const escaped = cssFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const cssImport = new RegExp(`(?:import|require\\()\\s*['\"][^'\"]*${escaped}['\"]`)

  if (!cssImport.test(source)) {
    source = `import './${cssFile}'\n${source}`
    writeFileSync(file, source, 'utf8')
    console.warn(`[ui-guard] repaired missing ${cssFile} import in ${rel}`)
  } else {
    console.log(`[ui-guard] ${rel} imports ${cssFile}`)
  }
}

ensureCssImport('app/layout.tsx', 'globals.css')
ensureCssImport('app/painel/layout.tsx', 'panel.css')

const panelLayout = readFileSync(resolve(root, 'app/painel/layout.tsx'), 'utf8')
if (!panelLayout.includes('DashboardShell')) {
  throw new Error('[ui-guard] app/painel/layout.tsx is not rendering DashboardShell')
}

const shell = readFileSync(resolve(root, 'components/DashboardShell.tsx'), 'utf8')
for (const token of ['app-shell', 'sidebar', 'app-main', 'DashboardNav']) {
  if (!shell.includes(token)) throw new Error(`[ui-guard] DashboardShell missing ${token}`)
}

console.log('[ui-guard] visual structure OK: globals + panel CSS + single DashboardShell')
