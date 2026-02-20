**Arquivo:** `src/components/Header.tsx`
**Tipo:** Server Component

**Funcionalidades:**
- **Logout:** Possui uma *Server Action* embutida (`logoutAction`) que deleta o cookie `user_id`.
- **Navegação:** Links para Home e Comunidades.
- **Visual:**
    - Usa `backdrop-filter: blur(16px)` para efeito de vidro fosco.
    - Possui camadas de gradientes para criar a estética "Cyberpunk".
    - Exibe status "SISTEMA ONLINE" e versão "v2.4.1".

**Dependências:**
- `lucide-react`: Ícones (Terminal, Users, LogOut, Radio, Wifi).
- `next/headers`: Para manipulação de cookies no logout.