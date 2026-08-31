import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, Check, ShieldCheck, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Plans',
  description: 'Fortify Cloud managed data protection plans for small, mid-sized and critical corporate environments.',
  alternates: { canonical: '/en/plans', languages: { 'pt-BR': '/planos', 'en': '/en/plans' } },
}

const plans=[
 {name:'Essential',code:'SMB PROTECTION',price:'R$ 997',suffix:'/ month',desc:'For small businesses that need to move beyond improvised backup and adopt a managed protection routine.',featured:false,features:['Managed automated backup','Encryption according to the solution','Ransomware protection','File recovery','Basic access control','Monthly report','Periodic recovery test','Support and monitoring']},
 {name:'Business',code:'MANAGED RECOVERY',price:'R$ 2,497',suffix:'/ month',desc:'For mid-sized businesses with more systems, higher criticality and greater operational monitoring requirements.',featured:true,features:['Everything in Essential','Policies by criticality','More data sources and workloads','Recovery runbook','Priority monitoring','Executive + technical report','Extended recovery testing','Periodic capacity review']},
 {name:'Enterprise',code:'CRITICAL INFRA',price:'R$ 5,000+',suffix:'/ month',desc:'For critical, hybrid or highly customized environments with specific availability and governance requirements.',featured:false,features:['Everything in Business','Custom architecture','Multiple destinations/providers','Specific integrations and requirements','Disaster recovery plan','Governance and access matrix','SLA and operating routine defined by contract','Scope sized for the environment']},
]

export default function Plans(){return <main><section className="page-hero pricing-page"><div className="container"><div className="kicker">FORTIFY CLOUD / PLANS</div><h1>Managed protection with straightforward pricing.</h1><p>The final price depends on data volume, technology, retention and criticality. The plan defines the management level; the assessment validates the scope.</p></div></section><section className="section"><div className="container pricing-grid">{plans.map(p=><article className={`pricing-card ${p.featured?'featured':''}`} key={p.name}>{p.featured&&<div className="recommended"><Sparkles size={13}/> RECOMMENDED</div>}<div className="plan-icon">{p.name==='Enterprise'?<Building2/>:<ShieldCheck/>}</div><span className="section-index">{p.code}</span><h2>{p.name}</h2><div className="price"><strong>{p.price}</strong><span>{p.suffix}</span></div><p>{p.desc}</p><div className="plan-features">{p.features.map(x=><span key={x}><Check size={15}/>{x}</span>)}</div><Link className={`btn full ${p.featured?'':'secondary'}`} href="/en/contact">REQUEST A PROPOSAL →</Link></article>)}</div><div className="container plan-disclaimer"><strong>Important:</strong> storage, third-party licenses, data volume, retention, egress and specific services may change the final price. The commercial proposal defines exactly what is included.</div></section></main>}
