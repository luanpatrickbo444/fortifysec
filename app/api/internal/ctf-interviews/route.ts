import { NextRequest, NextResponse } from 'next/server';
import { empresasAdmin } from '@/lib/empresas-supabase';
import { timingSafeEqual } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorized(req: NextRequest): boolean {
  const expected = process.env.FORTIFYSEC_CTF_INTERVIEWS_TOKEN;
  const supplied = req.headers.get('authorization') || '';
  if (!expected || !supplied.startsWith('Bearer ')) return false;

  const a = Buffer.from(supplied.slice(7));
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
}

function studentId(req: NextRequest): number | null {
  const raw = req.nextUrl.searchParams.get('student_id');
  if (!raw || !/^[1-9]\d*$/.test(raw)) return null;

  const id = Number(raw);
  return Number.isSafeInteger(id) && id <= 2147483647 ? id : null;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const id = studentId(req);
  if (!id) {
    return NextResponse.json({ error: 'Aluno inválido' }, { status: 400 });
  }

  try {
    const { data, error } = await empresasAdmin()
      .from('fs_company_ctf_interviews')
      .select('id,job_title,message,status,created_at,responded_at')
      .eq('ctfd_user_id', id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json(
      { items: data || [] },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      { error: 'Falha ao consultar entrevistas' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  const id = body?.student_id;
  const interviewId = body?.interview_id;
  const action = body?.action;

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    id > 2147483647 ||
    typeof interviewId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(interviewId) ||
    !['accepted', 'declined'].includes(action)
  ) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }

  try {
    const { data, error } = await empresasAdmin()
      .from('fs_company_ctf_interviews')
      .update({
        status: action,
        responded_at: new Date().toISOString(),
      })
      .eq('id', interviewId)
      .eq('ctfd_user_id', id)
      .eq('status', 'pending')
      .select('id,status,responded_at')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Entrevista inexistente ou já respondida' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { ok: true, interview: data },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      { error: 'Falha ao responder entrevista' },
      { status: 500 }
    );
  }
}
