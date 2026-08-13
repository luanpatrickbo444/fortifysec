"use client";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {browserSupabase} from "@/lib/supabase";
export default function AdminLogout(){const router=useRouter();useEffect(()=>{browserSupabase().auth.signOut().finally(()=>router.replace("/admin/login"))},[router]);return <main className="portal-root portal-loading"><div><div className="portal-loader"/><p className="portal-label">ENCERRANDO SESSÃO...</p></div></main>}
