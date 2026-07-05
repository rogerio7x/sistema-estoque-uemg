// backend/controllers/pecaController.js
const PecaModel = require('../models/pecaModel');

const PecaController = {
    listar: (req, res) => {
        PecaModel.listarTodas((err, pecas) => {
            if (err) {
                return res.status(500).json({ erro: 'Erro ao buscar peças' });
            }
            res.json(pecas);
        });
    },

    salvar: (req, res) => {
        const novaPeca = req.body;
        // Aqui você coloca aquelas suas validações (se nome não existir, etc)
        
        PecaModel.salvar(novaPeca, (err, id) => {
            if (err) {
                return res.status(400).json({ erro: 'Erro ao salvar peça (SKU duplicado?)' });
            }
            res.status(201).json({ mensagem: 'Peça cadastrada!', id: id });
        });
    }
};

module.exports = PecaController;