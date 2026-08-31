import type { Metadata } from 'next'
import { PublicCta } from '@/components/PublicCta'

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Fortify turns backup into an operational recovery capability through assessment, deployment, monitoring and testing.',
  alternates: { canonical: '/en/how-it-works', languages: { 'pt-BR': '/como-funciona', 'en': '/en/how-it-works' } },
}

const phases=[
 {n:'01',tag:'ASSESSMENT',title:'Assessment and criticality',items:['Inventory of data and systems','Criticality classification','Target RPO/RTO','Risks and dependencies','Volume and growth estimate']},
 {n:'02',tag:'DESIGN',title:'Protection architecture',items:['3-2-1 strategy/variations when applicable','Retention by data type','Secondary destination and isolation','Encryption and credentials','Contingency procedures']},
 {n:'03',tag:'DEPLOY',title:'Deployment and baseline',items:['Connect data sources','Schedule backup jobs','Alerts and monitoring','Initial restoration test','Environment documentation']},
 {n:'04',tag:'OPERATE',title:'Continuous operations',items:['Failure monitoring','Alert handling','Monthly reporting','Capacity review','Change management']},
 {n:'05',tag:'RECOVER',title:'Testing and recovery',items:['Periodic tests','Restore evidence','Actual recovery-time measurement','Updated runbook','Support during a real incident']},
]

export default function HowItWorks(){return <main><section className="page-hero"><div className="container"><div className="kicker">FORTIFY CLOUD / METHOD</div><h1>Protection is a process. Not just storage.</h1><p>The Fortify cycle turns backup into an operational recovery capability with clear responsibility and periodic evidence.</p></div></section><section className="section"><div className="container timeline">{phases.map(p=><article key={p.n}><div className="timeline-num">{p.n}</div><div><span className="section-index">{p.tag}</span><h2>{p.title}</h2></div><div className="timeline-items">{p.items.map(x=><span key={x}>{x}</span>)}</div></article>)}</div></section><section className="section alt"><div className="container"><div className="section-head"><div><div className="kicker">SHARED RESPONSIBILITY</div><h2>Fortify manages. The client maintains governance.</h2></div><p className="section-copy">The responsibility matrix is defined during onboarding so it is clear who approves retention, access, backup windows, restorations and changes.</p></div><div className="responsibility-grid"><article><strong>FORTIFY CLOUD</strong><span>Configuration and monitoring</span><span>Alert handling</span><span>Tests and reports</span><span>Recovery support</span></article><article><strong>CLIENT</strong><span>Data ownership and priorities</span><span>Policy approval</span><span>Required access</span><span>Business validation</span></article></div></div></section><PublicCta locale="en"/></main>}
