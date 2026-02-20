**Descrição:** Grupos/Clãs criados pelos usuários.

| Coluna | Tipo | Relação |
| :--- | :--- | :--- |
| `id` | int8 | PK |
| `nome` | text | Nome do Clã |
| `descricao` | text | |
| `dono_id` | int8 | FK -> [[Tabela_Usuarios]] |
| `data_criacao` | timestamp | |

**Regras:**
- Ao criar, o dono é automaticamente adicionado na tabela `membros_comunidade`.
- Ao criar, um canal `#geral` é criado automaticamente em `canais`.