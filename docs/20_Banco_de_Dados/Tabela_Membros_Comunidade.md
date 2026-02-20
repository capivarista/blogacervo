
**Descrição:** Tabela de junção (Pivot Table) que define quem pertence a qual comunidade.

| Coluna | Tipo | Constraint | Notas |
| :--- | :--- | :--- | :--- |
| `comunidade_id` | int4 | FK, PK | Referencia [[Tabela_Comunidades]]. `ON DELETE CASCADE`. |
| `usuario_id` | int4 | FK, PK | Referencia [[Tabela_Usuarios]]. `ON DELETE CASCADE`. |

**Chave Primária Composta:**
A PK é a combinação de `(comunidade_id, usuario_id)`, garantindo que um usuário não entre duas vezes na mesma comunidade.

**Regras de Negócio:**
- **Cascade Delete:** Se o usuário for deletado OU a comunidade for deletada, o registro aqui some automaticamente.