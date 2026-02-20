# Página: Home / Feed Principal

**Rota:** `/` (Raiz)
**Arquivo:** `src/app/page.tsx`
[cite_start]**Runtime:** `edge` [cite: 20]

##  Lógica de Renderização (Gatekeeper)
Esta página controla o acesso ao sistema baseada na presença do cookie `user_id`.

### Estado 1: Usuário Não Autenticado (Guest)
Se o cookie `user_id` **não** existir:
- [cite_start]Renderiza o componente `<LoginForm />` em tela cheia (`fixed inset-0`)[cite: 20].
- [cite_start]O fundo recebe uma animação de grid ("Matrix/Cyberpunk") para imersão[cite: 20].
- **Não** carrega o Header ou o Feed para economizar recursos.

### Estado 2: Usuário Autenticado (Logged In)
Se o cookie existir:
1.  [cite_start]**Busca de Dados:** Chama `getPosts()` no servidor para buscar as postagens[cite: 20].
2.  **Renderização:**
    - [cite_start]**Header:** Barra de navegação fixa no topo (`sticky`)[cite: 20].
    - [cite_start]**Feed:** Lista de `<PostCard />` iterada via `.map()`[cite: 20].
    - [cite_start]**FAB:** O botão flutuante `<CreatePostWrapper />` para criar novos posts[cite: 20].
3.  [cite_start]**Estado Vazio:** Se não houver posts, exibe um card tracejado com o ícone `Activity` indicando "Nenhum registro no log"[cite: 20].

## Dependências
- Components: [[Header]], [[PostCard]], [[CreatePostWrapper]], [[LoginForm]].
- Server Actions: `getPosts` (em `actions.ts`).


	
