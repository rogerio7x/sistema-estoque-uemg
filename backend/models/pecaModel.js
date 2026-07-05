// backend/models/pecaModel.js
const db = require('../config/db');

const PecaModel = {
    // 1. Buscar todas as peças
    listarTodas: (callback) => {
        const sql = 'SELECT * FROM pecas';
        db.all(sql, [], (err, rows) => {
            callback(err, rows);
        });
    },

    // 2. Inserir uma nova peça
    salvar: (novaPeca, callback) => {
        const sql = 'INSERT INTO pecas (nome, codigo_sku, quantidade, preco) VALUES (?, ?, ?, ?)';
        const params = [novaPeca.nome, novaPeca.codigo_sku, novaPeca.quantidade, novaPeca.preco];
        db.run(sql, params, function(err) {
            callback(err, this.lastID);
        });
    },

    // 3. Buscar uma única peça pelo ID
    buscarPorId: (id, callback) => {
        const sql = 'SELECT * FROM pecas WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            callback(err, row);
        });
    },

    // 4. Atualizar uma peça existente
    editar: (id, dadosPeca, callback) => {
        const sql = 'UPDATE pecas SET nome = ?, codigo_sku = ?, quantidade = ?, preco = ? WHERE id = ?';
        const params = [dadosPeca.nome, dadosPeca.codigo_sku, dadosPeca.quantidade, dadosPeca.preco, id];
        db.run(sql, params, function(err) {
            // this.changes retorna quantas linhas foram modificadas no banco
            callback(err, this.changes); 
        });
    },

    // 5. Deletar uma peça
    deletar: (id, callback) => {
        const sql = 'DELETE FROM pecas WHERE id = ?';
        db.run(sql, [id], function(err) {
            callback(err, this.changes);
        });
    }
};

module.exports = PecaModel;