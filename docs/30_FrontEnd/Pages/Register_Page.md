**Rota:** `/register`
**Arquivo:** `src/app/register/page.tsx`
**Runtime:** `edge` (Otimizado para Vercel/Cloudflare Edge).

**Estrutura Visual:**
- Layout travado (`fixed inset-0`) sem barra de rolagem.
- Largura máxima do formulário: `450px`.
- Fundo com grid animado via CSS (gradientes lineares).

**Componente Interno: `RegisterForm`**
- Usa o hook `useActionState` para gerenciar o estado do envio do formulário.
- **Campos:** Codename (nome), Email, Senha.
- **Feedback:**
    - Sucesso: Exibe ícone grande e botão para voltar ao [[Login_Page]].
    - Erro: Exibe mensagem em caixa vermelha (ex: Email duplicado).