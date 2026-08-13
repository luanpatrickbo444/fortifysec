import { NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/supabase";
import { COURSE_PRICE, PRODUCT_ID, siteOrigin } from "@/lib/security";

export async function POST(request: Request) {
  const user = await authenticatedUser(request);
  if (!user?.email) return NextResponse.json({ error: "Crie sua conta ou entre para vincular a compra ao seu acesso." }, { status: 401 });
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      { error: "O checkout está sendo ativado. Entre na lista prioritária para receber o aviso de abertura." },
      { status: 503 },
    );
  }

  let origin: string;
  try { origin = siteOrigin(request); } catch { return NextResponse.json({ error: "URL pública não configurada." }, { status: 503 }); }
  const preference = {
    items: [{ id: PRODUCT_ID, title: "FortifySec — Formação Completa em Cybersecurity", description: "Oferta da primeira turma: 37 cursos, 633 horas, laboratórios e certificação", category_id: "services", quantity: 1, currency_id: "BRL", unit_price: COURSE_PRICE }],
    payment_methods: { excluded_payment_types: [{ id: "ticket" }, { id: "atm" }], installments: 12 },
    payer: { email: user.email },
    back_urls: { success: `${origin}/area?payment=success`, pending: `${origin}/area?payment=pending`, failure: `${origin}/?payment=failure#oferta` },
    notification_url: `${origin}/api/mercadopago/webhook`,
    auto_return: "approved",
    external_reference: user.id,
    statement_descriptor: "FORTIFYSEC",
    metadata: { product: PRODUCT_ID, user_id: user.id, course_count: 37, workload_hours: 633 },
  };

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", "X-Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify(preference),
  });
  const data = await response.json() as { init_point?: string; message?: string };
  if (!response.ok || !data.init_point) return NextResponse.json({ error: "Não foi possível iniciar o pagamento. Tente novamente." }, { status: 502 });
  return NextResponse.json({ checkoutUrl: data.init_point });
}
