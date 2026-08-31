import type { Metadata } from 'next'
import { ArchiveRestore, CloudCog, DatabaseBackup, FileKey2, Fingerprint, Radar, ShieldAlert, TestTube2 } from 'lucide-react'
import { PublicCta } from '@/components/PublicCta'

export const metadata: Metadata = {
  title: 'Data Protection Solutions',
  description: 'Managed backup, ransomware resilience, disaster recovery, access control, monitoring and recovery testing.',
  alternates: { canonical: '/en/solutions', languages: { 'pt-BR': '/solucoes', 'en': '/en/solutions' } },
}

const layers=[
 ['01',DatabaseBackup,'Managed backup','Policies by criticality, scheduling, retention and monitoring of backup executions.'],
 ['02',FileKey2,'Encryption','Protection in transit and at rest with appropriate management of credentials and keys.'],
 ['03',ShieldAlert,'Ransomware resilience','External or isolated copies and, when supported, immutability against deletion or modification.'],
 ['04',ArchiveRestore,'Disaster Recovery','Runbooks and prioritization of the systems that must be restored first.'],
 ['05',Fingerprint,'Access control','Least privilege, provider MFA and audit trails.'],
 ['06',Radar,'Monitoring','Visibility into jobs, failures, delays, usage and relevant events.'],
 ['07',TestTube2,'Recovery testing','Planned restoration tests to prove the process and measure actual recovery time.'],
 ['08',CloudCog,'Multi-cloud architecture','The solution is designed around providers and tools suitable for each client, reducing unnecessary lock-in.'],
] as const

export default function Solutions(){return <main><section className="page-hero"><div className="container"><div className="kicker">FORTIFY CLOUD / PROTECTION</div><h1>An operational layer between your data and disaster.</h1><p>Fortify Cloud is a managed service. Storage technology is part of the solution; operations, testing and recovery are the product.</p></div></section><section className="section"><div className="container"><div className="layer-grid">{layers.map(([n,Icon,t,c])=><article key={n}><span className="layer-n">{n}</span><Icon size={23}/><h2>{t}</h2><p>{c}</p></article>)}</div></div></section><section className="section alt"><div className="container split"><div><div className="kicker">TECHNICAL SCOPE</div><h2>What we can protect.</h2><p className="section-copy">The final architecture depends on the environment and the APIs available.</p></div><div className="check-list"><span>Physical and virtual servers</span><span>Databases and applications</span><span>Corporate files and NAS</span><span>Microsoft 365 / Google Workspace*</span><span>Cloud workloads</span><span>Critical endpoints</span><span>System configurations and data</span><span>Hybrid environments</span></div></div></section><PublicCta locale="en"/><p className="fine-print container">* Depending on the tool/provider selected for the project.</p></main>}
