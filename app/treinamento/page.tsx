'use client';import {useEffect,useState} from 'react';import Link from 'next/link';import AITutor from './components/AITutor';import {ArrowLeft,ArrowUpRight,BookOpen,PlayCircle,ShieldCheck,Clock} from 'lucide-react';type Course={id:number;title:string;description:string;category:string;cover:string};type Lesson={id:number;course_id:number;module:string;title:string;description:string;video:string;duration:string;position:number};
export default function Training(){const [courses,setCourses]=useState<Course[]>([]),[lessons,setLessons]=useState<Lesson[]>([]),[selected,setSelected]=useState<Lesson|null>(null),[courseId,setCourseId]=useState<number|null>(null);const [loadingAcademy,setLoadingAcademy]=useState(true);
const [academyError,setAcademyError]=useState('');

useEffect(()=>{
  const controller=new AbortController();

  async function load(){
    setLoadingAcademy(true);
    setAcademyError('');

    try{
      const response=await fetch('/api/academy',{
        signal:controller.signal
      });

      if(!response.ok) throw new Error('Falha ao carregar cursos');

      const data=await response.json();

      if(!Array.isArray(data.courses)||!Array.isArray(data.lessons)){
        throw new Error('Resposta inválida da Academy');
      }

      if(!controller.signal.aborted){
        setCourses(data.courses);
        setLessons(data.lessons);
      }
    }catch(error){
      if(!controller.signal.aborted){
        setAcademyError('Não foi possível carregar os cursos. Tente novamente.');
      }
    }finally{
      if(!controller.signal.aborted) setLoadingAcademy(false);
    }
  }

  void load();
  return ()=>controller.abort();
},[]);useEffect(()=>{
  if(courseId!==null && !selected && lessons.length){
    const first=lessons.find(l=>l.course_id===courseId);
    if(first) setSelected(first);
  }
},[courseId,selected,lessons]);
const active=courses.find(c=>c.id===courseId);const current=lessons.filter(l=>l.course_id===courseId);return <main className="academy-public"><header className="academy-header"><div><img src="/images/fortifysec-escudo.png" alt="FortifySec" className="fs-official-small" /><strong>FORTIFY<span>SEC</span> / ACADEMY</strong></div><nav><Link href="/">Site principal</Link><a href="https://arena.fortifysec.com.br/" target="_blank" rel="noreferrer">Validar na Arena <ArrowUpRight size={16}/></a></nav></header><div className="academy-container"><Link href="/" className="academy-back"><ArrowLeft size={16}/> Voltar para FortifySec</Link><div className="academy-top"><div><small>FORMAÇÃO GRATUITA EM CIBERSEGURANÇA</small><h1>FortifySec Academy</h1><p>Aprenda com videoaulas. Depois, valide seus conhecimentos na Arena.</p></div><BookOpen size={55} color="#e72834"/></div>{loadingAcademy ? (
  <div className="academy-loading" role="status" aria-live="polite">
    <span className="fs-spinner" aria-hidden="true"/>
    <p>Carregando cursos e aulas...</p>
  </div>
) : academyError ? (
  <div className="academy-empty" role="alert">
    <h2>Não foi possível carregar a Academy</h2>
    <p>{academyError}</p>
    <button
      type="button"
      className="academy-btn"
      onClick={()=>window.location.reload()}
    >
      Tentar novamente
    </button>
  </div>
) : active?<><button className="academy-back" onClick={()=>{setCourseId(null);setSelected(null)}}><ArrowLeft size={16}/> Todos os cursos</button><h2 className="academy-title">{active.title}</h2><p className="academy-muted">{active.description}</p><div className="academy-learning"><div className="academy-player">{selected?.video?<><video controls controlsList="nodownload" key={selected.id} src={selected.video} playsInline preload="metadata"/><div className="academy-video-info"><small>{selected.module}</small><h2>{selected.title}</h2><p>{selected.description}</p></div></>:<div className="academy-empty"><PlayCircle size={55}/><h2>Escolha uma videoaula</h2><p>Selecione uma aula na lista para começar.</p></div>}</div><aside className="academy-playlist"><h3>Conteúdo do curso</h3>{current.map(l=><button key={l.id} className={selected?.id===l.id?'active':''} onClick={()=>setSelected(l)}><PlayCircle size={19}/><span><small>{l.module}</small>{l.title}</span><small>{l.duration}</small></button>)}{current.length===0&&<p>Nenhuma aula publicada.</p>}<a className="academy-btn" href="https://arena.fortifysec.com.br/" target="_blank" rel="noreferrer">Validar conhecimento na Arena <ArrowUpRight size={16}/></a></aside></div>{selected && <AITutor key={selected.id} lessonId={selected.id} lessonTitle={selected.title} />}</>:<div className="academy-cards">{courses.map(c=><button className="academy-course" key={c.id} onClick={()=>{setCourseId(c.id);setSelected(lessons.find(l=>l.course_id===c.id)??null)}}>{c.cover?<div className="academy-cover" style={{backgroundImage:`url(${c.cover})`}}/>:<div className="academy-cover"><ShieldCheck size={54}/></div>}<div className="academy-course-content"><small>{c.category}</small><h2>{c.title}</h2><p>{c.description}</p><span><Clock size={15}/> {lessons.filter(l=>l.course_id===c.id).length} aulas <ArrowUpRight size={18}/></span></div></button>)}{courses.length===0&&<div className="academy-empty"><BookOpen size={50}/><h2>Novos cursos em preparação</h2><p>Em breve, os primeiros treinamentos gratuitos estarão disponíveis aqui.</p></div>}</div>}</div></main>}
