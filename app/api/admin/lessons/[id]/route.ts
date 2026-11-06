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

  try {
    const id = Number((await params).id);
    const x = await req.json();

    if (
      !Number.isSafeInteger(id) ||
      id < 1 ||
      !String(x.title || '').trim()
    ) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    const position = Number(x.position ?? 0);

    if (!Number.isSafeInteger(position) || position < 0) {
      return NextResponse.json(
        { error: 'Ordem da aula inválida' },
        { status: 400 }
      );
    }

    const db = supabaseAdmin();

    const { data, error } = await db
      .from('academy_lessons')
      .update({
        module: String(x.module || 'Módulo 1').slice(0, 150),
        title: String(x.title).trim().slice(0, 160),
        description: String(x.description || '').slice(0, 3000),
        video: String(x.video || '').slice(0, 1000),
        duration: String(x.duration || '').slice(0, 50),
        position,
        published: x.published ? 1 : 0
      })
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro ao editar aula:', error);

    return NextResponse.json(
      { error: 'Erro ao atualizar videoaula' },
      { status: 500 }
    );
  }
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

  try {
    const db = supabaseAdmin();

    const { data, error } = await db
      .from('academy_lessons')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro ao excluir aula:', error);

    return NextResponse.json(
      { error: 'Erro ao excluir videoaula' },
      { status: 500 }
    );
  }
}
