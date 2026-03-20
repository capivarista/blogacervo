import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente Supabase para uso EXCLUSIVO no client-side (components, hooks, pages).
 * Utiliza ANON KEY - seguro para expor no browser.
 */
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('[Supabase Client] Variáveis de ambiente faltando. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
