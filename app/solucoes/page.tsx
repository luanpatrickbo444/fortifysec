import { ArchiveRestore, CloudCog, DatabaseBackup, FileKey2, Fingerprint, Radar, ShieldAlert, TestTube2 } from 'lucide-react'
import { PublicCta } from '@/components/PublicCta'
const layers=[
 ['01',DatabaseBackup,'Backup gerenciado','Políticas por criticidade, agenda, retenção e acompanhamento das execuções.'],
 ['02',FileKey2,'Criptografia','Proteção em trânsito e repouso, com gestão adequada de credenciais e chaves.'],
 ['03',ShieldAlert,'Ransomware resilience','Cópias externas/isoladas e, quando suportado, imutabilidade contra exclusão ou alteração.'],
 ['04',ArchiveRestore,'Disaster Recovery','Runbooks e priorização dos sistemas que precisam voltar primeiro.'],
 ['05',Fingerprint,'Controle de acesso','Princípio do menor privilégio, MFA no provedor e trilha de auditoria.'],
 ['06',Radar,'Monitoramento','Visibilidade de jobs, falhas, atraso, consumo e eventos relevantes.'],
 ['07',TestTube2,'Recovery testing','Teste de restauração planejado para comprovar o processo e medir tempo real.'],
 ['08',CloudCog,'Arquitetura multicloud','A solução é desenhada sobre provedores e ferramentas adequados ao cliente, evitando lock-in desnecessário.'],
] as const
export default function Solucoes(){return <main><section className="page-hero"><div className="container"><div className="kicker">FORTIFY CLOUD / PROTEÇÃO</div><h1>Uma camada operacional entre seus dados e o desastre.</h1><p>Fortify Cloud é um serviço gerenciado. A tecnologia de armazenamento é parte da solução; a operação, os testes e a recuperação são o produto.</p></div></section><section className="section"><div className="container"><div className="layer-grid">{layers.map(([n,Icon,t,c])=><article key={n}><span className="layer-n">{n}</span><Icon size={23}/><h2>{t}</h2><p>{c}</p></article>)}</div></div></section><section className="section alt"><div className="container split"><div><div className="kicker">ESCOPO TÉCNICO</div><h2>O que podemos proteger.</h2><p className="section-copy">O desenho final depende do ambiente e das APIs disponíveis.</p></div><div className="check-list"><span>Servidores físicos e virtuais</span><span>Bancos de dados e aplicações</span><span>Arquivos corporativos e NAS</span><span>Microsoft 365 / Google Workspace*</span><span>Workloads em cloud</span><span>Endpoints críticos</span><span>Configurações e dados de sistemas</span><span>Ambientes híbridos</span></div></div></section><PublicCta/><p className="fine-print container">* Conforme ferramenta/provedor selecionado para o projeto.</p></main>}
