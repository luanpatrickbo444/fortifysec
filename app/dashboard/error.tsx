'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[dashboard:error-boundary]', error) }, [error])
  return <div className="authwrap"><div className="authcard"><div className="auth-icon"><AlertTriangle size={20}/></div><div className="eyebrow">FORTIFYSEC / DASHBOARD</div><h1>Não foi possível carregar um bloco do painel.</h1><p className="muted">Sua sessão continua ativa. Tente carregar novamente; se o erro persistir, use o código abaixo para localizar a exceção nos Runtime Logs.</p>{error.digest && <p className="mono">ERRO: {error.digest}</p>}<div className="hero-actions"><button className="btn" onClick={reset}><RotateCcw size={15}/> TENTAR NOVAMENTE</button><Link className="btn secondary" href="/painel/cursos">ABRIR ACADEMY</Link></div></div></div>
}
