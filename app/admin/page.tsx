"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api-client";

type Lesson = { id: string; title: string };
type Module = { id: string; title: string; lessons: Lesson[] };
type Course = { id: string; title: string; modules: Module[] };
type Enrollment = { id: string; status: string; source: string; enrolled_at: string; courses: { title: string } | null };
type Student = { id: string; email: string; full_name: string; created_at: string; enrollments: Enrollment[] };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="portal-field"><span>{label}</span>{children}</label>;
}

export default function AdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState("");

  const modules = useMemo(() => courses.flatMap((course) => course.modules || []), [courses]);
  const lessonCount = useMemo(() => modules.reduce((total, module) => total + (module.lessons?.length || 0), 0), [modules]);

  async function loadContent() {
    try {
      const data = await apiFetch("/api/admin/content");
      setCourses(data.courses || []);
      setStudents(data.students || []);
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Não foi possível carregar o conteúdo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    apiFetch("/api/admin/content")
      .then((data) => { setCourses(data.courses || []); setStudents(data.students || []); })
      .catch((error) => {
        setIsError(true);
        setMessage(error instanceof Error ? error.message : "Não foi possível carregar o conteúdo.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function send(event: FormEvent<HTMLFormElement>, action: string) {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try {
      await apiFetch("/api/admin/content", { method: "POST", body: JSON.stringify({ action, ...values }) });
      form.reset();
      setMessage("Alteração salva com sucesso.");
      await loadContent();
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Erro ao salvar.");
    }
  }

  async function changeStudentStatus(enrollmentId: string, status: "active" | "blocked") {
    try {
      await apiFetch("/api/admin/content", { method: "POST", body: JSON.stringify({ action: "studentStatus", enrollmentId, status }) });
      setMessage(status === "active" ? "Acesso do aluno liberado." : "Acesso do aluno bloqueado.");
      await loadContent();
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Erro ao atualizar aluno.");
    }
  }

  const filteredStudents = students.filter((student) => `${student.full_name} ${student.email}`.toLowerCase().includes(studentSearch.toLowerCase()));

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <Link className="portal-logo" href="/"><span className="portal-logo-mark">F/</span> FORTIFYSEC</Link>
        <div className="admin-user"><div className="portal-avatar">AD</div><div><strong>ADMINISTRADOR</strong><small>CONTROLE TOTAL</small></div></div>
        <nav className="admin-menu">
          <a className="active" href="#overview"><i>⌂</i> VISÃO GERAL</a>
          <a href="#content"><i>▤</i> CONTEÚDO</a>
          <a href="#new-course"><i>＋</i> CURSOS</a>
          <a href="#new-lesson"><i>▶</i> AULAS</a>
          <a href="#students"><i>◎</i> ALUNOS</a>
        </nav>
        <div className="admin-sidebar-footer"><Link className="portal-header-link" href="/admin/logout">SAIR DO PAINEL</Link><Link className="portal-header-link" href="/">← VER SITE</Link></div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar" id="overview">
          <div><h1>PAINEL DE CONTROLE</h1><p>Gerencie o conteúdo e os acessos da FortifySec.</p></div>
          <div className="admin-status"><i /> SISTEMA OPERACIONAL</div>
        </header>

        <section className="admin-overview">
          <div className="admin-kpi"><span>CURSOS <i>↗</i></span><strong>{courses.length}</strong><small>CADASTRADOS</small></div>
          <div className="admin-kpi"><span>MÓDULOS <i>↗</i></span><strong>{modules.length}</strong><small>PUBLICADOS</small></div>
          <div className="admin-kpi"><span>AULAS <i>↗</i></span><strong>{lessonCount}</strong><small>NO CATÁLOGO</small></div>
          <div className="admin-kpi"><span>PLATAFORMA <i>●</i></span><strong>ON</strong><small>WEBHOOK ATIVO</small></div>
        </section>

        {message && <p className={`portal-alert ${isError ? "error" : ""}`}>{message}</p>}

        <div className="admin-section-title"><div><span className="portal-label">{"// OPERAÇÕES"}</span><h2>CADASTRO DE CONTEÚDO</h2></div><p>Preencha os formulários na ordem: curso, módulo e aula.</p></div>

        <section className="admin-form-grid">
          <article className="admin-card" id="new-course">
            <header className="admin-card-head"><span className="admin-card-number">01</span><div><h3>NOVO CURSO</h3><p>Crie uma formação no catálogo.</p></div></header>
            <form className="admin-form" onSubmit={(event) => send(event, "course")}>
              <Field label="TÍTULO DO CURSO"><input name="title" required placeholder="Ex.: Pentest em Aplicações Web" /></Field>
              <Field label="SLUG"><input name="slug" required placeholder="pentest-aplicacoes-web" /></Field>
              <Field label="DESCRIÇÃO"><textarea name="description" placeholder="Resumo que aparecerá para o aluno" /></Field>
              <Field label="URL DA CAPA"><input name="thumbnailUrl" type="url" placeholder="https://..." /></Field>
              <div className="admin-form-row"><Field label="CARGA HORÁRIA"><input name="hours" type="number" min="0" placeholder="40" /></Field><Field label="POSIÇÃO"><input name="position" type="number" min="0" placeholder="1" /></Field></div>
              <button className="portal-button" type="submit">CRIAR CURSO →</button>
            </form>
          </article>

          <article className="admin-card">
            <header className="admin-card-head"><span className="admin-card-number">02</span><div><h3>NOVO MÓDULO</h3><p>Organize as etapas do curso.</p></div></header>
            <form className="admin-form" onSubmit={(event) => send(event, "module")}>
              <Field label="CURSO"><select name="courseId" required defaultValue=""><option value="" disabled>Selecione um curso</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.title}</option>)}</select></Field>
              <Field label="TÍTULO DO MÓDULO"><input name="title" required placeholder="Ex.: 01 — Fundamentos" /></Field>
              <Field label="POSIÇÃO"><input name="position" type="number" min="0" placeholder="1" /></Field>
              <button className="portal-button" type="submit">CRIAR MÓDULO →</button>
            </form>
          </article>

          <article className="admin-card" id="new-lesson">
            <header className="admin-card-head"><span className="admin-card-number">03</span><div><h3>NOVA AULA</h3><p>Indexe um vídeo do YouTube.</p></div></header>
            <form className="admin-form" onSubmit={(event) => send(event, "lesson")}>
              <Field label="MÓDULO"><select name="moduleId" required defaultValue=""><option value="" disabled>Selecione um módulo</option>{modules.map((module) => <option value={module.id} key={module.id}>{module.title}</option>)}</select></Field>
              <Field label="TÍTULO DA AULA"><input name="title" required placeholder="Ex.: Reconhecimento passivo" /></Field>
              <Field label="LINK DO YOUTUBE"><input name="youtubeUrl" type="url" required placeholder="https://youtube.com/watch?v=..." /></Field>
              <Field label="DESCRIÇÃO"><textarea name="description" placeholder="Objetivos e resumo da aula" /></Field>
              <div className="admin-form-row"><Field label="DURAÇÃO (MIN)"><input name="duration" type="number" min="0" placeholder="25" /></Field><Field label="POSIÇÃO"><input name="position" type="number" min="0" placeholder="1" /></Field></div>
              <button className="portal-button" type="submit">PUBLICAR AULA →</button>
            </form>
          </article>

          <article className="admin-card" id="manual-enroll">
            <header className="admin-card-head"><span className="admin-card-number">04</span><div><h3>LIBERAR ALUNO</h3><p>Acesso manual para cortesias autorizadas.</p></div></header>
            <form className="admin-form" onSubmit={(event) => send(event, "enroll")}>
              <Field label="E-MAIL DO ALUNO"><input name="email" type="email" required placeholder="aluno@email.com" /></Field>
              <Field label="CURSO"><select name="courseId" required defaultValue=""><option value="" disabled>Selecione um curso</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.title}</option>)}</select></Field>
              <button className="portal-button" type="submit">LIBERAR ACESSO →</button>
            </form>
          </article>
        </section>

        <div className="admin-section-title" id="students"><div><span className="portal-label">{"// GESTÃO DE ALUNOS"}</span><h2>ALUNOS MATRICULADOS</h2></div><p>{students.length} contas cadastradas</p></div>
        <section className="student-manager">
          <div className="student-toolbar">
            <label className="portal-field"><span>BUSCAR ALUNO</span><input value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Nome ou e-mail" /></label>
            <div className="student-summary"><span><b>{students.filter((student) => student.enrollments?.some((item) => item.status === "active")).length}</b> ATIVOS</span><span><b>{students.filter((student) => student.enrollments?.some((item) => item.status === "blocked")).length}</b> BLOQUEADOS</span></div>
          </div>
          <div className="student-table-wrap"><table className="student-table"><thead><tr><th>ALUNO</th><th>FORMAÇÃO</th><th>ORIGEM</th><th>MATRÍCULA</th><th>STATUS</th><th>AÇÕES</th></tr></thead><tbody>
            {filteredStudents.map((student) => { const enrollment = student.enrollments?.[0]; return <tr key={student.id}><td><div className="student-identity"><span>{(student.full_name || student.email).slice(0, 2).toUpperCase()}</span><div><strong>{student.full_name || "Aluno FortifySec"}</strong><small>{student.email}</small></div></div></td><td>{enrollment?.courses?.title || "Sem curso"}</td><td><span className="student-source">{enrollment?.source === "mercadopago" ? "MERCADO PAGO" : "MANUAL"}</span></td><td>{enrollment ? new Date(enrollment.enrolled_at).toLocaleDateString("pt-BR") : "—"}</td><td><span className={`student-status ${enrollment?.status || "none"}`}>{enrollment?.status === "active" ? "ATIVO" : enrollment?.status === "blocked" ? "BLOQUEADO" : "SEM ACESSO"}</span></td><td>{enrollment ? <button className="student-action" onClick={() => changeStudentStatus(enrollment.id, enrollment.status === "active" ? "blocked" : "active")}>{enrollment.status === "active" ? "BLOQUEAR" : "LIBERAR"}</button> : <span>—</span>}</td></tr>; })}
            {!filteredStudents.length && <tr><td colSpan={6} className="student-empty">Nenhum aluno encontrado.</td></tr>}
          </tbody></table></div>
        </section>

        <div className="admin-section-title" id="content"><div><span className="portal-label">{"// BIBLIOTECA"}</span><h2>CONTEÚDO PUBLICADO</h2></div><p>{courses.length} cursos · {modules.length} módulos · {lessonCount} aulas</p></div>
        <section className="content-table">
          {loading ? <div className="portal-loading"><div><div className="portal-loader" /><p className="portal-label">CARREGANDO...</p></div></div> : courses.map((course) => (
            <article className="content-course" key={course.id}>
              <header className="content-course-header"><h3>{course.title}</h3><small>{course.modules?.length || 0} MÓDULOS</small></header>
              {course.modules?.map((module) => <div className="content-module" key={module.id}><strong>{module.title}</strong><div className="content-lessons">{module.lessons?.length ? module.lessons.map((lesson) => <div className="content-lesson" key={lesson.id}><span>{lesson.title}</span><i>PUBLICADA ●</i></div>) : <div className="content-lesson">Nenhuma aula cadastrada.</div>}</div></div>)}
            </article>
          ))}
          {!loading && courses.length === 0 && <div className="portal-empty"><h2>NENHUM CURSO CADASTRADO</h2><p>Use o primeiro formulário acima para iniciar o catálogo.</p></div>}
        </section>
      </section>
    </main>
  );
}
