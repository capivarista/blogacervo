**Método:** Session Cookie (HTTPOnly)
**Arquivo Principal:** `src/app/actions.ts`

## Login (`loginAction`)
1. Recebe `email` e `password`.
2. Busca usuário na tabela `usuarios`.
3. Compara hash com `bcrypt-ts`.
4. Define cookie `user_id` (MaxAge: 7 dias).

## Registro (`registerAction`)
1. Recebe dados.
2. Gera hash da senha (`cost: 10`).
3. Insere em `usuarios` com role padrão `'user'`.
4. Retorna erro se código SQL for `23505` (Email duplicado).

## Proteção de Rotas
- **Middleware:** (Não enviado, mas idealmente deve checar o cookie).
- **Componente Page:** `page.tsx` verifica `cookies().get('user_id')`. Se nulo, renderiza o `<LoginForm />` em tela cheia.