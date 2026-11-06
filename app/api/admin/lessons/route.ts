import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const x = await req.json();
    const courseId = Number(x.course_id);

    if (
      !Number.isSafeInteger(courseId) ||
      courseId < 1 ||
      !String(x.title || '').trim()
    ) {
      return NextResponse.json(
        { error: 'Curso e título obrigatórios' },
        { status: 400 }
      );
    }

    const db = supabaseAdmin();

    const { data: course, error: courseError } = await db
      .from('academy_courses')
      .select('id')
      .eq('id', courseId)
      .maybeSingle();

    if (courseError) throw courseError;

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    const position = Number(x.position ?? 0);

    if (!Number.isSafeInteger(position) || position < 0) {
      return NextResponse.json(
        { error: 'Ordem da aula inválida' },
        { status: 400 }
      );
    }

    const { data, error } = await db
      .from('academy_lessons')
      .insert({
        course_id: courseId,
        module: String(x.module || 'Módulo 1').slice(0, 150),
        title: String(x.title).trim().slice(0, 160),
        description: String(x.description || '').slice(0, 3000),
        video: String(x.video || '').slice(0, 1000),
        duration: String(x.duration || '').slice(0, 50),
        position,
        published: x.published ? 1 : 0
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error('Erro ao cadastrar videoaula:', error);

    return NextResponse.json(
      { error: 'Erro ao cadastrar videoaula' },
      { status: 500 }
    );
  }
}
