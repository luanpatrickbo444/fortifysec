'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {LayoutDashboard, Users, UserCheck, ShieldCheck, ArrowUpRight} from 'lucide-react';
const links = [
  {href:'/empresas/dashboard', label:'Visão geral', icon:LayoutDashboard},
  {href:'/empresas/talentos', label:'Explorar talentos', icon:Users},
  {href:'/empresas/selecionados', label:'Selecionados', icon:UserCheck},
  {href:'/empresas/ctf-empresarial', label:'CTF Empresarial', icon:ShieldCheck},
];
export default function PortalNav(){
  const pathname=usePathname();
  return <nav className="fse-nav" aria-label="Navegação empresarial">
    <p className="fse-nav-label">WORKSPACE</p>
    {links.map(({href,label,icon:Icon})=>{
      const active=pathname===href || pathname.startsWith(href+'/');
      return <Link key={href} href={href} className={'fse-nav-link'+(active?' is-active':'')} aria-current={active?'page':undefined}>
        <Icon size={18} strokeWidth={1.8}/><span>{label}</span>{active&&<ArrowUpRight size={15} className="fse-nav-arrow"/>}
      </Link>;
    })}
  </nav>;
}
