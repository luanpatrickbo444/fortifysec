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

  return createClient(url, key, authOptions);
}

export function empresasAuth() {
  const url = process.env.FS_EMPRESAS_SUPABASE_URL;
  const key = process.env.FS_EMPRESAS_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase empresarial não configurado');
  }

  return createClient(url, key, authOptions);
}
