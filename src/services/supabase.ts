import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
export const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

const PLACEHOLDER_URLS = new Set([
  'https://your-project.supabase.co',
  'https://your-project-id.supabase.co',
  'your-supabase-url',
]);

const PLACEHOLDER_KEYS = new Set([
  'your-anon-key-here',
  'your-publishable-or-anon-key-here',
  'your-supabase-anon-key',
]);

const isUrlValid = Boolean(
  supabaseUrl &&
    !PLACEHOLDER_URLS.has(supabaseUrl) &&
    /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supabaseUrl)
);

const isKeyValid = Boolean(supabaseAnonKey && !PLACEHOLDER_KEYS.has(supabaseAnonKey));

export const isSupabaseConfigured = Boolean(isUrlValid && isKeyValid);

const getMissingVarsList = (): string[] => {
  const missing: string[] = [];
  if (!isUrlValid) missing.push('VITE_SUPABASE_URL');
  if (!isKeyValid) missing.push('VITE_SUPABASE_ANON_KEY');
  return missing;
};

export const supabaseConfigError: string | null = isSupabaseConfigured
  ? null
  : `Supabase configuration error: Missing or placeholder value for ${getMissingVarsList().join(
      ' and '
    )}. Set these variables in your local .env file or in Netlify → Site configuration → Environment variables, then redeploy.`;

if (!isSupabaseConfigured && typeof console !== 'undefined') {
  console.error(`[NARMIS] ${supabaseConfigError}`);
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
