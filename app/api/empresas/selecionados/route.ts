import { companyContext, errorResponse } from '@/lib/empresas-auth';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET() {
  const c = await companyContext();

  if (!c) return errorResponse('Não autorizado', 401);

  const { data, error } = await c.admin
    .from('fs_company_selections')
    .select('id,arena_talent_id,talent_name,created_at')
    .eq('company_id', c.company.id)
    .order('created_at', { ascending: false });

  if (error) return errorResponse('Falha ao listar selecionados', 500);

  return Response.json({ items: data || [] });
}

export async function POST(req: Request) {
  const c = await companyContext();

  if (!c) return errorResponse('Não autorizado', 401);

  const body = await req.json().catch(() => ({}));
  const talentId = body?.talent_id;

  if (typeof talentId !== 'string' || !UUID_RE.test(talentId)) {
    return errorResponse('Identificador inválido', 400);
  }

  const { data: talent, error: lookupError } = await c.admin
    .from('profiles')
    .select('id,name,full_name')
    .eq('id', talentId)
    .eq('role', 'student')
    .eq('blocked', false)
    .eq('profile_public', true)
    .eq('open_to_work', true)
    .maybeSingle();

  if (lookupError) {
    return errorResponse('Falha ao consultar talento', 500);
  }

  if (!talent) {
    return errorResponse('Talento indisponível para recrutamento', 404);
  }

  const talentName =
    talent.full_name?.trim() || talent.name || 'Aluno';

  const { error } = await c.admin
    .from('fs_company_selections')
    .upsert(
      {
        company_id: c.company.id,
        arena_talent_id: talent.id,
        talent_name: talentName,
      },
      { onConflict: 'company_id,arena_talent_id' }
    );

  if (error) {
    return errorResponse('Falha ao selecionar talento', 500);
  }

  return Response.json({ ok: true });
}
