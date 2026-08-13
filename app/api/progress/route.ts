import { NextResponse } from "next/server";
import { adminSupabase, authenticatedUser } from "@/lib/supabase";
import { integer, uuid } from "@/lib/security";

export async function POST(request: Request) {
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const body = await request.json();
    const lessonId = uuid(body.lessonId);
    const watchedSeconds = integer(body.watchedSeconds ?? 0, 0, 86400);
    const db = adminSupabase();
    const { data: lesson } = await db.from("lessons").select("module_id").eq("id", lessonId).eq("published", true).maybeSingle();
    if (!lesson) return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
    const { data: module } = await db.from("modules").select("course_id").eq("id", lesson.module_id).maybeSingle();
    if (!module) return NextResponse.json({ error: "Módulo não encontrado." }, { status: 404 });
    const [{ data: profile }, { data: enrollment }] = await Promise.all([
      db.from("profiles").select("role").eq("id", user.id).maybeSingle(),
      db.from("enrollments").select("id").eq("user_id", user.id).eq("course_id", module.course_id).eq("status", "active").maybeSingle(),
    ]);
    if (profile?.role !== "admin" && !enrollment) return NextResponse.json({ error: "Matrícula não liberada." }, { status: 403 });
    const { error } = await db.from("lesson_progress").upsert({ user_id: user.id, lesson_id: lessonId, completed: body.completed === true, watched_seconds: watchedSeconds, updated_at: new Date().toISOString() });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Requisição inválida." }, { status: 400 });
  }
}
