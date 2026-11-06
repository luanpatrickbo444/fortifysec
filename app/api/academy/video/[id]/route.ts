import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: Context) {
  const id = Number((await params).id);

  if (!Number.isSafeInteger(id) || id < 1) {
    return new Response('Aula inválida', { status: 400 });
  }

  const db = supabaseAdmin();

  const { data: lesson, error } = await db
    .from('academy_lessons')
    .select('video,published,course_id')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Erro ao consultar aula:', error);
    return new Response('Erro interno', { status: 500 });
  }

  if (!lesson) {
    return new Response('Aula não encontrada', { status: 404 });
  }

  const admin = await isAdmin();

  if (!admin) {
    const { data: course, error: courseError } = await db
      .from('academy_courses')
      .select('published')
      .eq('id', lesson.course_id)
      .maybeSingle();

    if (courseError) {
      return new Response('Erro interno', { status: 500 });
    }

    if (lesson.published !== 1 || course?.published !== 1) {
      return new Response('Aula indisponível', { status: 404 });
    }
  }

  if (!lesson.video?.startsWith('storage:')) {
    return new Response('Vídeo não armazenado no Supabase', {
      status: 404
    });
  }

  const path = lesson.video.slice('storage:'.length);

  if (!/^[0-9a-f-]{36}\.(mp4|webm)$/.test(path)) {
    return new Response('Caminho inválido', { status: 400 });
  }

  const { data, error: signedError } = await db.storage
    .from('academy-videos')
    .createSignedUrl(path, 300);

  if (signedError || !data?.signedUrl) {
    console.error('Erro ao gerar URL do vídeo:', signedError);
    return new Response('Vídeo indisponível', { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl, {
    status: 307,
    headers: {
      'Cache-Control': 'private, no-store'
    }
  });
}
