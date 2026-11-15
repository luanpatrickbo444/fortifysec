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

      <input
        type="search"
        placeholder="Pesquisar por nome ou especialidade"
        value={q}
        onChange={e => setQ(e.target.value)}
        aria-label="Pesquisar talentos"
      />

      {!configured && (
        <div className="corp-tile">
          Integração CTF ainda não configurada.
        </div>
      )}

      {error && <p className="corp-error">{error}</p>}

      {message && <p role="status">{message}</p>}

      {loading && <p>Carregando talentos...</p>}

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

            <button
              className="corp-button"
              onClick={() => select(t.id)}
            >
              Selecionar talento
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
