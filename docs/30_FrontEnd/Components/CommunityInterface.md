# Componente: CommunityInterface

**Arquivo:** `src/components/CommunityInterface.tsx`
**Rota:** `/communities`

**Funcionalidades:**
- **Abas de Navegação:** Alterna entre "Meus Clãs" e "Rede Global" (Todos).
- **Busca:** Filtro local por nome ou descrição da comunidade.
- **Criação:** Botão "Plus" (+) que abre formulário para `createCommunity`.

**Cards de Comunidade:**
- Mostra nome, descrição e contagem de membros.
- **Lógica de Botões:**
    - Se já é membro: Botão "Acessar Chat" e "Sair".
    - Se não é membro: Botão "Juntar-se".

**Feedback Visual:**
- Usa `animate-in` para transições suaves ao abrir o formulário de criação.