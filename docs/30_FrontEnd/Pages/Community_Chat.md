# Página: Chat da Comunidade

**Rota:** `/communities/[id]/chat`
**Componente Principal:** `src/components/ChatInterface.tsx` ([[CommunityInterface]])
**Acesso:** Via botão "Acessar Chat" na lista de comunidades (`CommunityInterface`).

## Layout (3 Colunas)
O layout ocupa a altura da tela menos o header (`calc(100vh-100px)`).

1.  **Esquerda (Canais):**
    - Lista canais da comunidade (Ex: #geral).
    - **Ação:** Dono da comunidade visualiza botão "Novo Canal".
2.  **Centro (Chat):**
    - Histórico de mensagens.
    - Input de envio fixo no rodapé.
3.  **Direita (Membros):**
    - Lista membros da comunidade.
    - Oculto em mobile (`hidden lg:flex`).
    - Destaca o Dono (Owner) com cor amarela e ícone de escudo.

## Comportamento Técnico
* **Polling:** O chat **não** usa WebSockets nativos ainda. Ele usa um `setInterval` de 3 segundos para buscar novas mensagens (`getChannelMessages`).
* **Optimistic UI:** Ao enviar uma mensagem:
    1. A mensagem aparece na hora na lista com `opacity-50`.
    2. O request é enviado ao servidor (`sendMessage`).
    3. A lista é atualizada com a resposta real do banco.
* **Permissões:**
    - **Deletar Mensagem:** Apenas o **Autor** da mensagem ou o **Dono** da comunidade podem deletar.
    - **Criar Canal:** Exclusivo para o Dono.