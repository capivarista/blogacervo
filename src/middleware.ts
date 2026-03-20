import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de Autenticação - Muralha de Rotas
 * 
 * Regras:
 * - Rotas públicas: /, /login, /register, estáticos (_next, favicon, assets)
 * - Todas as outras rotas exigem cookie de sessão (user_id)
 */
export function middleware(request: NextRequest) {
    const userId = request.cookies.get('user_id')?.value;

    // Lista de rotas públicas (não exigem autenticação)
    const publicPaths = [
        '/',
        '/login',
        '/register',
    ];

    // Padrões de rotas estáticas (Next.js internals, assets, etc.)
    const staticPatterns = [
        /^\/_next\//,           // Next.js static files
        /^\/favicon\.ico$/,     // Favicon
        /^\/api\//,             // API routes (pode ter auth própria)
        /^\/static\//,          // Static assets
        /^\/assets\//,          // Assets
    ];

    // Verifica se é rota estática
    if (staticPatterns.some(pattern => pattern.test(request.nextUrl.pathname))) {
        return NextResponse.next();
    }

    // Verifica se é rota pública explícita
    if (publicPaths.some(path => request.nextUrl.pathname === path)) {
        return NextResponse.next();
    }

    // Todas as outras rotas exigem autenticação
    if (!userId) {
        // Redireciona para login preservando query params
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Usuário autenticado - continua normal
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match todas as rotas exceto:
         * - _next/static (arquivos estáticos)
         * - _next/image (otimização de imagens)
         * - favicon.ico
         * - sitemap.xml, robots.txt (se existir)
         */
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
