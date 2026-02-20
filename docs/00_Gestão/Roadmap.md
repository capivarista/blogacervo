# Roadmap do Projeto

##  Fase 1: MVP (Concluído/Em Progresso)
- [x] Configuração do Next.js + Tailwind + Supabase.
- [x] Sistema de Login e Registro com Cookies.
- [x] CRUD de Postagens com Imagem.
- [x] Criação de Comunidades e Canais.
- [x] Interface de Chat básica (Polling).
- [x] Design Responsivo e Tema Dark.

##  Fase 2: Refatoração & Performance (Prioridade)
- [ ] **Migrar Chat para Realtime Real:** Substituir o `setInterval` por `supabase.channel().subscribe()` para reduzir leituras no banco e latência.
- [ ] **Upload Client-Side:** Mover o upload de imagem do `actions.ts` para o Frontend. Atualmente, enviar Base64 pesado para a Server Action pode estourar o limite de payload da Vercel/Edge.
- [ ] **Validação de Dados (Zod):** Adicionar schema validation no `actions.ts` para garantir que email e senhas estejam no formato correto antes de bater no banco.

##  Fase 3: Features Futuras (Backlog)
- [ ] **Perfil de Usuário:** Criar página `/profile` para editar avatar e bio (tabela `usuarios` já suporta, falta UI).
- [ ] **Moderação:** Painel para Admins verem reports e banirem usuários (campo `role: 'admin'` já existe no banco).
- [ ] **Notificações:** Avisar quando alguém responde seu comentário.
- [ ] **Busca Global:** Melhorar a busca de comunidades e posts (atualmente é filtro local).