**Descrição:** Armazena credenciais e dados de perfil.

| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | int8 | PK, Auto Increment |
| `nome_usuario` | text | Exibido no chat e posts |
| `email` | text | Unique |
| `senha_hash` | text | Gerado via bcrypt |
| `role` | text | Padrão: 'user' (Suporta 'admin') |
| `data_criacao` | timestamp | |
