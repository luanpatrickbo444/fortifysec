import Link from 'next/link';
import {ArrowRight, ArrowUpRight, BriefcaseBusiness, CheckCircle2, ChevronRight, ShieldCheck, UserCheck, Users} from 'lucide-react';

const actions=[
  {href:'/empresas/talentos',index:'01',icon:Users,title:'Descobrir talentos',description:'Explore perfis de participantes que autorizaram a apresentação de suas competências.',action:'Explorar candidatos'},
  {href:'/empresas/selecionados',index:'02',icon:UserCheck,title:'Sua seleção',description:'Organize os profissionais de interesse para as próximas etapas do processo.',action:'Ver selecionados'},
  {href:'/empresas/ctf-empresarial',index:'03',icon:ShieldCheck,title:'CTF Empresarial',description:'Solicite uma avaliação prática e exclusiva, elaborada pela equipe FortifySec.',action:'Solicitar avaliação'},
];
export default function Dashboard(){
  return <div className="fse-dashboard">
    <div className="fse-page-head"><div><p className="fse-eyebrow"><span className="fse-red-dot"/> TALENT INTELLIGENCE PLATFORM</p><h1>Visão geral<span className="fse-red-period">.</span></h1><p className="fse-lead">Encontre talentos em cibersegurança, organize sua seleção e valide habilidades com desafios práticos.</p></div><span className="fse-page-tag"><CheckCircle2 size={15}/> Ambiente corporativo</span></div>
    <section className="fse-hero-panel"><div className="fse-hero-copy"><p className="fse-hero-kicker">FORTIFYSEC / RECRUTAMENTO TÉCNICO</p><h2>Contrate por <em>competência.</em><br/>Não apenas por currículo.</h2><p>Identifique profissionais com base em suas conquistas e solicite avaliações técnicas sob medida para sua empresa.</p><Link href="/empresas/talentos" className="fse-primary-link">Encontrar talentos <ArrowUpRight size={18}/></Link></div><div className="fse-hero-graphic" aria-hidden="true"><div className="fse-ring fse-ring-one"/><div className="fse-ring fse-ring-two"/><div className="fse-ring fse-ring-three"/><div className="fse-hero-emblem"><ShieldCheck size={65} strokeWidth={1.1}/></div><span className="fse-graphic-label">SKILL VERIFIED</span></div></section>
    <div className="fse-section-title"><div><span>01 / FLUXO DE RECRUTAMENTO</span><h2>Seu próximo passo</h2></div><span className="fse-section-aside">Escolha uma ação para começar <ChevronRight size={15}/></span></div>
    <div className="fse-action-grid">{actions.map(({href,index,icon:Icon,title,description,action})=><Link href={href} className="fse-action-card" key={href}><div className="fse-action-top"><div className="fse-action-icon"><Icon size={23}/></div><span>{index} / 03</span></div><h3>{title}</h3><p>{description}</p><div className="fse-action-bottom"><strong>{action}</strong><ArrowRight size={18}/></div></Link>)}</div>
    <div className="fse-bottom-strip"><div className="fse-bottom-icon"><BriefcaseBusiness size={20}/></div><div><strong>Um processo seletivo orientado por evidências.</strong><p>Da descoberta de talentos à avaliação técnica exclusiva, em um único ambiente.</p></div><Link href="/empresas/ctf-empresarial">Conhecer avaliações <ArrowUpRight size={16}/></Link></div>
  </div>;
}
