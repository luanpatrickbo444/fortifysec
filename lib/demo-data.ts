export const demoOrg = {
  name: 'Empresa Demonstração', plan: 'Business', health: 98, protected: '2,4 TB', assets: 18,
  lastBackup: 'Hoje, 08:42', nextBackup: 'Hoje, 12:00', recovery: 'Aprovado em 21/08/2026', incidents: 0,
}
export const demoBackups = [
  { source:'ERP / Banco PostgreSQL', target:'Cópia imutável', last:'Hoje 08:42', status:'Protegido', retention:'30 dias' },
  { source:'Servidor de arquivos', target:'Cofre secundário', last:'Hoje 08:31', status:'Protegido', retention:'90 dias' },
  { source:'Microsoft 365', target:'Backup SaaS', last:'Hoje 08:18', status:'Protegido', retention:'1 ano' },
  { source:'VM Financeiro', target:'Snapshot + cópia externa', last:'Ontem 23:57', status:'Atenção', retention:'30 dias' },
]
export const demoAssets = [
  {name:'SRV-ERP-01', type:'Servidor', owner:'Financeiro', policy:'Critical-4H', status:'Protegido'},
  {name:'SRV-FILES-01', type:'Servidor', owner:'Corporativo', policy:'Business-8H', status:'Protegido'},
  {name:'M365-TENANT', type:'SaaS', owner:'Corporativo', policy:'SaaS-Daily', status:'Protegido'},
  {name:'VM-FIN-02', type:'Máquina virtual', owner:'Financeiro', policy:'Critical-4H', status:'Atenção'},
]
export const demoRecovery = [
  {date:'21/08/2026', asset:'SRV-ERP-01', type:'Banco + aplicação', result:'Aprovado', rto:'01h 36m'},
  {date:'07/08/2026', asset:'SRV-FILES-01', type:'Arquivo granular', result:'Aprovado', rto:'18m'},
  {date:'24/07/2026', asset:'M365-TENANT', type:'Mailbox', result:'Aprovado', rto:'09m'},
]
export const demoReports = [
  {month:'Agosto/2026', score:'98%', backups:'99,7%', tests:'3/3', incidents:'0', status:'Disponível'},
  {month:'Julho/2026', score:'96%', backups:'99,4%', tests:'2/2', incidents:'1', status:'Disponível'},
  {month:'Junho/2026', score:'97%', backups:'99,6%', tests:'2/2', incidents:'0', status:'Disponível'},
]
