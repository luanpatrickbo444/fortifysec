'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BookOpen, PlayCircle, GraduationCap, Trophy, Video, ChevronRight, ShieldCheck } from 'lucide-react';
import AITutor from './components/AITutor';
import AcademyRoadmap from './components/AcademyRoadmap';

type Course = { id:number; title:string; description:string; category:string; cover:string };
type Lesson = { id:number; course_id:number; module:string; title:string; description:string; video:string; duration:string; position:number };

export default function Training() {
  const [courses,setCourses] = useState<Course[]>([]);
  const [lessons,setLessons] = useState<Lesson[]>([]);
  const [selected,setSelected] = useState<Lesson|null>(null);
  const [courseId,setCourseId] = useState<number|null>(null);
  const [loadingAcademy,setLoadingAcademy] = useState(true);
  const [academyError,setAcademyError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoadingAcademy(true);
      setAcademyError('');
      try {
        const response = await fetch('/api/academy', {signal:controller.signal});
        if (!response.ok) throw new Error('Falha ao carregar cursos');
        const data:unknown = await response.json();
        if (!data || typeof data !== 'object' || !('courses' in data) || !('lessons' in data) || !Array.isArray(data.courses) || !Array.isArray(data.lessons)) throw new Error('Resposta inválida da Academy');
        if (!controller.signal.aborted) {
          setCourses(data.courses as Course[]);
          setLessons(data.lessons as Lesson[]);
        }
      } catch {
        if (!controller.signal.aborted) setAcademyError('Não foi possível carregar os cursos. Tente novamente.');
      } finally {
        if (!controller.signal.aborted) setLoadingAcademy(false);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  const active = courses.find(c => c.id === courseId);
  const current = lessons.filter(l => l.course_id === courseId);
  const chooseCourse = (id:number) => {
    setCourseId(id);
    setSelected(lessons.find(l => l.course_id === id) ?? null);
    window.scrollTo({top:0,behavior:'smooth'});
  };

  return <main className="academy-public fs-academy-v2">
    <header className="academy-header fs-v2-header">
      <div><img src="/images/fortifysec-escudo.png" alt="FortifySec" className="fs-official-small" /><strong>FORTIFY<span>SEC</span> <em>/ ACADEMY</em></strong></div>
      <nav><Link href="/">Site principal</Link><a href="https://arena.fortifysec.com.br/" target="_blank" rel="noreferrer">Validar na Arena <ArrowUpRight size={16}/></a></nav>
    </header>
    {!active ? <>
      <section className="fs-v2-hero">
        <div className="fs-v2-hero-image" aria-hidden="true" />
        <div className="fs-v2-hero-inner">
          <div className="fs-v2-hero-content">
            <span className="fs-v2-eyebrow"><span className="fs-v2-dot"/> FORMAÇÃO GRATUITA EM CIBERSEGURANÇA</span>
            <h1>FortifySec <span>Academy</span></h1>
            <p>Aprenda com videoaulas, desenvolva habilidades reais e coloque seu conhecimento à prova na Arena.</p>
            <div className="fs-v2-hero-actions"><a href="#trilhas" className="fs-v2-primary"><PlayCircle size={18}/> Explorar trilhas</a><a href="https://arena.fortifysec.com.br/" target="_blank" rel="noreferrer" className="fs-v2-secondary"><ShieldCheck size={18}/> Ir para a Arena <ArrowUpRight size={16}/></a></div>
          </div>
        </div>
      </section>
      <section className="fs-v2-benefits" aria-label="Benefícios da Academy">
        <div><GraduationCap/><span><strong>Cursos gratuitos</strong><small>Aprenda sem mensalidades</small></span></div>
        <div><Video/><span><strong>Videoaulas práticas</strong><small>Estude no seu ritmo</small></span></div>
        <div><ShieldCheck/><span><strong>Desafios na Arena</strong><small>Pratique o que aprendeu</small></span></div>
        <div><Trophy/><span><strong>Evolução profissional</strong><small>Construa suas habilidades</small></span></div>
      </section>
      <div className="academy-container fs-v2-content" id="trilhas">
        {loadingAcademy ? <div className="academy-loading" role="status"><span className="fs-spinner"/><p>Carregando cursos e aulas...</p></div>
        : academyError ? <div className="academy-empty" role="alert"><h2>Não foi possível carregar a Academy</h2><p>{academyError}</p><button type="button" className="academy-btn" onClick={()=>window.location.reload()}>Tentar novamente</button></div>
        : <AcademyRoadmap courses={courses} lessons={lessons} onSelect={chooseCourse}/>}
        <section className="fs-v2-arena"><div className="fs-v2-arena-symbol"><Trophy size={38}/></div><div><h2>Aprendeu? Agora é hora de praticar.</h2><p>Leve seus conhecimentos para os laboratórios e desafios da FortifySec Arena.</p></div><a href="https://arena.fortifysec.com.br/" target="_blank" rel="noreferrer">Acessar a Arena <ArrowUpRight size={17}/></a></section>
      </div>
    </> : <div className="academy-container fs-v2-course-view">
      <button className="academy-back" onClick={()=>{setCourseId(null);setSelected(null)}}><ArrowLeft size={16}/> Voltar às trilhas</button>
      <div className="fs-v2-course-head"><span className="fs-v2-eyebrow">CURSO • {active.category}</span><h1>{active.title}</h1><p>{active.description}</p><span className="fs-v2-count"><BookOpen size={15}/>{current.length} {current.length===1?'aula':'aulas'} disponíveis</span></div>
      <div className="academy-learning"><div className="academy-player">{selected?.video ? <><video controls controlsList="nodownload" key={selected.id} src={selected.video} playsInline preload="metadata"/><div className="academy-video-info"><small>{selected.module}</small><h2>{selected.title}</h2><p>{selected.description}</p></div></> : <div className="academy-empty"><PlayCircle size={55}/><h2>{selected ? 'Vídeo ainda não disponível' : 'Escolha uma videoaula'}</h2><p>Selecione uma aula na lista para começar.</p></div>}</div>
      <aside className="academy-playlist"><h3>Conteúdo do curso</h3>{current.map(l=><button key={l.id} className={selected?.id===l.id?'active':''} onClick={()=>setSelected(l)}><PlayCircle size={19}/><span><small>{l.module}</small>{l.title}</span><small>{l.duration}</small></button>)}{current.length===0&&<p>Nenhuma aula publicada.</p>}<a className="academy-btn" href="https://arena.fortifysec.com.br/" target="_blank" rel="noreferrer">Validar conhecimento na Arena <ChevronRight size={16}/></a></aside></div>
      {selected && <AITutor key={selected.id} lessonId={selected.id} lessonTitle={selected.title}/>}
    </div>}
  </main>;
}
