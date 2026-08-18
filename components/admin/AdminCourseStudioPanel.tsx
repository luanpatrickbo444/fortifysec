import Link from 'next/link'
import { BookOpenCheck, Eye, EyeOff, Film, Layers3, PlusCircle, Save, Zap } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { requireAdmin } from '@/lib/auth'
import {
  adminCreateLessonAction,
  adminCreateModuleAction,
  adminDeleteLessonAction,
  adminToggleLessonAction,
  adminToggleModuleAction,
  adminUpdateCourseAction,
} from '@/app/actions'

type StudioQuery = { criada?: string; modulo?: string; erro?: string }

export async function AdminCourseStudioPanel({ courseId, query }: { courseId: string; query: StudioQuery }) {
  const { supabase } = await requireAdmin()

  if (!courseId) {
    return (
      <DashboardShell admin>
        <div className="empty-state">
          Curso não informado. <a href="/admin?view=courses">Voltar para Cursos & Trilhas</a>
        </div>
      </DashboardShell>
    )
  }

  const [{ data: course }, { data: modules }, { data: lessons }] = await Promise.all([
    supabase.from('courses').select('id,title,slug,description,price_cents,published').eq('id', courseId).maybeSingle(),
    supabase.from('course_modules').select('id,title,description,position,published').eq('course_id', courseId).order('position'),
    supabase.from('lessons').select('id,module_id,title,summary,position,xp_reward,video_url,published').eq('course_id', courseId).order('position'),
  ])

  if (!course) {
    return (
      <DashboardShell admin>
        <div className="page-head internal-page-head">
          <div><div className="kicker">ADMIN / COURSE STUDIO</div><h1>Curso não encontrado</h1><p>O curso pode ter sido removido ou o identificador não é mais válido.</p></div>
          <a className="btn secondary" href="/admin?view=courses">← CURSOS</a>
        </div>
      </DashboardShell>
    )
  }

  const returnTo = `/admin?view=course&course=${encodeURIComponent(course.id)}`
  const byModule = new Map<string, any[]>()
  ;(lessons || []).forEach((l: any) => {
    const key = l.module_id || 'unassigned'
    byModule.set(key, [...(byModule.get(key) || []), l])
  })

  return (
    <DashboardShell admin>
      <div className="page-head internal-page-head">
        <div>
          <div className="kicker">ADMIN / COURSE STUDIO</div>
          <h1>{course.title}</h1>
          <p>Estruture módulos, publique aulas e acompanhe toda a grade deste curso.</p>
        </div>
        <div className="hero-actions">
          <a className="btn secondary" href="/admin?view=courses">← CURSOS</a>
          <Link className="btn secondary" href={`/curso/${course.slug}`}>VER CURSO →</Link>
        </div>
      </div>

      {query.criada && <div className="alert success-alert">Aula adicionada ao curso.</div>}
      {query.modulo && <div className="alert success-alert">Módulo criado com sucesso.</div>}
      {query.erro && <div className="alert danger-alert">Não foi possível concluir a operação.</div>}

      <div className="course-studio-grid">
        <aside className="course-studio-sidebar">
          <form action={adminUpdateCourseAction} className="card">
            <div className="panel-head"><div><span className="section-index">COURSE SETTINGS</span><h3>Dados do curso</h3></div><Save size={18} /></div>
            <input type="hidden" name="course_id" value={course.id} />
            <div className="field"><label>Título</label><input name="title" defaultValue={course.title} required /></div>
            <div className="field"><label>Slug</label><input name="slug" defaultValue={course.slug} required /></div>
            <div className="field"><label>Preço (R$)</label><input name="price" type="number" step="0.01" min="0" defaultValue={(course.price_cents / 100).toFixed(2)} /></div>
            <div className="field"><label>Descrição</label><textarea name="description" rows={5} defaultValue={course.description} /></div>
            <div className="field"><label>Status</label><select name="published" defaultValue={String(course.published)}><option value="true">Publicado</option><option value="false">Rascunho</option></select></div>
            <SubmitButton idleLabel="SALVAR CURSO" pendingLabel="SALVANDO..." />
          </form>

          <form action={adminCreateModuleAction} className="card">
            <div className="panel-head"><div><span className="section-index">NEW MODULE</span><h3>Novo módulo</h3></div><Layers3 size={18} /></div>
            <input type="hidden" name="course_id" value={course.id} />
            <input type="hidden" name="return_to" value={returnTo} />
            <div className="field"><label>Nome</label><input name="title" required placeholder="Ex.: Módulo 01 · Fundamentos" /></div>
            <div className="field"><label>Posição</label><input name="position" type="number" min="1" defaultValue={(modules?.length || 0) + 1} /></div>
            <div className="field"><label>Descrição</label><textarea name="description" rows={3} /></div>
            <SubmitButton className="btn secondary" idleLabel="CRIAR MÓDULO" pendingLabel="CRIANDO..." />
          </form>
        </aside>

        <main className="course-studio-main">
          <form action={adminCreateLessonAction} className="card lesson-composer">
            <div className="studio-header"><div><span className="section-index">LESSON COMPOSER</span><h2>Adicionar aula</h2><p>A aula entra diretamente neste curso e pode ser vinculada a um módulo.</p></div><PlusCircle size={27} /></div>
            <input type="hidden" name="course_id" value={course.id} />
            <input type="hidden" name="return_to" value={returnTo} />
            <div className="two-col">
              <div className="field"><label>Módulo</label><select name="module_id"><option value="">Sem módulo</option>{(modules || []).map((m: any) => <option key={m.id} value={m.id}>{String(m.position).padStart(2, '0')} · {m.title}</option>)}</select></div>
              <div className="field"><label>Título da aula</label><input name="title" required /></div>
              <div className="field"><label>Posição</label><input name="position" type="number" min="1" defaultValue={(lessons?.length || 0) + 1} /></div>
              <div className="field"><label><Zap size={12} /> XP</label><input name="xp_reward" type="number" min="0" defaultValue="10" /></div>
            </div>
            <div className="field"><label>Resumo</label><input name="summary" placeholder="O que o aluno vai aprender nesta aula" /></div>
            <div className="field"><label><Film size={12} /> URL do vídeo</label><input name="video_url" placeholder="https://youtube.com/..." /></div>
            <div className="field"><label>Conteúdo / instruções</label><textarea name="content" rows={8} /></div>
            <div className="two-col"><div className="field"><label>Publicação</label><select name="published" defaultValue="true"><option value="true">Publicar agora</option><option value="false">Salvar como rascunho</option></select></div></div>
            <SubmitButton idleLabel="ADICIONAR AULA →" pendingLabel="PUBLICANDO AULA..." />
          </form>

          <section className="module-board">
            <div className="panel-head"><div><span className="section-index">CURRICULUM MAP</span><h2>Grade do curso</h2></div><span className="pill active"><BookOpenCheck size={12} />{(lessons || []).length} AULAS</span></div>
            {(modules || []).map((m: any) => (
              <article className="module-admin-card" key={m.id}>
                <header>
                  <div><span className="module-number">MÓDULO {String(m.position).padStart(2, '0')}</span><h3>{m.title}</h3><p>{m.description || 'Sem descrição.'}</p></div>
                  <form action={adminToggleModuleAction}>
                    <input type="hidden" name="module_id" value={m.id} />
                    <input type="hidden" name="published" value={String(m.published)} />
                    <input type="hidden" name="return_to" value={returnTo} />
                    <SubmitButton className="btn secondary small" idleLabel={m.published ? 'OCULTAR MÓDULO' : 'PUBLICAR MÓDULO'} pendingLabel="ATUALIZANDO..." />
                  </form>
                </header>
                <div className="module-lesson-list">
                  {(byModule.get(m.id) || []).map((l: any) => (
                    <div className="admin-lesson-row" key={l.id}>
                      <div className="lesson-order">{String(l.position).padStart(2, '0')}</div>
                      <div><strong>{l.title}</strong><span>{l.summary || 'Sem resumo'} · +{l.xp_reward} XP</span></div>
                      <span className={`pill ${l.published ? 'active' : 'locked'}`}>{l.published ? <><Eye size={11} /> PUBLICADA</> : <><EyeOff size={11} /> RASCUNHO</>}</span>
                      <div className="row-actions">
                        <form action={adminToggleLessonAction}>
                          <input type="hidden" name="lesson_id" value={l.id} />
                          <input type="hidden" name="published" value={String(l.published)} />
                          <input type="hidden" name="return_to" value={returnTo} />
                          <SubmitButton className="icon-action" idleLabel={l.published ? 'OCULTAR' : 'PUBLICAR'} pendingLabel="..." />
                        </form>
                        <form action={adminDeleteLessonAction}>
                          <input type="hidden" name="lesson_id" value={l.id} />
                          <input type="hidden" name="return_to" value={returnTo} />
                          <SubmitButton className="icon-action danger" idleLabel="EXCLUIR" pendingLabel="..." />
                        </form>
                      </div>
                    </div>
                  ))}
                  {!(byModule.get(m.id) || []).length && <div className="empty-inline">Nenhuma aula neste módulo.</div>}
                </div>
              </article>
            ))}

            {(byModule.get('unassigned') || []).length > 0 && (
              <article className="module-admin-card unassigned">
                <header><div><span className="module-number">SEM MÓDULO</span><h3>Aulas não organizadas</h3></div></header>
                <div className="module-lesson-list">
                  {(byModule.get('unassigned') || []).map((l: any) => (
                    <div className="admin-lesson-row" key={l.id}>
                      <div className="lesson-order">{String(l.position).padStart(2, '0')}</div>
                      <div><strong>{l.title}</strong><span>+{l.xp_reward} XP</span></div>
                      <span className={`pill ${l.published ? 'active' : 'locked'}`}>{l.published ? 'PUBLICADA' : 'RASCUNHO'}</span>
                    </div>
                  ))}
                </div>
              </article>
            )}

            {!modules?.length && !lessons?.length && <div className="empty-state">Crie o primeiro módulo ou adicione uma aula para começar a grade.</div>}
          </section>
        </main>
      </div>
    </DashboardShell>
  )
}
