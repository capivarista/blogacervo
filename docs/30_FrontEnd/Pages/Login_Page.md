# Página: Login 

**Rota:** `/` (Raiz)
**Arquivos:** `src/app/page.tsx` [^1] e `src/components/LoginForm.tsx`

## Lógica de Exibição
Diferente de sistemas tradicionais, o login não fica em `/login`.
1. O arquivo `page.tsx` verifica a presença do cookie `user_id` no servidor.
2. **Se não existir:** Renderiza o componente `<LoginForm />` [^2] em modo *fullscreen* (`fixed inset-0`).
3. **Se existir:** Renderiza o Feed de postagens normalmente.

## Componente: LoginForm
**Localização:** `src/components/LoginForm.tsx`
**Tipo:** Client Component (`useActionState`)

**Estrutura Visual:**
- **Container:** `.glass-panel` centralizado com largura máxima de 400px.
- **Elementos:**
    - Ícone de Terminal com brilho neon.
    - Campos `Identificador` (Email) e `Chave de Acesso` (Senha).
    - Botão "Iniciar Sessão" com estado de carregamento ("Decifrando...").
- **Feedback de Erro:** Exibe caixa vermelha "PROIBIDO: {erro}" caso a `loginAction` falhe.

**Navegação:**
- Possui link direto para `/register` ([[Register_Page]]) ("Registrar Novo Nó").

[^1]: [[Home_Page]]
	

[^2]: [[Fluxo_Autenticação]]
	
