# Controle de Estoque — Peças Automotivas

## 1. Como Executar a Aplicação

*   **Dependências necessárias:** Node.js instalado na máquina. O projeto utiliza as bibliotecas `express`, `sqlite3` e `cors`.
*   **Configuração do banco de dados:** O sistema utiliza o SQLite. A criação do arquivo `database.sqlite` e da tabela `pecas` é feita automaticamente pelo servidor na primeira execução. O arquivo `dump.sql` na raiz do projeto contém a estrutura da tabela e dados iniciais (opcionais) para consulta.
*   **Como executar o back-end e o front-end:**
    No terminal, dentro da pasta do projeto, instale as dependências e inicie o servidor:
    ```bash
    npm install
    npm start
    ```
*   **URLs do sistema:** O servidor Node.js já serve o front-end e a API juntos. Após iniciar, acesse no navegador: **http://localhost:3000**

---

## 2. Principais Funcionalidades

O sistema é um CRUD completo para controle de estoque, contendo:
*   Cadastro de novas peças com validação de dados (nome e SKU obrigatórios, valores não negativos).
*   Listagem de todas as peças em estoque.
*   Busca em tempo real por nome ou código (SKU).
*   Edição (atualização) dos dados de peças já cadastradas.
*   Exclusão de peças com modal de confirmação.
*   Painel (Dashboard) com indicadores de total de peças, valor total e alerta visual para itens em baixo estoque.

---

## 3. Endpoints Disponíveis (API)

Abaixo estão as rotas RESTful disponibilizadas pelo back-end:

### Listar Peças
*   **Rota:** `/listar`
*   **Método HTTP:** `GET`
*   **Finalidade:** Retorna a lista de todas as peças. Aceita o parâmetro de query `?busca=texto` para filtrar por nome ou SKU.

### Buscar Peça Específica
*   **Rota:** `/buscar/{id}`
*   **Método HTTP:** `GET`
*   **Finalidade:** Retorna os detalhes de uma peça específica baseada no seu ID.

### Cadastrar Peça
*   **Rota:** `/salvar`
*   **Método HTTP:** `POST`
*   **Finalidade:** Insere um novo registro de peça no banco de dados. Valida se o SKU já existe.
*   **Exemplo de requisição (JSON):**
    ```json
    {
      "nome": "Filtro de Óleo",
      "codigo_sku": "FO-123",
      "quantidade": 50,
      "preco": 25.50
    }
    ```

### Editar Peça
*   **Rota:** `/editar/{id}`
*   **Método HTTP:** `PUT`
*   **Finalidade:** Atualiza os dados de uma peça existente.
*   **Exemplo de requisição (JSON):**
    ```json
    {
      "nome": "Filtro de Óleo Premium",
      "codigo_sku": "FO-123",
      "quantidade": 45,
      "preco": 28.00
    }
    ```

### Excluir Peça
*   **Rota:** `/deletar/{id}`
*   **Método HTTP:** `DELETE`
*   **Finalidade:** Remove o registro de uma peça do banco de dados pelo seu ID.

### Configurações do Sistema
*   **Rota:** `/config`
*   **Método HTTP:** `GET`
*   **Finalidade:** Retorna as variáveis de configuração globais para o front-end, como o limite de alerta para "estoque baixo".

---

## 4. O que mudou em relação à versão base sugerida

### Backend (`server.js`)
- Validação dos dados antes de salvar/editar (nome e SKU obrigatórios, quantidade inteira ≥ 0, preço ≥ 0).
- SKU agora é único no banco — tentar cadastrar um código repetido retorna erro 409 com mensagem clara.
- Mensagens de erro específicas (antes retornava o erro cru do SQLite).
- O servidor agora também serve o front-end (`frontend/`), então front e back rodam juntos na mesma porta.

### Banco (`dump.sql`)
- `codigo_sku` configurado como `UNIQUE`.
- Adição das colunas `criado_em` / `atualizado_em` para rastrear mudanças.

### Frontend (`frontend/`)
- Interface toda redesenhada com identidade visual própria (tema "bancada de oficina"), sem depender do Bootstrap.
- Confirmação de exclusão em modal customizado (em vez do `confirm()` nativo do navegador).
- Notificações (toasts) de sucesso/erro não intrusivas.
- Layout totalmente responsivo (a tabela vira cartões empilhados em telas pequenas).