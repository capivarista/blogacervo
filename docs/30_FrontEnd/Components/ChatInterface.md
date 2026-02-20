**Arquivo:** `src/components/ChatInterface.tsx`
**Tipo:** Client Component

**Funcionalidades:**
- Lista canais da comunidade à esquerda.
- Área de chat ao centro.
- Lista de membros à direita (Online/Offline não implementado real, apenas lista membros).

**Lógica de Atualização:**
- Usa `setInterval` de 3000ms (3 segundos) para buscar novas mensagens (`getChannelMessages`).
- **Optimistic UI:** Ao enviar mensagem, ela aparece instantaneamente na tela antes de confirmar com o servidor.

**Sub-funções:**
- `handleSend`: Envia mensagem.
- `handleDelete`: Deleta (apenas se for dono ou autor).
- `createChannel`: Apenas dono da comunidade pode criar.