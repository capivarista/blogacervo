# RELATÓRIO DE ANÁLISE E MELHORIAS – BLOG ACERVOBOOK

**Data da Auditoria:** 17 de Março de 2026  
**Auditor:** OpenClaw Agent  
**Status do Projeto:** Desenvolvimento → Produção Planejada

---

## RESUMO EXECUTIVO

O **Blog AcervoBook** é um sistema web bem estruturado com temática cyber/terminal, desenvolvido com Next.js 15, React 19, TypeScript, Prisma e Supabase. A arquitetura geral é sólida para um projeto de porte médio, mas existem **vulnerabilidades críticas de segurança** que devem ser resolvidas antes da implantação em produção.

**Pontos Fortes:**
- ✅ Uso adequado de Server Actions para operações sensíveis
- ✅ Cookies httpOnly para sessão
- ✅ Componentização clara e separação de responsabilidades no front-end
- ✅ Feedback ao usuário com Sonner (toasts)
- ✅ Tipagem TypeScript consistente na maior parte do código
- ✅ Design system coeso (tema cyber bem executado)

**Pontos Críticos:**
- ❌ Ausência de middleware para proteção de rotas
- ❌ Validação de upload insegura (sem verificação de MIME type real)
- ❌ Cliente Supabase único para client/server (anon key exposta)
- ❌ Falta de políticas RLS explícitas no banco
- ❌ Sem paginação no feed de posts (escalabilidade)
- ❌ Redundância no schema (role + is_admin)

---

## PRIORIDADE ALTA (Corrigir Imediatamente)

### 1. **Ausência de Middleware para Proteção de Rotas**

**Problema:** As páginas protegidas (ex.: `/app/page.tsx`) não possuem middleware que verifique autenticação antes do render. Um usuário pode acessar URLs diretamente se conhecer o caminho.

**Impacto:** Segurança crítica. Qualquer pessoa com o link pode acessar páginas restritas.

**Solução:** Criar `middleware.ts` na raiz do projeto:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const userId = request.cookies.get('user_id')?.value;
    
    // Rotas públicas
    const publicPaths = ['/', '/login', '/register'];
    if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
        return NextResponse.next();
    }
    
    // Todas as outras rotas exigem autenticação
    if (!userId) {
        const loginUrl = new URL('/', request.url);
        return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

**Por que:** Middleware executa antes do render da página, bloqueando acesso não autorizado no nível do servidor.

---

### 2. **Upload de Imagens sem Validação de MIME Type**

**Problema:** Em `NewPostForm.tsx` e `actions.ts`, a validação de upload verifica apenas:
- Tamanho (< 2MB)
- Extensão do arquivo (via `accept="image/*"`)

Não há verificação do **MIME type real** do buffer no servidor. Um atacante pode renomear `malware.exe` para `image.jpg` e burlar a validação.

**Impacto:** Segurança alta. Permite upload de arquivos maliciosos que podem ser executados ou distribuídos.

**Solução:** No servidor, validar o MIME type real usando magic bytes:

```typescript
// Em createPost action.ts
function validateImageBuffer(buffer: Buffer): boolean {
    // Magic bytes para PNG, JPEG, GIF, WebP
    const signatures = [
        [0x89, 0x50, 0x4E, 0x47],           // PNG
        [0xFF, 0xD8, 0xFF],                 // JPEG
        [0x47, 0x49, 0x46, 0x38],           // GIF
        [0x52, 0x49, 0x46, 0x46],           // WebP (RIFF)
    ];
    
    for (const sig of signatures) {
        if (sig.every((byte, i) => buffer[i] === byte)) {
            return true;
        }
    }
    return false;
}

// Uso na action
if (!validateImageBuffer(fileBuffer)) {
    return { error: 'Formato de arquivo inválido' };
}
```

**Alternativa:** Usar biblioteca `file-type`:
```bash
npm install file-type
```
```typescript
import { fileTypeFromBuffer } from 'file-type';

const type = await fileTypeFromBuffer(fileBuffer);
if (!type?.mime.startsWith('image/')) {
    return { error: 'Arquivo não é uma imagem válida' };
}
```

---

### 3. **Cliente Supabase Único para Client e Server**

**Problema:** `lib/supabase.ts` exporta um único cliente que usa `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Isso significa:
- O cliente server-side usa a mesma chave que o client
- Se não houver RLS (Row Level Security) no Supabase, qualquer usuário pode ler/escrever dados diretamente via browser
- Server Actions deveriam usar **service role key** para operações privilegiadas

**Impacto:** Segurança crítica. Dados podem ser manipulados diretamente do client se RLS não estiver configurado.

**Solução:** Criar dois clientes separados:

```typescript
// lib/supabase-server.ts (apenas server-side)
import { createClient } from '@supabase/supabase-js';

export function createServerClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ Nunca expor ao client
        {
            auth: { persistSession: false }
        }
    );
}
```

```typescript
// lib/supabase-client.ts (apenas client-side)
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
```

**Nas Server Actions:**
```typescript
// actions.ts
import { createServerClient } from '@/lib/supabase-server';

async function deletePost(postId: number) {
    const supabase = createServerClient();
    // Agora pode bypassar RLS com segurança
    await supabase.from('postagens').delete().eq('id', postId);
}
```

**Adicional:** Implementar RLS policies no Supabase Dashboard:
```sql
-- Posts: apenas autor ou admin pode delete
CREATE POLICY "Users can delete own posts"
    ON postagens FOR DELETE
    USING (auth.uid() = autor_id OR EXISTS (
        SELECT 1 FROM usuarios WHERE id = auth.uid() AND is_admin = true
    ));
```

---

### 4. **Falta de Validação de Senha Forte**

**Problema:** Em `registerAction`, não há validação de força da senha. Usuários podem criar senhas como `123456`.

**Impacto:** Segurança média-alta. Contas fracas são vulneráveis a brute-force.

**Solução:** Adicionar validação na action:

```typescript
function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
    if (password.length < 8) {
        return { valid: false, error: 'Senha deve ter mínimo 8 caracteres' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: 'Senha deve conter letra maiúscula' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, error: 'Senha deve conter número' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { valid: false, error: 'Senha deve conter caractere especial' };
    }
    return { valid: true };
}

// Na registerAction
const passwordValidation = validatePasswordStrength(password);
if (!passwordValidation.valid) {
    return { error: passwordValidation.error! };
}
```

**UX:** Mostrar requisitos no `RegisterForm.tsx`:
```tsx
<ul className="text-[10px] text-gray-500 font-mono mt-2 space-y-1">
    <li>• Mínimo 8 caracteres</li>
    <li>• 1 letra maiúscula</li>
    <li>• 1 número</li>
    <li>• 1 caractere especial</li>
</ul>
```

---

### 5. **Ausência de Paginação no Feed de Posts**

**Problema:** `getPosts()` faz `select *` sem limite. Com crescimento do banco, a query ficará lenta e consumirá muita memória.

**Impacto:** Performance crítica em produção. Tempo de carregamento aumenta linearmente com número de posts.

**Solução:** Implementar paginação cursor-based ou offset-based:

```typescript
// actions.ts
export async function getPosts(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    const { data, error } = await supabase
        .from('postagens')
        .select(`
            *,
            usuarios (nome_usuario),
            curtidas (count),
            comentarios (count)
        `)
        .order('data_criacao', { ascending: false })
        .range(offset, offset + limit - 1);
    
    return { data, error };
}
```

**No front-end:** Adicionar controles de paginação ou infinite scroll com `useEffect` que chama `getPosts(page + 1)` ao atingir o final da lista.

---

### 6. **Schema Redundante: `role` + `is_admin`**

**Problema:** O modelo `usuarios` tem ambos os campos:
```prisma
role               String?              @default("user")
is_admin           Boolean?             @default(false)
```

São redundantes. `role === 'admin'` e `is_admin === true` representam a mesma coisa.

**Impacto:** Qualidade de código e integridade de dados. Pode causar inconsistência (ex.: `role='user'` mas `is_admin=true`).

**Solução:** Manter apenas `role` com enum:

```prisma
model usuarios {
    id                 Int                  @id @default(autoincrement())
    nome_usuario       String
    email              String               @unique
    senha_hash         String
    role               Role                 @default(user)
    data_criacao       DateTime?            @default(now()) @db.Timestamptz(6)
    // ... relations
}

enum Role {
    user
    moderator
    admin
}
```

**Migration:** Criar script de migração para consolidar dados existentes:
```typescript
// migrate-roles.ts
await prisma.usuario.updateMany({
    where: { is_admin: true },
    data: { role: 'admin' }
});
```

---

## PRIORIDADE MÉDIA (Melhorias Importantes)

### 7. **Server Actions em Arquivo Único (actions.ts)**

**Problema:** Todas as actions (auth, posts, communities, chat) estão em um único arquivo de ~500+ linhas. Difícil manutenção e navegação.

**Impacto:** Qualidade de código. Onboarding de novos devs é mais lento. Merge conflicts são mais frequentes.

**Solução:** Separar por domínio:

```
src/app/actions/
├── auth.actions.ts      (login, register, logout)
├── posts.actions.ts     (createPost, deletePost, likePost, getPosts)
├── communities.actions.ts (createCommunity, join, leave)
├── chat.actions.ts      (sendMessage, deleteMessage, getMessages)
└── index.ts             (re-export tudo para conveniência)
```

**Exemplo:**
```typescript
// actions/posts.actions.ts
'use server';

import { createServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
    // ... implementação
}

export async function deletePost(postId: number) {
    // ... implementação
}
```

---

### 8. **Uso de `<img>` Nativo em Vez de `next/image`**

**Problema:** Em `PostCard.tsx`:
```tsx
{post.imagem_url && (
    <div className="cyber-image-container">
        <img src={post.imagem_url} alt={post.titulo} className="cyber-image-filter" />
    </div>
)}
```

Não há lazy loading, otimização de tamanho, ou cache de imagem.

**Impacto:** Performance. Imagens grandes carregam sem redimensionamento, aumentando LCP (Largest Contentful Paint).

**Solução:** Migrar para `next/image`:

```tsx
import Image from 'next/image';

{post.imagem_url && (
    <div className="cyber-image-container relative w-full h-48">
        <Image
            src={post.imagem_url}
            alt={post.titulo}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="cyber-image-filter object-cover"
            priority={index < 2} // LCP optimization para primeiros posts
        />
    </div>
)}
```

**Configurar `next.config.js`:**
```javascript
module.exports = {
    images: {
        remotePatterns: [{
            protocol: 'https',
            hostname: '**.supabase.co',
        }],
        formats: ['image/avif', 'image/webp'],
    },
};
```

---

### 9. **Tratamento de Erros Inconsistente**

**Problema:** Algumas actions retornam `{ error: '...' }`, outras throw error, outras console.error sem retorno. No front, alguns formulários mostram erro, outros ignoram.

**Impacto:** UX e debugging. Usuário não sabe quando operação falha. Devs têm dificuldade de rastrear bugs.

**Solução:** Padronizar padrão de erro:

```typescript
// Pattern para todas as actions
type ActionResult = {
    success?: boolean;
    error?: string;
    data?: any;
};

export async function loginAction(prevState: any, formData: FormData): Promise<ActionResult> {
    try {
        // ... lógica
        return { success: true };
    } catch (err) {
        console.error('[LoginAction]', err);
        return { error: 'Falha interna no servidor' };
    }
}
```

**No front:** Sempre checar resultado:
```tsx
const [state, action] = useActionState(loginAction, undefined);

{state?.error && <ErrorBanner message={state.error} />}
{state?.success && <SuccessBanner />}
```

---

### 10. **Indexes Ausentes no Schema Prisma**

**Problema:** O schema não define indexes explícitos para campos de busca frequente (email, nome_usuario, data_criacao).

**Impacto:** Performance de queries. Buscas por email/login tornam-se O(n) em vez de O(1).

**Solução:** Adicionar indexes no Prisma schema:

```prisma
model usuarios {
    id                 Int                  @id @default(autoincrement())
    nome_usuario       String               @map("nome_usuario")
    email              String               @unique
    // ...
    
    @@index([email])
    @@index([nome_usuario])
    @@index([role])
}

model postagens {
    id           Int           @id @default(autoincrement())
    autor_id     Int?
    data_criacao DateTime?     @default(now()) @db.Timestamptz(6)
    // ...
    
    @@index([autor_id])
    @@index([data_criacao])
}
```

**Aplicar:** `npx prisma migrate dev --name add_indexes`

---

### 11. **Limpeza de Subscriptions Realtime**

**Problema:** Em `ChatInterface.tsx`, o useEffect que setupa subscription não retorna cleanup function consistentemente em todos os paths.

**Impacto:** Performance e memória. Múltiplas subscriptions acumulam em sessões longas, causando duplicate messages e memory leak.

**Solução:** Garantir cleanup:

```tsx
useEffect(() => {
    const channel = supabase
        .channel(`chat:${canalId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'mensagens_chat',
            filter: `canal_id=eq.${canalId}`
        }, handleNewMessage)
        .subscribe();
    
    return () => {
        supabase.removeChannel(channel);
    };
}, [canalId]);
```

**Monitorar:** Adicionar log no cleanup para debugging:
```tsx
return () => {
    console.log('[Chat] Cleaning up channel', channel.id);
    supabase.removeChannel(channel);
};
```

---

## PRIORIDADE BAIXA (Refinamentos e Boas Práticas)

### 12. **Padronização de Nomenclatura (PT-BR vs EN)**

**Problema:** Schema e DB usam PT-BR (`postagens`, `usuarios`, `conteudo`, `data_criacao`), mas components usam EN (`PostCard`, `LoginForm`, `content`, `createdAt`).

**Impacto:** Qualidade de código. Mistura de idiomas causa confusão e aumenta carga cognitiva.

**Solução:** Escolher um padrão e refatorar. **Recomendação:** Manter PT-BR no DB (já consolidado) e usar EN no código TypeScript (convenção de mercado).

**Exemplo de mapping no Prisma:**
```prisma
model postagens {
    id           Int           @id @default(autoincrement())
    autor_id     Int?
    titulo       String        // manter PT
    conteudo     String        // manter PT
    imagem_url   String?       // manter EN
    data_criacao DateTime?     @default(now()) @db.Timestamptz(6)
    
    @@map("postagens") // mantém nome da tabela em PT
}
```

**No TypeScript:**
```typescript
interface Post {
    id: number;
    autorId: number | null;
    title: string;      // EN no código
    content: string;    // EN no código
    imageUrl: string | null;
    createdAt: Date;    // EN no código
}
```

**Transformação no mapeamento:**
```typescript
const posts = dbData.map(p => ({
    id: p.id,
    autorId: p.autor_id,
    title: p.titulo,
    content: p.conteudo,
    imageUrl: p.imagem_url,
    createdAt: p.data_criacao,
}));
```

---

### 13. **Falta de Aria-Labels em Botões Ícone**

**Problema:** Botões como `<button className="cyber-btn-danger"><LogOut size={20} /></button>` não têm `aria-label`.

**Impacto:** Acessibilidade. Leitores de tela não anunciam função do botão.

**Solução:** Adicionar labels descritivos:

```tsx
<button
    className="cyber-btn-danger"
    aria-label="Sair do sistema"
    title="Sair"
>
    <LogOut size={20} aria-hidden="true" />
    <span className="hidden md:inline">Sair</span>
</button>
```

**Regra:** Todo botão apenas-ícone deve ter `aria-label`. Botões com texto podem usar `title` opcional.

---

### 14. **Polyfill `globalThis.setImmediate` sem Justificativa**

**Problema:** No topo de `actions.ts`:
```typescript
if (typeof globalThis.setImmediate === 'undefined') {
    globalThis.setImmediate = (fn) => setTimeout(fn, 0);
    globalThis.clearImmediate = (id) => clearTimeout(id);
}
```

Não há explicação do porquê. Pode ser code smell de copy-paste.

**Impacto:** Qualidade de código. Polyfills sem necessidade aumentam bundle e confundem.

**Solução:** Investigar origem. Se não for necessário, remover. Next.js já polyfilla isso quando necessário.

---

### 15. **Loading States Podem Ser Melhorados**

**Problema:** Botões mostram `isPending ? 'ENVIANDO...' : 'PUBLICAR'`, mas não há indicador visual de loading (spinner, skeleton).

**Impacto:** UX. Usuário não tem feedback visual de que ação está em progresso.

**Solução:** Adicionar spinner animado:

```tsx
<button disabled={isPending} className="btn-cyber">
    {isPending ? (
        <>
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                {/* spinner SVG */}
            </svg>
            PROCESSANDO...
        </>
    ) : (
        <>
            <Lock size={16} />
            INICIAR SESSÃO
        </>
    )}
</button>
```

**Alternativa:** Usar `lucide-react` com animação CSS:
```tsx
import { Loader2 } from 'lucide-react';

{isPending && <Loader2 className="animate-spin" size={16} />}
```

---

## SUGESTÕES DE ARQUITETURA / LONGO PRAZO

### 16. **Camada de Serviços (Service Layer)**

**Atual:** Server Actions chamam Supabase diretamente.

**Sugestão:** Criar camada de serviços para encapsular lógica de negócio:

```
src/services/
├── auth.service.ts
├── posts.service.ts
├── communities.service.ts
└── chat.service.ts
```

**Benefícios:**
- Testabilidade (mock de Supabase em testes unitários)
- Reuso de lógica entre diferentes actions
- Centralização de validações e transformações

**Exemplo:**
```typescript
// services/posts.service.ts
export class PostsService {
    constructor(private supabase: SupabaseClient) {}
    
    async createPost(authorId: number, title: string, content: string, image?: File) {
        // Validações
        // Upload de imagem
        // Create no DB
        // Retorno tipado
    }
}

// actions/posts.actions.ts
import { PostsService } from '@/services/posts.service';

export async function createPost(formData: FormData) {
    const supabase = createServerClient();
    const service = new PostsService(supabase);
    // ...
}
```

---

### 17. **Feature-Based Folder Structure**

**Atual:**
```
src/
├── app/
├── components/  (50+ arquivos)
├── lib/
└── types/
```

**Sugestão:** Agrupar por feature:
```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── actions.ts
│   │   └── types.ts
│   ├── posts/
│   │   ├── components/
│   │   ├── actions.ts
│   │   └── hooks.ts
│   └── communities/
│       └── ...
├── shared/
│   ├── components/
│   └── lib/
└── app/
```

**Benefícios:**
- Colocação de arquivos relacionados juntos
- Escalabilidade (novas features não incham pastas globais)
- Onboarding mais intuitivo

---

### 18. **Rate Limiting em Auth Endpoints**

**Sugestão:** Implementar rate limiting para prevenir brute-force:

```typescript
// Usando Vercel KV ou Upstash Redis
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 tentativas por minuto
});

export async function loginAction(prevState: any, formData: FormData) {
    const ip = headers().get('x-forwarded-for') ?? 'unknown';
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
        return { error: 'Muitas tentativas. Tente em 1 minuto.' };
    }
    // ...
}
```

---

### 19. **Health Check Endpoint**

**Sugestão:** Criar endpoint `/api/health` para monitoramento:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@/lib/supabase-server';

export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        const { data: health } = await createServerClient()
            .from('usuarios').select('count').single();
        
        return NextResponse.json({
            status: 'ok',
            database: 'connected',
            supabase: 'connected',
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        return NextResponse.json(
            { status: 'error', error: err.message },
            { status: 503 }
        );
    }
}
```

**Uso:** Uptime monitors, deployment health checks, load balancers.

---

### 20. **Error Boundary Global**

**Sugestão:** Adicionar Error Boundary no root layout para capturar erros React:

```tsx
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends Component<{ children: ReactNode }> {
    state = { hasError: false };
    
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="glass-panel p-8 text-center">
                    <AlertTriangle className="mx-auto text-cyber-danger" size={48} />
                    <h2 className="text-xl font-bold mt-4">FALHA NO SISTEMA</h2>
                    <p className="text-gray-500 font-mono text-sm mt-2">
                        Recarregue a página ou tente novamente.
                    </p>
                    <button onClick={() => window.location.reload()} className="btn-cyber mt-4">
                        REINICIAR TERMINAL
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// layout.tsx
<ErrorBoundary>{children}</ErrorBoundary>
```

---

## CONCLUSÃO

O **Blog AcervoBook** demonstra competência técnica em desenvolvimento full-stack moderno. A base arquitetural é sólida, mas **requer correções críticas de segurança antes de produção**.

**Roadmap Recomendado:**

| Prioridade | Item | Sprint Sugerida |
|------------|------|-----------------|
| 🔴 ALTA | Middleware de autenticação | Sprint 1 |
| 🔴 ALTA | Validação de MIME type em uploads | Sprint 1 |
| 🔴 ALTA | Separar clientes Supabase (server/client) | Sprint 1 |
| 🔴 ALTA | Implementar RLS policies no Supabase | Sprint 1 |
| 🔴 ALTA | Validação de força de senha | Sprint 1 |
| 🔴 ALTA | Paginação de posts | Sprint 2 |
| 🟡 MÉDIA | Refatorar actions por domínio | Sprint 2 |
| 🟡 MÉDIA | Migrar para `next/image` | Sprint 2 |
| 🟡 MÉDIA | Padronizar tratamento de erros | Sprint 2 |
| 🟡 MÉDIA | Adicionar indexes no schema | Sprint 2 |
| 🟢 BAIXA | Padronização PT-BR/EN | Sprint 3 |
| 🟢 BAIXA | Aria-labels e acessibilidade | Sprint 3 |
| 🔵 LONGO | Service layer, feature folders | Refatoração futura |

**Tempo estimado para produção-ready:** 2-3 sprints (4-6 semanas) focando em segurança e performance.

---

**Próximos Passos Imediatos:**
1. Criar `middleware.ts` para proteção de rotas
2. Implementar validação de MIME type em `createPost`
3. Separar `lib/supabase-server.ts` e `lib/supabase-client.ts`
4. Configurar RLS policies no Supabase Dashboard
5. Adicionar validação de senha forte no register

**Boa sorte no deploy! 🚀**
