import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET(request:Request){const url=new URL(request.url);const token_hash=url.searchParams.get('token_hash');const type=url.searchParams.get('type') as EmailOtpType|null;const rawNext=url.searchParams.get('next')||'/dashboard';const next=rawNext.startsWith('/')&&!rawNext.startsWith('//')?rawNext:'/dashboard';if(token_hash&&type){const supabase=await createClient();const {error}=await supabase.auth.verifyOtp({type,token_hash});if(!error)return NextResponse.redirect(new URL(next,url.origin))}return NextResponse.redirect(new URL('/login?erro=Link%20inválido%20ou%20expirado',url.origin))}
