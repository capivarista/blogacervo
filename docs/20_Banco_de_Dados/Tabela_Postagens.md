**Descrição:** Feed principal de notícias/logs.

| Coluna         | Tipo      | Relação                          |
| :------------- | :-------- | :------------------------------- |
| `id`           | int8      | PK                               |
| `autor_id`     | int8      | FK -> [[Tabela_Usuarios]]        |
| `titulo`       | text      |                                  |
| `conteudo`     | text      |                                  |
| `imagem_url`   | text      | Opcional (Bucket: `post-images`) |
| `data_criacao` | timestamp |                                  |

**Interações:**
- Relaciona com `curtidas` (Many-to-Many via tabela pivô).
- Relaciona com `comentarios` (One-to-Many).