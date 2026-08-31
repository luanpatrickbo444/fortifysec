import type { Metadata } from 'next'
import Link from 'next/link'
import {
  AlertTriangle,
  ArchiveRestore,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Cloud,
  DatabaseBackup,
  FileKey,
  Headphones,
  LockKeyhole,
  Radar,
  RefreshCcw,
  ShieldCheck,
  TestTube2,
  UsersRound,
  Zap,
} from 'lucide-react'
import { PublicCta } from '@/components/PublicCta'

export const metadata: Metadata = {
  title: 'Managed Backup & Data Recovery',
  description: 'Managed backup, ransomware protection, monitoring and tested data recovery for businesses.',
  alternates: {
    canonical: '/en',
    languages: { 'pt-BR': '/', 'en': '/en' },
  },
}

const services = [
  { icon: DatabaseBackup, title: 'Automated backup', copy: 'Policies, retention and backup routines managed and monitored by Fortify.' },
  { icon: LockKeyhole, title: 'Encryption', copy: 'Protection for data in transit and at rest according to the selected technology.' },
  { icon: ShieldCheck, title: 'Ransomware defense', copy: 'External copies and immutability strategies designed to reduce the impact of attacks.' },
  { icon: ArchiveRestore, title: 'Recovery', copy: 'Documented restoration of files, servers, databases and critical workloads.' },
  { icon: UsersRound, title: 'Access control', copy: 'Role-based privileges, traceability and separation between operations and recovery.' },
  { icon: BarChart3, title: 'Executive reports', copy: 'Backup health, failures, capacity, risks and operational recommendations.' },
  { icon: TestTube2, title: 'Recovery tests', copy: 'Periodic restoration tests to prove that protected data can actually be recovered.' },
  { icon: Headphones, title: 'Support & monitoring', copy: 'Operational monitoring and alert handling according to the contracted plan.' },
]

const risks = [
  'Backup stored on the same server as the original data',
  'No one tests whether restoration actually works',
  'A single account can delete everything',
  'Manual copies that depend on someone remembering',
  'No clear reporting for failures or capacity',
  'No documented plan to restore business operations',
]

const plans = [
  { name: 'ESSENTIAL', price: 'R$ 997', audience: 'Small businesses', points: ['Managed backup', 'Monthly report', 'File recovery', 'Support & monitoring'] },
  { name: 'BUSINESS', price: 'R$ 2,497', audience: 'Mid-sized businesses', featured: true, points: ['Everything in Essential', 'Recovery runbook', 'Extended recovery tests', 'Priority monitoring'] },
  { name: 'ENTERPRISE', price: 'R$ 5,000+', audience: 'Critical infrastructure', points: ['Custom architecture', 'Multiple destinations', 'DR & governance', 'Contract-based SLA'] },
]

const steps = [
  ['01', 'ASSESSMENT', 'We map systems, data, risks, RPO and RTO requirements.'],
  ['02', 'DEPLOYMENT', 'We configure backup, retention, encryption and access controls.'],
  ['03', 'MONITORING', 'We monitor failures, capacity and relevant environment events.'],
  ['04', 'RECOVERY TEST', 'We test restoration to validate the recovery process.'],
]

export default function EnglishHome() {
  return <main className="commercial-home">
    <section className="hero hero-commercial"><div className="container hero-grid"><div>
      <div className="kicker">FORTIFY CLOUD / DATA PROTECTION</div>
      <div className="hero-badge"><ShieldCheck size={14}/> MANAGED BACKUP + TESTED RECOVERY</div>
      <h1>IF YOUR COMPANY<br/>LOSES ITS DATA<br/><em>TODAY, CAN IT RECOVER?</em></h1>
      <p className="hero-copy">Fortify protects corporate data with automated backup, secure copies, monitoring and real recovery tests. You are not buying “another drive” — you are contracting a managed data protection operation.</p>
      <div className="hero-actions"><Link className="btn btn-large" href="/en/contact">REQUEST A FREE ASSESSMENT <ArrowRight size={16}/></Link><Link className="btn secondary btn-large" href="/en/plans">VIEW PLANS</Link></div>
      <div className="hero-trust commercial-trust"><span><CheckCircle2/> Managed backup</span><span><CheckCircle2/> Tested recovery</span><span><CheckCircle2/> Monitoring</span></div>
    </div><div className="commercial-visual">
      <div className="risk-alert-card"><div className="risk-alert-head"><AlertTriangle size={18}/><span>INCIDENT SIMULATION</span><b>RANSOMWARE</b></div><div className="risk-alert-body"><div className="incident-row"><span>Production</span><b className="danger-text">UNAVAILABLE</b></div><div className="incident-row"><span>Files</span><b className="danger-text">ENCRYPTED</b></div><div className="incident-row"><span>Immutable copy</span><b className="terminal-green">INTACT</b></div><div className="incident-row"><span>Latest recovery test</span><b className="terminal-green">PASSED</b></div></div><div className="recovery-command"><span>$ fortify recover --priority=critical</span><strong><Zap size={14}/> RECOVERY PATH READY</strong></div></div>
      <div className="floating-proof proof-a"><Radar/><span>MONITORING</span><strong>ACTIVE</strong></div><div className="floating-proof proof-b"><ArchiveRestore/><span>RECOVERY TEST</span><strong>PASSED</strong></div>
    </div></div></section>

    <section className="commercial-strip"><div className="container commercial-strip-grid"><div><Cloud/><strong>Cloud backup</strong><span>managed policies</span></div><div><FileKey/><strong>Encryption</strong><span>protected data</span></div><div><ShieldCheck/><strong>Anti-ransomware</strong><span>isolated copies</span></div><div><RefreshCcw/><strong>Recovery</strong><span>tested restoration</span></div></div></section>

    <section className="section pain-section"><div className="container pain-grid"><div><div className="kicker">THE PROBLEM</div><h2>Having a backup does not mean being protected.</h2><p className="section-copy">The real risk appears when no one knows whether the copy is intact, where it is stored, who can delete it, or how long the company would take to recover.</p><Link href="/en/how-it-works" className="text-link">HOW FORTIFY REDUCES THIS RISK →</Link></div><div className="risk-list">{risks.map(risk=><div key={risk}><AlertTriangle size={16}/><span>{risk}</span></div>)}</div></div></section>

    <section className="section alt"><div className="container"><div className="section-head"><div><div className="kicker">FORTIFY CLOUD</div><h2>A managed data protection layer for your business.</h2></div><p className="section-copy">Fortify can operate on backup and cloud technologies selected for each environment. Our product is the management of protection, visibility and recovery.</p></div><div className="services-grid commercial-services">{services.map((s,i)=>{const Icon=s.icon;return <article className="service-card" key={s.title}><span className="card-index">{String(i+1).padStart(2,'0')}</span><div className="service-icon"><Icon size={21}/></div><h3>{s.title}</h3><p>{s.copy}</p></article>})}</div></div></section>

    <section className="section commercial-process"><div className="container"><div className="section-head"><div><div className="kicker">HOW IT WORKS</div><h2>From assessment to a protected environment.</h2></div><p className="section-copy">You do not need to replace your systems. We design the protection layer around them.</p></div><div className="process-grid process-commercial">{steps.map(([n,t,c])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{c}</p></article>)}</div></div></section>

    <section className="section plan-home-section"><div className="container"><div className="section-head"><div><div className="kicker">PLANS</div><h2>Start with a straightforward managed service.</h2></div><p className="section-copy">The assessment defines volume, retention and technology. The plan defines Fortify's management level.</p></div><div className="home-plan-grid">{plans.map(plan=><article key={plan.name} className={`home-plan-card ${plan.featured?'featured':''}`}>{plan.featured&&<span className="home-plan-tag">RECOMMENDED</span>}<small>{plan.audience}</small><h3>{plan.name}</h3><div className="home-plan-price"><strong>{plan.price}</strong><span>/month</span></div><div className="home-plan-points">{plan.points.map(p=><span key={p}><Check size={14}/>{p}</span>)}</div><Link className={`btn full ${plan.featured?'':'secondary'}`} href="/en/contact">REQUEST A PROPOSAL →</Link></article>)}</div></div></section>

    <section className="section portal-preview-section"><div className="container portal-preview-grid"><div><div className="kicker">CLIENT PORTAL</div><h2>You see what is protected. We manage the rest.</h2><p className="section-copy">Backups, assets, incidents, recovery tests, reports, team and support are consolidated in one portal. Client authentication remains separate from the public website.</p><div className="hero-actions"><Link className="btn" href="/en/contact">PROTECT MY BUSINESS →</Link><Link className="btn secondary" href="/acesso">I'M ALREADY A CLIENT</Link></div></div><div className="portal-preview-card"><div><span>PROTECTION STATUS</span><strong className="terminal-green">ACTIVE</strong></div><div><span>BACKUP SUCCESS</span><strong>99.7%</strong></div><div><span>RECOVERY TEST</span><strong className="terminal-green">PASSED</strong></div><div><span>OPEN INCIDENTS</span><strong>0</strong></div></div></div></section>

    <section className="section final-commercial-cta"><div className="container final-commercial-panel"><div><span className="kicker">INITIAL ASSESSMENT</span><h2>Find out whether your current backup could survive a serious incident.</h2><p>We map your current environment and recommend the most appropriate protection plan.</p></div><div><Link className="btn btn-large" href="/en/contact">TALK TO FORTIFY <ArrowRight size={17}/></Link><Link className="btn secondary" href="/cadastro">START ONBOARDING</Link></div></div></section>

    <PublicCta locale="en"/>
    <p className="fine-print container">* Scope, technologies, retention, storage, SLA and recovery times are defined in the commercial proposal and contract.</p>
  </main>
}
