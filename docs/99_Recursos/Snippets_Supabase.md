# Configuração do Supabase

**Arquivo:** `src/lib/supabase.ts`

## Inicialização do Cliente
O projeto usa o pacote padrão `@supabase/supabase-js`.

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "[https://placeholder.supabase.co](https://placeholder.supabase.co)",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
);