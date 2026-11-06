import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const db = supabaseAdmin();

    const [coursesResult, lessonsResult] = await Promise.all([
      db.from('academy_courses').select('*').order('id', { ascending: false }),
      db.from('academy_lessons').select('*')
        .order('course_id')
        .order('position')
        .order('id')
    ]);

    if (coursesResult.error) throw coursesResult.error;
    if (lessonsResult.error) throw lessonsResult.error;

    return NextResponse.json({
      courses: coursesResult.data ?? [],
      lessons: lessonsResult.data ?? []
    });
  } catch (error) {
    console.error('Erro ao listar cursos:', error);
    return NextResponse.json(
      { error: 'Erro ao consultar cursos' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const x = await req.json();

    if (!String(x.title || '').trim()) {
      return NextResponse.json(
        { error: 'Informe o título' },
        { status: 400 }
      );
    }

    const db = supabaseAdmin();

    const { data, error } = await db
      .from('academy_courses')
      .insert({
        title: String(x.title).slice(0, 160),
        description: String(x.description || '').slice(0, 3000),
        category: String(x.category || 'Cybersegurança').slice(0, 100),
        cover: String(x.cover || '').slice(0, 1000),
        published: x.published ? 1 : 0
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error('Erro ao cadastrar curso:', {
      message: error instanceof Error ? error.message : String(error),
      details: error
    });
    return NextResponse.json(
      { error: 'Erro ao cadastrar curso' },
      { status: 500 }
    );
  }
}
