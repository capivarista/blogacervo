# Componente: PostCard

**Arquivo:** `src/components/PostCard.tsx`
**Uso:** Renderizado via `.map()` dentro de `page.tsx` (Feed).

**Funcionalidades:**
- **Exibição:** Mostra autor, data, título, conteúdo e imagem (se houver).
- **Interações:**
    - Botão de **Curtir** (Like) com contador.
    - Seção de **Comentários** (lista e formulário de envio).
- **Controle de Acesso (Delete):**
    - Exibe o botão de lixeira (Delete) **apenas** se:
        1. O usuário logado for o **autor** do post.
        2. OU o usuário logado for **Admin**.

**Dependências:**
- Server Actions: `likePost`, `deletePost`, `createComment`.
- Ícones: `Trash2`, `Heart`, `MessageSquare`.