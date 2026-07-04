const path = require('path');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const ESTOQUE_MINIMO = 10; // abaixo disso, a peça é considerada em baixo estoque

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./database.sqlite');

// Garante que a tabela exista, já com código SKU único e datas de controle
db.run(`CREATE TABLE IF NOT EXISTS pecas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    codigo_sku TEXT NOT NULL UNIQUE,
    quantidade INTEGER NOT NULL DEFAULT 0,
    preco REAL NOT NULL DEFAULT 0,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// ---------- Helpers ----------

function validarPeca(body) {
    const erros = [];
    const nome = (body.nome || '').trim();
    const codigo_sku = (body.codigo_sku || '').trim();
    const quantidade = Number(body.quantidade);
    const preco = Number(body.preco);

    if (!nome) erros.push('Informe o nome da peça.');
    if (!codigo_sku) erros.push('Informe o código SKU.');
    if (!Number.isInteger(quantidade) || quantidade < 0) erros.push('Quantidade deve ser um número inteiro maior ou igual a zero.');
    if (isNaN(preco) || preco < 0) erros.push('Preço deve ser um número maior ou igual a zero.');

    return { erros, dados: { nome, codigo_sku, quantidade, preco } };
}

function ehErroDeSkuDuplicado(err) {
    return err && /UNIQUE constraint failed/i.test(err.message);
}

// ---------- Rotas ----------

app.get('/listar', (req, res) => {
    const busca = (req.query.busca || '').trim();
    const sql = busca
        ? `SELECT * FROM pecas WHERE nome LIKE ? OR codigo_sku LIKE ? ORDER BY nome COLLATE NOCASE`
        : `SELECT * FROM pecas ORDER BY nome COLLATE NOCASE`;
    const params = busca ? [`%${busca}%`, `%${busca}%`] : [];

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ erro: 'Não foi possível carregar as peças.' });
        res.json(rows);
    });
});

app.get('/buscar/:id', (req, res) => {
    db.get(`SELECT * FROM pecas WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ erro: 'Não foi possível buscar a peça.' });
        if (!row) return res.status(404).json({ erro: 'Peça não encontrada.' });
        res.json(row);
    });
});

app.post('/salvar', (req, res) => {
    const { erros, dados } = validarPeca(req.body);
    if (erros.length) return res.status(400).json({ erro: erros.join(' ') });

    db.run(
        `INSERT INTO pecas (nome, codigo_sku, quantidade, preco) VALUES (?, ?, ?, ?)`,
        [dados.nome, dados.codigo_sku, dados.quantidade, dados.preco],
        function (err) {
            if (err) {
                if (ehErroDeSkuDuplicado(err)) {
                    return res.status(409).json({ erro: `Já existe uma peça com o código "${dados.codigo_sku}".` });
                }
                return res.status(500).json({ erro: 'Não foi possível salvar a peça.' });
            }
            res.status(201).json({ id: this.lastID, ...dados });
        }
    );
});

app.put('/editar/:id', (req, res) => {
    const { erros, dados } = validarPeca(req.body);
    if (erros.length) return res.status(400).json({ erro: erros.join(' ') });

    db.run(
        `UPDATE pecas SET nome = ?, codigo_sku = ?, quantidade = ?, preco = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`,
        [dados.nome, dados.codigo_sku, dados.quantidade, dados.preco, req.params.id],
        function (err) {
            if (err) {
                if (ehErroDeSkuDuplicado(err)) {
                    return res.status(409).json({ erro: `Já existe uma peça com o código "${dados.codigo_sku}".` });
                }
                return res.status(500).json({ erro: 'Não foi possível atualizar a peça.' });
            }
            if (this.changes === 0) return res.status(404).json({ erro: 'Peça não encontrada.' });
            res.json({ id: Number(req.params.id), ...dados });
        }
    );
});

app.delete('/deletar/:id', (req, res) => {
    db.run(`DELETE FROM pecas WHERE id = ?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ erro: 'Não foi possível excluir a peça.' });
        if (this.changes === 0) return res.status(404).json({ erro: 'Peça não encontrada.' });
        res.json({ mensagem: 'Peça excluída com sucesso.' });
    });
});

app.get('/config', (req, res) => {
    res.json({ estoqueMinimo: ESTOQUE_MINIMO });
});

// 404 para rotas de API não encontradas
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
