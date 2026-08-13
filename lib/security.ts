export const COURSE_PRICE = 2997;
export const COURSE_SLUG = "formacao-fortifysec";
export const PRODUCT_ID = "fortifysec-formacao-completa";

export function cleanText(value: unknown, maxLength: number, required = true) {
  const text = String(value ?? "").trim().replace(/[\u0000-\u001f\u007f]/g, "");
  if (required && !text) throw new Error("Campo obrigatório não preenchido.");
  if (text.length > maxLength) throw new Error(`O campo excede ${maxLength} caracteres.`);
  return text;
}

export function integer(value: unknown, min: number, max: number) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) throw new Error("Valor numérico inválido.");
  return number;
}

export function uuid(value: unknown) {
  const id = String(value ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new Error("Identificador inválido.");
  return id;
}

export function slug(value: unknown) {
  const text = cleanText(value, 100).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text)) throw new Error("Slug inválido.");
  return text;
}

export function safeUrl(value: unknown, optional = true) {
  const text = cleanText(value, 2048, !optional);
  if (!text && optional) return "";
  const url = new URL(text);
  if (url.protocol !== "https:") throw new Error("A URL precisa utilizar HTTPS.");
  return url.toString();
}

export function youtubeUrl(value: unknown) {
  const text = cleanText(value, 2048);
  const url = new URL(text);
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (url.protocol !== "https:" || !["youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com"].includes(host)) throw new Error("Informe uma URL válida do YouTube usando HTTPS.");
  return url.toString();
}

export function siteOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const origin = configured || (process.env.NODE_ENV === "development" ? new URL(request.url).origin : "");
  if (!origin) throw new Error("NEXT_PUBLIC_SITE_URL não configurada.");
  const url = new URL(origin);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") throw new Error("NEXT_PUBLIC_SITE_URL precisa utilizar HTTPS.");
  return url.origin;
}
