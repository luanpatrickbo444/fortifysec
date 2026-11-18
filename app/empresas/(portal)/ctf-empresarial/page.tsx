'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';

type CtfRequest = {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
};

const stages = [
  { number: '01', title: 'Definir avaliação', detail: 'Descreva as competências desejadas.' },
  { number: '02', title: 'Análise FortifySec', detail: 'Nossa equipe avalia a solicitação.' },
  { number: '03', title: 'Desafio privado', detail: 'Preparação manual do ambiente.' },
  { number: '04', title: 'Resultados técnicos', detail: 'Acompanhamento da avaliação.' },
];

function Spinner() {
  return <span className="fse-ctf-spinner" role="status" aria-label="Carregando" />;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    requested: 'Aguardando FortifySec',
    pending: 'Pendente',
    in_review: 'Em análise',
    preparing: 'Em preparação',
    completed: 'Concluída',
    rejected: 'Não aprovada',
    cancelled: 'Cancelada',
  };
  return labels[status] || status;
}

function formatDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
}

export default function CTF() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<CtfRequest[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [whatsAppUrl, setWhatsAppUrl] = useState('');
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const response = await fetch('/api/empresas/ctf-solicitacoes', {
        credentials: 'same-origin',
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erro HTTP ${response.status}`);
      }

      if (!Array.isArray(result.items)) {
        throw new Error('Formato inesperado da resposta');
      }

      setItems(result.items);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as solicitações.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setMessage('');
    setWhatsAppUrl('');

    try {
      const response = await fetch('/api/empresas/ctf-solicitacoes', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Não foi possível enviar a solicitação.');
      }

      const requestId = typeof result.id === 'string' ? result.id : 'Consulte o painel';
      const whatsAppMessage = [
        '🛡️ FORTIFYSEC — SOLICITAÇÃO DE CTF EMPRESARIAL',
        '',
        `📋 Avaliação: ${title}`,
        `🎯 Competências e objetivos: ${description}`,
        `🆔 Protocolo: ${requestId}`,
        '📌 Status: Aguardando análise',
        '',
        'Solicitação registrada no Portal Empresarial FortifySec.'
      ].join('\n');
      setWhatsAppUrl(`https://wa.me/5565999221436?text=${encodeURIComponent(whatsAppMessage)}`);
      setMessageType('success');
      setMessage('Solicitação enviada à FortifySec com sucesso.');
      setTitle('');
      setDescription('');
      await load();
    } catch (error) {
      setMessageType('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Falha ao enviar a solicitação.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="fse-ctf-page">
      <header className="fse-ctf-header">
        <div>
          <p className="corp-overline">FORTIFYSEC / ENTERPRISE</p>
          <h1>CTF <span>Empresarial</span></h1>
          <p className="fse-ctf-subtitle">
            Avaliações técnicas exclusivas para identificar competências
            reais em cibersegurança.
          </p>
        </div>
        <div className="fse-ctf-header-symbol" aria-hidden="true"><img src="/images/fortifysec-escudo.png" alt="" /></div>
      </header>

      <div className="fse-ctf-intro">
        <div className="fse-ctf-intro-copy">
          <span className="fse-ctf-kicker">AVALIAÇÃO SOB MEDIDA</span>
          <h2>Talentos avaliados além do currículo.</h2>
          <p>
            Solicite desafios técnicos personalizados para os talentos
            selecionados. A equipe FortifySec analisa cada solicitação
            e prepara as avaliações manualmente.
          </p>
        </div>
        <div className="fse-ctf-intro-decoration" aria-hidden="true">
          <div className="fse-ctf-orbit"><img src="/images/fortifysec-escudo.png" alt="" /></div>
        </div>
      </div>

      <div className="fse-ctf-section-heading">
        <div>
          <span>COMO FUNCIONA</span>
          <h2>Etapas da avaliação</h2>
        </div>
        <p>Processo controlado pela FortifySec</p>
      </div>

      <div className="fse-ctf-stages">
        {stages.map((stage) => (
          <div className="fse-ctf-stage" key={stage.number}>
            <span className="fse-ctf-stage-number">{stage.number}</span>
            <strong>{stage.title}</strong>
            <p>{stage.detail}</p>
          </div>
        ))}
      </div>

      <div className="fse-ctf-section-heading">
        <div>
          <span>NOVA SOLICITAÇÃO</span>
          <h2>Configure sua avaliação</h2>
        </div>
      </div>

      <form onSubmit={submit} className="fse-ctf-form">
        <div className="fse-ctf-form-top">
          <div>
            <h3>Detalhes da avaliação</h3>
            <p>Informe o perfil e os objetivos técnicos desejados.</p>
          </div>
          <span className="fse-ctf-form-tag">Personalizada</span>
        </div>

        <div className="fse-ctf-field">
          <label htmlFor="fse-ctf-title">Título da avaliação</label>
          <input
            id="fse-ctf-title"
            required
            minLength={5}
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Analista SOC Pleno"
            disabled={submitting}
          />
          <span>Identifique a função ou especialidade que deseja avaliar.</span>
        </div>

        <div className="fse-ctf-field">
          <label htmlFor="fse-ctf-description">
            Competências e objetivos técnicos
          </label>
          <textarea
            id="fse-ctf-description"
            required
            minLength={15}
            maxLength={2000}
            rows={6}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descreva as habilidades, ferramentas e cenários técnicos que deseja avaliar..."
            disabled={submitting}
          />
          <span>{description.length}/2000 caracteres</span>
        </div>

        <div className="fse-ctf-form-bottom">
          <p>
            Nenhuma avaliação será publicada automaticamente.
            A preparação é realizada pela equipe FortifySec.
          </p>
          <button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner />
                Enviando solicitação...
              </>
            ) : (
              <>Solicitar CTF Empresarial <span aria-hidden="true">→</span></>
            )}
          </button>
        </div>
      </form>
      {whatsAppUrl && (
        <div className="fse-ctf-whatsapp-action" role="status">
          <div><strong>Solicitação registrada!</strong><p>Envie os detalhes para a equipe FortifySec pelo WhatsApp. O envio precisa ser confirmado no aplicativo.</p></div>
          <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">Enviar pelo WhatsApp ↗</a>
        </div>
      )}


      {message && (
        <div
          role="status"
          className={`fse-ctf-feedback ${messageType === 'error' ? 'is-error' : 'is-success'}`}
        >
          {message}
        </div>
      )}

      <div className="fse-ctf-section-heading fse-ctf-requests-heading">
        <div>
          <span>ACOMPANHAMENTO</span>
          <h2>Minhas solicitações</h2>
        </div>
        <button
          type="button"
          className="fse-ctf-reload"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? <Spinner /> : '↻'} Atualizar
        </button>
      </div>

      {loading ? (
        <div className="fse-ctf-state" role="status">
          <Spinner />
          <strong>Carregando solicitações...</strong>
        </div>
      ) : loadError ? (
        <div className="fse-ctf-state is-error" role="alert">
          <strong>Não foi possível carregar as solicitações</strong>
          <p>{loadError}</p>
          <button type="button" onClick={() => void load()}>
            Tentar novamente
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="fse-ctf-state">
          <span className="fse-ctf-empty-symbol">◇</span>
          <strong>Nenhuma solicitação registrada</strong>
          <p>Suas avaliações solicitadas aparecerão nesta área.</p>
        </div>
      ) : (
        <div className="fse-ctf-request-grid">
          {items.map((item) => (
            <article className="fse-ctf-request-card" key={item.id}>
              <div className="fse-ctf-request-top">
                <span className="fse-ctf-request-type">AVALIAÇÃO TÉCNICA</span>
                <span className={`fse-ctf-status fse-ctf-status-${item.status.replace(/[^a-z0-9_-]/gi, '')}`}>
                  {statusLabel(item.status)}
                </span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="fse-ctf-request-bottom">
                <span>Solicitação {formatDate(item.created_at)}</span>
                <span>FortifySec Enterprise</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
