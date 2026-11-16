'use client';

import { useEffect, useState } from 'react';

type Talent = {
  id: string;
  name: string;
  headline: string | null;
  score: number;
  solved_challenges: number;
  labs_completed: number;
  position: number;
};

export default function Talentos() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Talent[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [interviewTalent, setInterviewTalent] = useState<Talent | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [interviewMessage, setInterviewMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function requestInterview() {
    if (!interviewTalent || sending) return;

    setSending(true);
    setMessage('');

    try {
      const response = await fetch('/api/empresas/ctf-entrevistas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          talent_id: interviewTalent.id,
          job_title: jobTitle,
          message: interviewMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao solicitar entrevista');
      }

      setMessage('Solicitação de entrevista registrada com sucesso.');
      setInterviewTalent(null);
      setJobTitle('');
      setInterviewMessage('');
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'Erro inesperado'
      );
    } finally {
      setSending(false);
    }
  }


  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      try {
        const response = await fetch(
          '/api/empresas/talentos?q=' + encodeURIComponent(q)
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao consultar talentos');
        }

        if (active) {
          setItems(data.items || []);
          setConfigured(data.configured);
          setError('');
        }
      } catch (err) {
        if (active) {
          setItems([]);
          setError(
            err instanceof Error ? err.message : 'Erro inesperado'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [q]);

  async function select(id: string) {
    setMessage('');

    try {
      const response = await fetch('/api/empresas/selecionados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ talent_id: id }),
      });

      const data = await response.json();

      setMessage(
        response.ok
          ? 'Talento selecionado para avaliação.'
          : data.error || 'Erro ao selecionar talento.'
      );
    } catch {
      setMessage('Não foi possível realizar a seleção.');
    }
  }

  return (
    <>
      <p className="corp-overline">FORTIFYSEC CTF</p>

      <h1>Buscar talentos</h1>

      <p className="corp-muted">
        Descubra profissionais de cibersegurança por desempenho
        técnico em desafios CTF.
      </p>

      <div className="fs-talent-toolbar">
        <div className="fs-talent-search">
          <input
            type="search"
            placeholder="Buscar talentos por nome ou especialidade..."
            value={q}
            onChange={e => setQ(e.target.value)}
            aria-label="Pesquisar talentos"
          />
        </div>
        <span className="fs-talent-count">
          {loading ? 'Atualizando...' : `${items.length} talentos encontrados`}
        </span>
      </div>

      {!configured && (
        <div className="corp-tile">
          Integração CTF ainda não configurada.
        </div>
      )}

      {error && <p className="corp-error">{error}</p>}

      {message && <p role="status">{message}</p>}

      {loading && (
        <div className="fs-talent-loading" role="status">
          <span className="fs-spinner" aria-hidden="true" />
          Carregando talentos...
        </div>
      )}

      {!loading && configured && !error && items.length === 0 && (
        <p>Nenhum talento disponível para esta pesquisa.</p>
      )}

      <div className="corp-grid">
        {items.map(t => (
          <article className="corp-tile" key={t.id}>
            <p className="corp-overline">
              Posição #{t.position}
            </p>

            <h2>{t.name}</h2>

            <p>{t.headline || 'Participante FortifySec CTF'}</p>

            <p>
              <strong>{t.score.toLocaleString('pt-BR')}</strong>
              {' '}pontos CTF
            </p>

            <p>
              {t.solved_challenges} desafios resolvidos
            </p>

            <p>
              {t.labs_completed} laboratórios concluídos
            </p>

            {t.id.startsWith('ctf:') ? (
              <button
                className="corp-button"
                onClick={() => {
                  setInterviewTalent(t);
                  setJobTitle('');
                  setInterviewMessage('');
                  setMessage('');
                }}
              >
                Solicitar entrevista
              </button>
            ) : (
              <button
                className="corp-button"
                onClick={() => select(t.id)}
              >
                Selecionar talento
              </button>
            )}
          </article>
        ))}
      </div>
      {interviewTalent && (
        <div
          className="fs-interview-overlay"
          onMouseDown={e => {
            if (e.target === e.currentTarget && !sending) {
              setInterviewTalent(null);
            }
          }}
        >
          <section
            className="fs-interview-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fs-interview-title"
          >
            <div className="fs-interview-header">
              <div>
                <p className="corp-overline">FORTIFYSEC RECRUITMENT</p>
                <h2 id="fs-interview-title">Solicitar entrevista</h2>
                <p className="corp-muted">
                  Convide <strong>{interviewTalent.name}</strong> para uma oportunidade.
                </p>
              </div>
              <button
                type="button"
                className="fs-interview-close"
                aria-label="Fechar formulário"
                disabled={sending}
                onClick={() => setInterviewTalent(null)}
              >
                ×
              </button>
            </div>

            <form onSubmit={e => {
              e.preventDefault();
              void requestInterview();
            }}>
              <label htmlFor="fs-job-title">Título da oportunidade</label>
              <input
                id="fs-job-title"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                minLength={5}
                maxLength={120}
                required
                placeholder="Ex.: Analista de Segurança da Informação"
              />

              <label htmlFor="fs-job-message">Mensagem ao participante</label>
              <textarea
                id="fs-job-message"
                value={interviewMessage}
                onChange={e => setInterviewMessage(e.target.value)}
                minLength={15}
                maxLength={2000}
                rows={5}
                required
                placeholder="Apresente a oportunidade e explique por que deseja conversar com este talento."
              />

              <div className="fs-interview-actions">
                <button
                  type="button"
                  className="fs-interview-cancel"
                  disabled={sending}
                  onClick={() => setInterviewTalent(null)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="corp-button"
                  disabled={sending}
                >
                  {sending && <span className="fs-spinner" aria-hidden="true" />}
                  {sending ? 'Registrando...' : 'Enviar solicitação'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
