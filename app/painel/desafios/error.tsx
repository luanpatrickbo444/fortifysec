'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ChallengesError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => { console.error('[painel/desafios]', error) }, [error])
  return <div className="internal-route-page"><section className="range-empty-panel route-error-panel"><div className="range-empty-icon"><AlertTriangle size={30}/></div><div><span className="section-index">CHALLENGES / ERROR</span><h2>As missões não puderam ser renderizadas</h2><p>O painel continua ativo. Tente novamente; se persistir, consulte o Runtime Log com o código abaixo.</p><div className="mono route-error-code">{error.digest ? `DIGEST: ${error.digest}` : error.message}</div><button className="btn" type="button" onClick={reset}><RefreshCw size={15}/> TENTAR NOVAMENTE</button></div></section></div>
}
