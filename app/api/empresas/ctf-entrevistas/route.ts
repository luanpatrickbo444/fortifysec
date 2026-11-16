import { companyContext, errorResponse } from '@/lib/empresas-auth';
import { arenaTalents } from '@/lib/empresas-arena';

export async function GET() {
  const c = await companyContext();

  if (!c) return errorResponse('Não autorizado', 401);

  const { data, error } = await c.admin
    .from('fs_company_ctf_interviews')
    .select('id,ctfd_user_id,talent_name,job_title,message,status,created_at,responded_at')
    .eq('company_id', c.company.id)
    .order('created_at', { ascending: false });

  if (error) {
    return errorResponse('Falha ao consultar entrevistas', 500);
  }

  return Response.json({ items: data || [] });
}

export async function POST(req: Request) {
  const c = await companyContext();

  if (!c) return errorResponse('Não autorizado', 401);

  const body = await req.json().catch(() => ({}));

  const talentId = body?.talent_id;
  const jobTitle = typeof body?.job_title === 'string'
    ? body.job_title.trim()
    : '';
  const message = typeof body?.message === 'string'
    ? body.message.trim()
    : '';

  if (
    typeof talentId !== 'string' ||
    !/^ctf:[1-9]\d*$/.test(talentId)
  ) {
    return errorResponse('Participante CTF inválido', 400);
  }

  if (
    jobTitle.length < 5 ||
    jobTitle.length > 120 ||
    message.length < 15 ||
    message.length > 2000
  ) {
    return errorResponse('Preencha a vaga e a mensagem corretamente', 400);
  }

  const numericId = Number(talentId.slice(4));

  if (!Number.isSafeInteger(numericId) || numericId > 2147483647) {
    return errorResponse('Identificador inválido', 400);
  }

  let talents;

  try {
    talents = await arenaTalents();
  } catch {
    return errorResponse('CTFd temporariamente indisponível', 503);
  }

  if (!talents.configured) {
    return errorResponse('Integração CTF não configurada', 503);
  }

  const talent = talents.items.find(
    item => Number(item.id) === numericId
  );

  if (!talent) {
    return errorResponse('Participante não encontrado', 404);
  }

  const { data, error } = await c.admin
    .from('fs_company_ctf_interviews')
    .insert({
      company_id: c.company.id,
      requested_by: c.user.id,
      ctfd_user_id: numericId,
      talent_name: talent.name,
      job_title: jobTitle,
      message,
      status: 'pending',
    })
    .select('id,status')
    .single();

  if (error) {
    if (error.code === '23505') {
      return errorResponse(
        'Já existe uma solicitação pendente para este participante',
        409
      );
    }

    console.error('CTF_INTERVIEW_INSERT_ERROR', error.code);
    return errorResponse('Falha ao registrar entrevista', 500);
  }

  return Response.json({ ok: true, interview: data }, { status: 201 });
}
