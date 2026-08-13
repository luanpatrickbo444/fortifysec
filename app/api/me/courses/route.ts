import { NextResponse } from "next/server";
import { adminSupabase, authenticatedUser } from "@/lib/supabase";

export async function GET(request: Request) {
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const db = adminSupabase();
  const { data: profile } = await db.from("profiles").select("role,full_name").eq("id", user.id).single();
  const query = profile?.role === "admin"
    ? db.from("courses").select("*").order("position")
    : db.from("enrollments").select("status,courses(*)").eq("user_id", user.id).eq("status", "active");
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const courses = (profile?.role === "admin"
    ? data
    : (data || []).map((row: Record<string, unknown>) => row.courses)
  ).filter(Boolean);

  const courseIds = courses.map((course: { id: string }) => course.id);
  let totalLessons = 0;
  let completedLessons = 0;

  if (courseIds.length > 0) {
    const { data: modules, error: modulesError } = await db
      .from("modules")
      .select("id")
      .in("course_id", courseIds);
    if (modulesError) return NextResponse.json({ error: modulesError.message }, { status: 500 });

    const moduleIds = (modules || []).map((module) => module.id);
    if (moduleIds.length > 0) {
      const { data: lessons, error: lessonsError } = await db
        .from("lessons")
        .select("id")
        .in("module_id", moduleIds)
        .eq("published", true);
      if (lessonsError) return NextResponse.json({ error: lessonsError.message }, { status: 500 });

      const lessonIds = (lessons || []).map((lesson) => lesson.id);
      totalLessons = lessonIds.length;
      if (lessonIds.length > 0) {
        const { count, error: progressError } = await db
          .from("lesson_progress")
          .select("lesson_id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("completed", true)
          .in("lesson_id", lessonIds);
        if (progressError) return NextResponse.json({ error: progressError.message }, { status: 500 });
        completedLessons = count || 0;
      }
    }
  }

  const progressPercent = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  return NextResponse.json({
    user: { email: user.email, name: profile?.full_name, role: profile?.role },
    courses,
    summary: { totalLessons, completedLessons, progressPercent },
  });
}
