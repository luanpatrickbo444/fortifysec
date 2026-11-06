import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const type = String(body.type || '');
    const size = Number(body.size);

    const extensions: Record<string, string> = {
      'video/mp4': 'mp4',
      'video/webm': 'webm'
    };

    if (!extensions[type]) {
      return NextResponse.json(
        { error: 'Use vídeos MP4 ou WebM' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(size) || size <= 0 || size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'O vídeo deve ter no máximo 50 MB' },
        { status: 413 }
      );
    }

    const path = `${randomUUID()}.${extensions[type]}`;

    const { data, error } = await supabaseAdmin()
      .storage
      .from('academy-videos')
      .createSignedUploadUrl(path);

    if (error) throw error;

    return NextResponse.json({
      path: data.path,
      token: data.token,
      video: `storage:${data.path}`
    });
  } catch (error) {
    console.error('Erro ao autorizar upload:', error);

    return NextResponse.json(
      { error: 'Não foi possível autorizar o upload' },
      { status: 500 }
    );
  }
}
