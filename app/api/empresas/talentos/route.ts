import { companyContext, errorResponse } from '@/lib/empresas-auth';
import { arenaTalents } from '@/lib/empresas-arena';

export async function GET(req: Request) {
  const context = await companyContext();
  if (!context) return errorResponse('Não autorizado', 401);

  const q = (new URL(req.url).searchParams.get('q') || '')
    .trim()
    .toLocaleLowerCase('pt-BR')
    .slice(0, 80);

  try {
    const [ctf, profiles] = await Promise.all([
      arenaTalents(),
      context.admin
        .from('profiles')
        .select('id,name,full_name,headline,xp')
        .eq('role', 'student')
        .eq('blocked', false)
        .eq('profile_public', true)
        .eq('open_to_work', true)
        .order('xp', { ascending: false })
        .limit(500),
    ]);

    if (profiles.error) {
      console.error('FORTIFYSEC_PROFILES_ERROR', {
        code: profiles.error.code,
        message: profiles.error.message,
        details: profiles.error.details,
        hint: profiles.error.hint,
      });
      return errorResponse('Falha ao consultar perfis', 500);
    }

    const ctfItems = ctf.items.map(t => ({
      ...t,
      id: `ctf:${t.id}`,
    }));

    const profileItems = (profiles.data || []).map(p => ({
      id: p.id,
      name: p.full_name?.trim() || p.name || 'Aluno',
      headline: p.headline || null,
      score: p.xp || 0,
      solved_challenges: 0,
      labs_completed: 0,
      position: 0,
    }));

    const items = [...ctfItems, ...profileItems]
      .filter(t =>
        `${t.name} ${t.headline || ''}`
          .toLocaleLowerCase('pt-BR')
          .includes(q)
      );

    return Response.json({
      configured: true,
      items,
    });
  } catch (error) {
    console.error('FORTIFYSEC_TALENTS_ERROR', {
      type: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    });

    return errorResponse('Falha ao consultar talentos', 502);
  }
}
