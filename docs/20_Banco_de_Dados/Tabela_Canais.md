**Descrição:** Canais de texto dentro das comunidades (ex: #geral, #memes).

| Coluna | Tipo | Constraint | Notas |
| :--- | :--- | :--- | :--- |
| `id` | serial | PK | Auto-incremento. |
| `comunidade_id` | int4 | FK | Referencia [[Tabela_Comunidades]]. `ON DELETE CASCADE`. |
| `nome` | text | Not Null | Nome do canal (ex: "geral"). |

**Regras de Negócio:**
- **Cascade Delete:** Se a comunidade for excluída, todos os canais associados são deletados.
- **Criação Automática:** Pelo código (`actions.ts`), toda comunidade nasce com um canal "geral".