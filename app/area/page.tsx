"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { browserSupabase } from "@/lib/supabase";

type Course = {
  id: string;
  title: string;
  description: string;
  workload_hours: number;
  thumbnail_url: string;
};
type AreaData = {
  user?: { name: string; email: string; role: string };
  courses?: Course[];
};

export default function AreaPage() {
  const router = useRouter();
  const [data, setData] = useState<AreaData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/me/courses")
      .then(setData)
      .catch((reason) => {
        setError(reason.message);
        if (reason.message.includes("login")) router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const firstName = useMemo(() => {
    const identity = data.user?.name || data.user?.email || "aluno";
    return identity.split(/[ @]/)[0];
  }, [data.user]);
  const initials = firstName.slice(0, 2).toUpperCase();

  async function logout() {
    await browserSupabase().auth.signOut();
    router.push("/login");
  }

  return (
    <main className="portal-root">
      <div className="portal-container">
        <header className="portal-header">
          <Link className="portal-logo" href="/"><span className="portal-logo-mark">F/</span> FORTIFYSEC</Link>
          <div className="portal-header-actions">
            <button className="portal-ghost-button" onClick={logout}>SAIR</button>
            <div className="portal-avatar" aria-label={`Perfil de ${firstName}`}>{initials || "FS"}</div>
          </div>
        </header>

        {loading ? (
          <section className="portal-loading"><div><div className="portal-loader" /><p className="portal-label">CARREGANDO SUA MISSÃO...</p></div></section>
        ) : (
          <>
            <section className="dashboard-hero">
              <div>
                <span className="portal-label">{"// CENTRAL DE TREINAMENTO"}</span>
                <h1 className="dashboard-title">CONTINUE SUA<br /><em>MISSÃO.</em></h1>
                <p>Bem-vindo de volta, <strong>{firstName}</strong>. Escolha uma formação e continue de onde parou.</p>
              </div>
              <div className="dashboard-progress-ring" style={{ "--progress": 18 } as React.CSSProperties}>
                <div><strong>18%</strong><small>PROGRESSO GERAL</small></div>
              </div>
            </section>

            <section className="dashboard-stats" aria-label="Resumo da formação">
              <div className="dashboard-stat"><small>CURSOS LIBERADOS</small><strong>{data.courses?.length || 0}<span>+</span></strong></div>
              <div className="dashboard-stat"><small>CARGA HORÁRIA</small><strong>{data.courses?.reduce((total, course) => total + course.workload_hours, 0) || 0}<span>h</span></strong></div>
              <div className="dashboard-stat"><small>AULAS CONCLUÍDAS</small><strong>—</strong></div>
              <div className="dashboard-stat"><small>CERTIFICAÇÕES</small><strong>0<span>/5</span></strong></div>
            </section>

            {error && <p className="portal-alert error">{error}</p>}

            <div className="portal-section-head">
              <div><span className="portal-label">{"// SUAS FORMAÇÕES"}</span><h2>CURSOS LIBERADOS</h2></div>
              <p>Seu conteúdo aparece aqui assim que a matrícula é confirmada pelo Mercado Pago.</p>
            </div>

            <section className="course-grid">
              {data.courses?.map((course, index) => (
                <Link className="student-course-card" href={`/curso/${course.id}`} key={course.id}>
                  <div className="course-art" style={course.thumbnail_url ? { backgroundImage: `linear-gradient(rgba(7,10,8,.15),rgba(7,10,8,.45)),url(${course.thumbnail_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
                    <span className="course-art-badge">TRILHA {String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="course-card-body">
                    <div className="course-card-meta"><span>{course.workload_hours} HORAS</span><span>ACESSO ATIVO ●</span></div>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <div className="course-card-action"><span>ACESSAR FORMAÇÃO</span><i>↗</i></div>
                  </div>
                </Link>
              ))}

              {data.courses?.length === 0 && (
                <div className="portal-empty">
                  <div className="portal-empty-mark">⌁</div>
                  <h2>ACESSO AINDA NÃO LIBERADO</h2>
                  <p>Assim que o Mercado Pago confirmar sua compra, a formação será disponibilizada automaticamente nesta tela.</p>
                  <Link className="portal-button" href="/#oferta">VER OFERTA DA FORMAÇÃO →</Link>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
