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
  const courses = profile?.role === "admin" ? data : (data || []).map((row: Record<string, unknown>) => row.courses);
  return NextResponse.json({ user: { email: user.email, name: profile?.full_name, role: profile?.role }, courses });
}
