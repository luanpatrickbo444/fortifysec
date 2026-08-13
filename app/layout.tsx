"use client";
import {useEffect,useState} from "react";
import {usePathname,useRouter} from "next/navigation";
import {apiFetch} from "@/lib/api-client";
export default function AdminLayout({children}:{children:React.ReactNode}){const path=usePathname();const router=useRouter();const[ready,setReady]=useState(false);useEffect(()=>{if(path!=="/admin/login"&&path!=="/admin/logout")apiFetch("/api/admin/content").then(()=>setReady(true)).catch(()=>router.replace("/admin/login"))},[path,router]);if(path==="/admin/login"||path==="/admin/logout")return children;if(!ready)return <main className="portal-root portal-loading"><div><div className="portal-loader"/><p className="portal-label">VALIDANDO PERMISSÃO ADMINISTRATIVA...</p></div></main>;return children}
