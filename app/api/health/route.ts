import { NextResponse } from 'next/server'
export function GET(){return NextResponse.json({ok:true,service:'fortify-cloud-web',time:new Date().toISOString()})}
