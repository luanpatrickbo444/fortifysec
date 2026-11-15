import { companyContext, errorResponse } from '@/lib/empresas-auth';
import { arenaTalents } from '@/lib/empresas-arena';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await companyContext();

  if (!ctx) {
    return errorResponse('Não autorizado', 401);
  }

  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return errorResponse('Identificador inválido', 400);
  }

  try {
    const result = await arenaTalents();

    if (!result.configured) {
      return errorResponse('Integração CTF não configurada', 503);
    }

    const talent = result.items.find(item => item.id === id);

    if (!talent) {
      return errorResponse('Talento indisponível', 404);
    }

    return Response.json({ item: talent });
  } catch {
    return errorResponse('CTF indisponível', 502);
  }
}
