import { NextResponse } from "next/server";
import { adminSupabase, authenticatedUser } from "@/lib/supabase";
import { cleanText, integer, safeUrl, slug, uuid, youtubeUrl } from "@/lib/security";

async function requireAdmin(request: Request) {
  const user = await authenticatedUser(request);
  if (!user) return null;
  const { data } = await adminSupabase().from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data?.role === "admin" ? user : null;
}

export async function GET(request: Request) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  const db = adminSupabase();
  const [{ data: courses, error: coursesError }, { data: students, error: studentsError }] = await Promise.all([
    db.from("courses").select("*,modules(*,lessons(*))").order("position"),
    db.from("profiles").select("id,email,full_name,created_at,enrollments(id,status,source,enrolled_at,course_id,courses(title))").eq("role", "student").order("created_at", { ascending: false }),
  ]);
  if (coursesError || studentsError) return NextResponse.json({ error: "Não foi possível carregar o painel." }, { status: 500 });
  return NextResponse.json({ courses, students }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 32_000) return NextResponse.json({ error: "Payload muito grande." }, { status: 413 });
  try {
    const body = await request.json();
    const db = adminSupabase();
    let result;
    if (body.action === "course") {
      result = await db.from("courses").insert({ title: cleanText(body.title, 150), slug: slug(body.slug), description: cleanText(body.description, 2000, false), thumbnail_url: safeUrl(body.thumbnailUrl), workload_hours: integer(body.hours ?? 0, 0, 5000), published: true, position: integer(body.position ?? 0, 0, 10000) }).select().single();
    } else if (body.action === "module") {
      result = await db.from("modules").insert({ course_id: uuid(body.courseId), title: cleanText(body.title, 150), position: integer(body.position ?? 0, 0, 10000) }).select().single();
    } else if (body.action === "lesson") {
      result = await db.from("lessons").insert({ module_id: uuid(body.moduleId), title: cleanText(body.title, 150), description: cleanText(body.description, 4000, false), youtube_url: youtubeUrl(body.youtubeUrl), duration_minutes: integer(body.duration ?? 0, 0, 1440), position: integer(body.position ?? 0, 0, 10000), published: true }).select().single();
    } else if (body.action === "enroll") {
      const email = cleanText(body.email, 320).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("E-mail inválido.");
      const { data: student } = await db.from("profiles").select("id,role").eq("email", email).maybeSingle();
      if (!student || student.role !== "student") return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });
      result = await db.from("enrollments").upsert({ user_id: student.id, course_id: uuid(body.courseId), status: "active", source: "manual" }, { onConflict: "user_id,course_id" }).select().single();
    } else if (body.action === "studentStatus") {
      const status = body.status === "active" ? "active" : body.status === "blocked" ? "blocked" : null;
      if (!status) throw new Error("Status inválido.");
      result = await db.from("enrollments").update({ status }).eq("id", uuid(body.enrollmentId)).select().single();
    } else {
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
    }
    if (result.error) return NextResponse.json({ error: "Não foi possível salvar a alteração." }, { status: 400 });
    return NextResponse.json({ item: result.data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Requisição inválida." }, { status: 400 });
  }
}
