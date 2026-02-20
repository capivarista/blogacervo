
## Entradas Recentes

### Ajuste para Edge Runtime
Tive problemas com funções de tempo no ambiente Edge (Cloudflare/Vercel).
**Solução:** Adicionei um polyfill para `setImmediate` no topo do `actions.ts` para garantir compatibilidade global.

### Implementação de Auth Manual
Decidi não usar o hook padrão do Supabase no client para ter controle total sobre os cookies.
**Decisão:**
- Criei `loginAction` e `registerAction` no server-side.
- Estou usando `bcrypt-ts` para hash de senha manualmente, pois o `bcrypt` nativo do Node não roda no Edge.

### Lógica do Chat e Polling
Implementei o chat das comunidades.
**Desafio:** O Realtime do Supabase exige configuração de WebSockets que estava complexa para o MVP.
**Solução Temporária:** Usei um `setInterval` de 3 segundos no `ChatInterface.tsx` para buscar novas mensagens.
**Nota:** O "Optimistic UI" foi adicionado para o usuário sentir que a mensagem foi enviada instantaneamente.

### Design System Cyberpunk
Configurei o `globals.css` para usar variáveis CSS (`--background`, `--foreground`) e criei utilitários como `.glass-panel` e `.cyber-field` para padronizar a estética de terminal/hacker em todo o app.