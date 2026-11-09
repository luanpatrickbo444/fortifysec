import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = supabaseAdmin();

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('published', 1)
      .order('id', { ascending: false });

    if (coursesError) {
      throw coursesError;
    }

    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*, courses!inner(published)')
      .eq('published', 1)
      .eq('courses.published', 1)
      .order('course_id', { ascending: true })
      .order('position', { ascending: true })
      .order('id', { ascending: true });

    if (lessonsError) {
      throw lessonsError;
    }

    const publicLessons = (lessons ?? []).map(
      ({ courses: _courses, ...lesson }) => {
        void _courses;
        return {
          ...lesson,
          video: lesson.video
            ? `/api/academy/video/${lesson.id}`
            : '',
        };
      }
    );

    return NextResponse.json({
      courses: courses ?? [],
      lessons: publicLessons,
    });
  } catch (error) {
    console.error('Erro na Academy:', error);

    return NextResponse.json(
      { error: 'Erro ao carregar treinamentos' },
      { status: 500 }
    );
  }
}
