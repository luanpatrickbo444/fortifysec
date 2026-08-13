"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api-client";

type Lesson = { id: string; title: string; description: string; youtube_id: string; duration_minutes: number };
type Module = { id: string; title: string; lessons: Lesson[] };
type Course = { id: string; title: string; description: string; modules: Module[] };

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course>();
  const [progress, setProgress] = useState<Set<string>>(new Set());
  const [lesson, setLesson] = useState<Lesson>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/api/courses/${id}`)
      .then((data) => {
        setCourse(data.course);
        setProgress(new Set(data.progress.filter((item: { completed: boolean }) => item.completed).map((item: { lesson_id: string }) => item.lesson_id)));
        setLesson(data.course.modules.flatMap((module: Module) => module.lessons)[0]);
      })
      .catch((reason) => {
        setError(reason.message);
        if (reason.message.includes("login")) router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const lessons = useMemo(() => course?.modules.flatMap((module) => module.lessons) || [], [course]);
  const percent = lessons.length ? Math.round((progress.size / lessons.length) * 100) : 0;

  async function completeLesson() {
    if (!lesson) return;
    await apiFetch("/api/progress", { method: "POST", body: JSON.stringify({ lessonId: lesson.id, completed: true }) });
    setProgress((current) => new Set([...current, lesson.id]));
    const nextLesson = lessons[lessons.findIndex((item) => item.id === lesson.id) + 1];
    if (nextLesson) setLesson(nextLesson);
  }

  if (loading) return <main className="portal-root portal-loading"><div><div className="portal-loader" /><p className="portal-label">CARREGANDO SALA DE AULA...</p></div></main>;
  if (error) return <main className="portal-root portal-loading"><div className="portal-empty"><div className="portal-empty-mark">!</div><h2>{error}</h2><Link className="portal-button" href="/area">VOLTAR À ÁREA DO ALUNO</Link></div></main>;

  return (
    <main className="classroom-root">
      <aside className="classroom-sidebar">
        <div className="classroom-brand"><Link className="portal-logo" href="/area"><span className="portal-logo-mark">F/</span> FORTIFYSEC</Link></div>
        <div className="classroom-course-summary">
          <small>FORMAÇÃO ATUAL</small>
          <h2>{course?.title}</h2>
          <div className="progress-line"><b style={{ width: `${percent}%` }} /></div>
          <div className="progress-caption"><span>{progress.size} DE {lessons.length} AULAS</span><strong>{percent}%</strong></div>
        </div>

        <div className="module-scroll">
          {course?.modules.map((module, moduleIndex) => (
            <section className="module-block" key={module.id}>
              <h3 className="module-title"><b>{String(moduleIndex + 1).padStart(2, "0")}</b>{module.title}</h3>
              {module.lessons.map((item, lessonIndex) => (
                <button
                  className={`lesson-nav-button ${lesson?.id === item.id ? "active" : ""} ${progress.has(item.id) ? "done" : ""}`}
                  onClick={() => setLesson(item)}
                  key={item.id}
                >
                  <span className="lesson-index">{progress.has(item.id) ? "✓" : String(lessonIndex + 1).padStart(2, "0")}</span>
                  <span className="lesson-nav-copy"><strong>{item.title}</strong><small>{progress.has(item.id) ? "CONCLUÍDA" : "DISPONÍVEL"}</small></span>
                  <span className="lesson-time">{item.duration_minutes}m</span>
                </button>
              ))}
            </section>
          ))}
        </div>
        <div className="classroom-sidebar-footer"><Link className="portal-header-link" href="/area">← VOLTAR AOS CURSOS</Link></div>
      </aside>

      <section className="lesson-workspace">
        <header className="lesson-topbar">
          <div className="lesson-breadcrumb"><b>FORMAÇÃO</b> / {course?.title} / AULA</div>
          <div className="lesson-topbar-actions"><Link className="portal-header-link" href="/area">MEUS CURSOS</Link><button className="portal-ghost-button" type="button">AJUDA ?</button></div>
        </header>

        <div className="lesson-content">
          {lesson ? (
            <>
              <div className="video-frame">
                {lesson.youtube_id ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${lesson.youtube_id}?rel=0`}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="video-placeholder"><div><span>▶</span>VÍDEO AINDA NÃO ADICIONADO<br /><small>Cadastre o link no painel administrativo</small></div></div>
                )}
              </div>

              <div className="lesson-details">
                <div>
                  <span className="portal-label">{"// AULA ATUAL"}</span>
                  <h1>{lesson.title}</h1>
                  <p>{lesson.description || "Assista ao conteúdo completo e marque a aula como concluída para avançar na formação."}</p>
                </div>
                <button className="portal-button lesson-complete" onClick={completeLesson} disabled={progress.has(lesson.id)}>
                  {progress.has(lesson.id) ? "AULA CONCLUÍDA ✓" : "CONCLUIR E AVANÇAR →"}
                </button>
              </div>
            </>
          ) : (
            <div className="video-placeholder"><div><span>+</span>NENHUMA AULA PUBLICADA</div></div>
          )}
        </div>
      </section>
    </main>
  );
}
