
## Core & Frontend
* **Framework:** Next.js (App Router)
* **Linguagem:** TypeScript
* **Estilização:** Tailwind CSS (com variáveis CSS customizadas para tema Cyberpunk)
* **Ícones:** Lucide React
* **Animações:** Framer Motion (usado para modais e transições suaves)

##  Backend & Infraestrutura (Serverless)
* **BaaS (Backend-as-a-Service):** Supabase
* **Runtime:** Edge Compatible (O código possui polyfills para rodar no Cloudflare Workers/Vercel Edge)
* **Database:** PostgreSQL (gerenciado pelo Supabase)
* **Storage:** Supabase Storage (Bucket: `post-images` público)

##  Autenticação & Segurança
* **Estratégia:** Custom Auth com Cookies HTTPOnly (não usa o Auth UI padrão do Supabase)
* **Criptografia:** `bcrypt-ts` (compatível com Edge Runtime para hashing de senhas)
* **Persistência:** Cookies de sessão com duração de 7 dias (`maxAge: 60*60*24*7`)

##  Comunicação de Dados
* **Data Fetching:** Server Actions (`use server`) para todas as mutações e buscas iniciais
* **Realtime (Chat):** Polling (Intervalo de 3s) - *Decisão temporária, ver Roadmap*
* **Uploads:** Base64 via Server Action (Upload processado no servidor antes de ir para o Bucket)