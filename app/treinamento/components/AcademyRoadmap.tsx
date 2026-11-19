'use client';
import { ArrowUpRight, BookOpen, Network, Shield, Terminal, Code2, Lock, PlayCircle, Server, Bug, KeyRound } from 'lucide-react';
import type { CSSProperties } from 'react';

type Course={id:number;title:string;description:string;category:string;cover:string};
type Lesson={id:number;course_id:number};
type Props={courses:Course[];lessons:Lesson[];onSelect:(id:number)=>void};
const styles=[
  {icon:Shield,color:'#16c9ff',tag:'DEFESA DIGITAL'},
  {icon:Network,color:'#00d7ea',tag:'INFRAESTRUTURA'},
  {icon:Terminal,color:'#548fff',tag:'SISTEMAS'},
  {icon:Code2,color:'#bc72ff',tag:'DESENVOLVIMENTO'},
  {icon:Lock,color:'#18e6a0',tag:'PROTEÇÃO'},
  {icon:Bug,color:'#ffbf4c',tag:'SEGURANÇA OFENSIVA'},
  {icon:KeyRound,color:'#ff62b6',tag:'CRIPTOGRAFIA'},
  {icon:Server,color:'#fa5368',tag:'ANÁLISE'}
];
function styleFor(title:string,category:string,index:number){
  const s=(title+' '+category).toLowerCase();
  if(/rede|network|infra/.test(s))return styles[1];
  if(/linux|sistema|terminal/.test(s))return styles[2];
  if(/python|programa|código|codigo|dev/.test(s))return styles[3];
  if(/web|aplica/.test(s))return styles[4];
  if(/pentest|hacking|ofensiv/.test(s))return styles[5];
  if(/cripto|senha/.test(s))return styles[6];
  if(/malware|forense/.test(s))return styles[7];
  return styles[index%styles.length];
}
export default function AcademyRoadmap({courses,lessons,onSelect}:Props){
  return <section className="fs-v2-roadmap" aria-label="Trilhas de aprendizagem">
    <div className="fs-v2-section-heading"><span className="fs-v2-eyebrow">FORTIFYSEC LEARNING PATH</span><h2>Trilhas de Aprendizagem</h2><p>Escolha um curso publicado e comece a desenvolver suas habilidades. Novas formações serão adicionadas à medida que forem disponibilizadas.</p><span className="fs-v2-course-total">{courses.length} {courses.length===1?'curso disponível':'cursos disponíveis'}</span></div>
    {courses.length===0?<div className="academy-empty"><BookOpen size={50}/><h2>Novos cursos em preparação</h2><p>Em breve, os primeiros treinamentos gratuitos estarão disponíveis.</p></div>:
    <div className="fs-v2-roadmap-grid">{courses.map((course,index)=>{
      const theme=styleFor(course.title,course.category,index);
      const Icon=theme.icon;
      const total=lessons.filter(l=>l.course_id===course.id).length;
      return <div className="fs-v2-node" key={course.id}><button type="button" className="fs-v2-track" style={{'--track-color':theme.color} as CSSProperties} onClick={()=>onSelect(course.id)} aria-label={`Abrir curso ${course.title}`}>
        <div className="fs-v2-track-illustration">{course.cover?<img src={course.cover} alt="" loading="lazy"/>:<div className="fs-v2-track-graphic"><span className="fs-v2-orbit fs-v2-orbit-a"/><span className="fs-v2-orbit fs-v2-orbit-b"/><Icon size={49} strokeWidth={1.4}/></div>}</div>
        <div className="fs-v2-track-copy"><small>{course.category||theme.tag}</small><h3>{course.title}</h3><span><PlayCircle size={15}/>{total} {total===1?'aula':'aulas'}</span></div><ArrowUpRight className="fs-v2-track-arrow" size={19}/>
      </button></div>;
    })}</div>}
  </section>;
}
