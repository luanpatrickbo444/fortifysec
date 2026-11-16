import 'server-only';
import { createClient } from '@supabase/supabase-js';

const authOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
};

export function empresasAdmin() {
  const url = process.env.FS_EMPRESAS_SUPABASE_URL;
  const key = process.env.FS_EMPRESAS_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase empresarial não configurado');
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('FS_EMPRESAS_SUPABASE_URL possui formato inválido');
  }
  if (
    parsed.protocol !== 'https:' ||
    parsed.hostname !== 'upmfshdspdkhrqmvmmgl.supabase.co'
  ) {
    throw new Error('FS_EMPRESAS_SUPABASE_URL aponta para projeto inesperado');
  }

  return createClient(url, key, authOptions);
}

export function empresasAuth() {
  const url = process.env.FS_EMPRESAS_SUPABASE_URL;
  const key = process.env.FS_EMPRESAS_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase empresarial não configurado');
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('FS_EMPRESAS_SUPABASE_URL possui formato inválido');
  }
  if (
    parsed.protocol !== 'https:' ||
    parsed.hostname !== 'upmfshdspdkhrqmvmmgl.supabase.co'
  ) {
    throw new Error('FS_EMPRESAS_SUPABASE_URL aponta para projeto inesperado');
  }

  return createClient(url, key, authOptions);
}
