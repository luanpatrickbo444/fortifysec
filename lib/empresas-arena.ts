import 'server-only';

export type Talent = {
  id: string;
  name: string;
  headline: string | null;
  score: number;
  solved_challenges: number;
  labs_completed: number;
  position: number;
};

export async function arenaTalents(): Promise<{
  configured: boolean;
  items: Talent[];
}> {
  const endpoint = process.env.FORTIFYSEC_ARENA_TALENTS_URL;
  const key = process.env.FORTIFYSEC_ARENA_READ_TOKEN;

  if (!endpoint || !key) {
    return { configured: false, items: [] };
  }

  const parsed = new URL(endpoint);

  if (
    parsed.protocol !== 'https:' &&
    !(parsed.hostname === '127.0.0.1' && parsed.protocol === 'http:')
  ) {
    throw new Error('Endpoint CTF inseguro');
  }

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${key}`,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error('CTF indisponível');
  }

  const payload: unknown = await response.json();

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('items' in payload) ||
    !Array.isArray(payload.items)
  ) {
    throw new Error('Resposta CTF inválida');
  }

  const valid = (value: unknown): value is Talent => {
    if (typeof value !== 'object' || value === null) return false;

    const item = value as Record<string, unknown>;

    return (
      typeof item.id === 'string' &&
      /^\d+$/.test(item.id) &&
      typeof item.name === 'string' &&
      item.name.trim().length > 0 &&
      typeof item.score === 'number' &&
      Number.isFinite(item.score) &&
      typeof item.solved_challenges === 'number' &&
      Number.isInteger(item.solved_challenges) &&
      typeof item.labs_completed === 'number' &&
      Number.isInteger(item.labs_completed) &&
      typeof item.position === 'number' &&
      Number.isInteger(item.position)
    );
  };

  const items: Talent[] = (payload.items as unknown[])
    .filter(valid)
    .slice(0, 100)
    .map(item => ({
      id: item.id,
      name: item.name,
      headline: typeof item.headline === 'string'
        ? item.headline
        : null,
      score: item.score,
      solved_challenges: item.solved_challenges,
      labs_completed: item.labs_completed,
      position: item.position,
    }));

  return { configured: true, items };
}
