import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase para uso EXCLUSIVO em Server Actions e Server Components.
 * Utiliza SERVICE ROLE KEY - NUNCA exponha este cliente no client-side.
 */
export function createServerClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('[Supabase Server] Variáveis de ambiente faltando. Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            persistSession: false, // Sem persistência de sessão no server
            autoRefreshToken: false,
        },
    });
}
