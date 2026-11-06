import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Context) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  const id = Number((await params).id);
  const x = await req.json();

  if (!Number.isSafeInteger(id) || id < 1 || !String(x.title || '').trim()) {
    return NextResponse.json(
      { error: 'Dados inválidos' },
      { status: 400 }
    );
  }

  const db = supabaseAdmin();

  const { data, error } = await db
    .from('academy_courses')
    .update({
      title: String(x.title).slice(0, 160),
      description: String(x.description || '').slice(0, 3000),
      category: String(x.category || 'Cybersegurança').slice(0, 100),
      cover: String(x.cover || '').slice(0, 1000),
      published: x.published ? 1 : 0
    })
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erro ao atualizar curso' },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: 'Curso não encontrado' },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Context) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  const id = Number((await params).id);

  if (!Number.isSafeInteger(id) || id < 1) {
    return NextResponse.json(
      { error: 'ID inválido' },
      { status: 400 }
    );
  }

  const db = supabaseAdmin();

  const { data, error } = await db
    .from('academy_courses')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erro ao excluir curso' },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: 'Curso não encontrado' },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
