
## Melhorias Técnicas (Identificadas no Código)
- [ ] **Chat Realtime:** Substituir o `setInterval` de 3s no [[ChatInterface]] por `supabase.channel` (WebSockets) para reduzir leituras no banco.
- [ ] **Upload de Imagem:** Atualmente o upload é feito convertendo para Base64 e enviando via Server Action.
    - *Melhoria:* Fazer upload direto do cliente para o Bucket para não sobrecarregar a Server Action.
- [ ] **Validação de Formulários:** Adicionar Zod para validar inputs no server-side (atualmente validação básica de string).

## Funcionalidades Faltantes
- [ ] **Página de Perfil:** `/profile` ou edição de usuário.
- [ ] **Recuperação de Senha:** Fluxo de "Esqueci minha senha".
- [ ] **Admin Dashboard:** Painel para moderação de conteúdo (embora exista a role `admin`).