import {redirect} from 'next/navigation';
import {ShieldCheck, LockKeyhole, Building2} from 'lucide-react';
import {companyContext} from '@/lib/empresas-auth';
import Logout from './logout';
import PortalNav from './portal-nav';
import './portal.css';

export default async function PortalLayout({children}:{children:React.ReactNode}){
  const context=await companyContext();
  if(!context) redirect('/empresas');
  const company=context.company.name;
  return <div className="corp-shell fse-shell">
    <aside className="corp-sidebar fse-sidebar">
      <div className="fse-brand"><div className="fse-brand-icon"><ShieldCheck size={24}/></div><div className="fse-brand-name">FORTIFY<span>SEC</span><small>EMPRESAS</small></div></div>
      <div className="fse-sidebar-line"/>
      <PortalNav/>
      <div className="fse-sidebar-bottom">
        <div className="fse-company"><div className="fse-company-avatar"><Building2 size={19}/></div><div><small>ORGANIZAÇÃO</small><strong title={company}>{company}</strong></div></div>
        <div className="fse-logout"><Logout/></div>
      </div>
    </aside>
    <div className="corp-main fse-main">
      <header className="corp-top fse-top"><div className="fse-breadcrumb"><span>FORTIFYSEC</span><span className="fse-slash">/</span><strong>EMPRESAS</strong></div><div className="fse-top-right"><span className="fse-private"><LockKeyhole size={13}/> Área restrita</span><span className="fse-top-company">{company}</span></div></header>
      <main className="corp-content fse-content">{children}</main>
    </div>
  </div>;
}
