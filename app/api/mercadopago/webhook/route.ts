import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase";
import { COURSE_PRICE, COURSE_SLUG, PRODUCT_ID, uuid } from "@/lib/security";

type Payment = { id: number; status: string; currency_id: string; transaction_amount: number; external_reference?: string; metadata?: { user_id?: string; product?: string } };

function validSignature(request: Request, dataId: string) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!secret || !signature || !requestId) return false;
  const parts = Object.fromEntries(signature.split(",").map((part) => part.trim().split("=", 2)));
  const timestamp = Number(parts.ts);
  const timestampMs = timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000;
  if (!Number.isInteger(timestamp) || Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000 || !/^[a-f0-9]{64}$/i.test(parts.v1 || "")) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = Buffer.from(createHmac("sha256", secret).update(manifest).digest("hex"), "utf8");
  const received = Buffer.from(parts.v1, "utf8");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 64_000) return NextResponse.json({ error: "Payload muito grande." }, { status: 413 });
  const body = await request.json().catch(() => null);
  const url = new URL(request.url);
  const paymentId = String(body?.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id") || "");
  if (!/^\d{1,30}$/.test(paymentId) || !validSignature(request, paymentId)) return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: "Mercado Pago não configurado." }, { status: 503 });

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Pagamento não localizado." }, { status: 502 });
  const payment = await response.json() as Payment;
  let userId: string;
  try { userId = uuid(payment.external_reference || payment.metadata?.user_id); } catch { return NextResponse.json({ ok: true }); }
  const validProduct = payment.metadata?.product === PRODUCT_ID;
  const validAmount = payment.currency_id === "BRL" && Number(payment.transaction_amount) === COURSE_PRICE;
  const db = adminSupabase();
  const { error: eventError } = await db.from("payment_events").upsert({ payment_id: paymentId, user_id: userId, status: payment.status, amount: payment.transaction_amount, raw: payment });
  if (eventError) return NextResponse.json({ error: "Falha ao registrar evento." }, { status: 500 });
  if (!validProduct || !validAmount) return NextResponse.json({ ok: true });
  const [{ data: account }, { data: course }] = await Promise.all([
    db.auth.admin.getUserById(userId),
    db.from("courses").select("id").eq("slug", COURSE_SLUG).eq("published", true).maybeSingle(),
  ]);
  if (!account.user || !course) return NextResponse.json({ error: "Conta ou curso não configurado." }, { status: 500 });

  if (payment.status === "approved") {
    const { error } = await db.from("enrollments").upsert({ user_id: userId, course_id: course.id, status: "active", source: "mercadopago", payment_id: paymentId }, { onConflict: "user_id,course_id" });
    if (error) return NextResponse.json({ error: "Falha ao liberar matrícula." }, { status: 500 });
  } else if (["refunded", "charged_back", "cancelled"].includes(payment.status)) {
    const { error } = await db.from("enrollments").update({ status: "refunded" }).eq("user_id", userId).eq("course_id", course.id);
    if (error) return NextResponse.json({ error: "Falha ao atualizar matrícula." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
