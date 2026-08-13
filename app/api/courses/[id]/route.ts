import { NextResponse } from "next/server";
import { adminSupabase, authenticatedUser, youtubeId } from "@/lib/supabase";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await authenticatedUser(request); if (!user) return NextResponse.json({error:"Não autorizado."},{status:401});
  const { id } = await context.params; const db = adminSupabase();
  const [{data:profile},{data:enrollment}] = await Promise.all([
    db.from("profiles").select("role").eq("id",user.id).single(),
    db.from("enrollments").select("id").eq("user_id",user.id).eq("course_id",id).eq("status","active").maybeSingle(),
  ]);
  if (profile?.role !== "admin" && !enrollment) return NextResponse.json({error:"Curso ainda não liberado."},{status:403});
  let courseQuery = db.from("courses").select("*,modules(*,lessons(*))").eq("id",id);
  if (profile?.role !== "admin") courseQuery = courseQuery.eq("published", true);
  const {data:course,error}=await courseQuery.single();
  if(error)return NextResponse.json({error:error.message},{status:404});
  const {data:progress}=await db.from("lesson_progress").select("lesson_id,completed,watched_seconds").eq("user_id",user.id);
  course.modules?.sort((a:{position:number},b:{position:number})=>a.position-b.position);
  course.modules?.forEach((m:{lessons:Array<{position:number,youtube_url:string,youtube_id?:string}>})=>{m.lessons.sort((a,b)=>a.position-b.position);m.lessons.forEach(l=>{l.youtube_id=youtubeId(l.youtube_url||"");});});
  return NextResponse.json({course,progress:progress||[]});
}
