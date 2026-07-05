// backend/models/pecaModel.js
const db = require('../config/db');

const PecaModel = {
    // Buscar todas as peças
    listarTodas: (callback) => {
        const sql = 'SELECT * FROM pecas';
        db.all(sql, [], (err, rows) => {
            callback(err, rows);
        });
    },

    // Inserir uma nova peça
    salvar: (novaPeca, callback) => {
        const sql = 'INSERT INTO pecas (nome, codigo_sku, quantidade, preco) VALUES (?, ?, ?, ?)';
        const params = [novaPeca.nome, novaPeca.codigo_sku, novaPeca.quantidade, novaPeca.preco];
        db.run(sql, params, function(err) {
            callback(err, this.lastID);
        });
    }
    
    // Você faria o mesmo para buscarPorId, editar e deletar...
};

module.exports = PecaModel;