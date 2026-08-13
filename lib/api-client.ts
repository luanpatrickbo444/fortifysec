import { browserSupabase } from "./supabase";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const { data } = await browserSupabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Faça login para continuar.");
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Não foi possível concluir a operação.");
  return body;
}
