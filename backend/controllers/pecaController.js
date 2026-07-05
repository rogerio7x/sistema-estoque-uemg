// backend/controllers/pecaController.js
const PecaModel = require('../models/pecaModel');

const PecaController = {
    // 1. Listar todas as peças
    listar: (req, res) => {
        PecaModel.listarTodas((err, pecas) => {
            if (err) {
                return res.status(500).json({ erro: 'Erro ao buscar peças' });
            }
            res.json(pecas);
        });
    },

    // 2. Salvar uma nova peça
    salvar: (req, res) => {
        const novaPeca = req.body;
        
        PecaModel.salvar(novaPeca, (err, id) => {
            if (err) {
                return res.status(400).json({ erro: 'Erro ao salvar peça (SKU duplicado?)' });
            }
            res.status(201).json({ mensagem: 'Peça cadastrada!', id: id });
        });
    },

    // 3. Buscar uma peça específica pelo ID
    buscarPorId: (req, res) => {
        const id = req.params.id;
        PecaModel.buscarPorId(id, (err, peca) => {
            if (err) {
                return res.status(500).json({ erro: 'Erro ao buscar peça no banco de dados.' });
            }
            if (!peca) {
                return res.status(404).json({ erro: 'Peça não encontrada.' });
            }
            res.json(peca);
        });
    },

    // 4. Editar uma peça existente
    editar: (req, res) => {
        const id = req.params.id;
        const dadosPeca = req.body;
        
        PecaModel.editar(id, dadosPeca, (err, alteracoes) => {
            if (err) {
                return res.status(400).json({ erro: 'Erro ao editar peça. Verifique se o SKU já existe.' });
            }
            if (alteracoes === 0) {
                return res.status(404).json({ erro: 'Peça não encontrada para edição.' });
            }
            res.json({ mensagem: 'Peça atualizada com sucesso!' });
        });
    },

    // 5. Deletar uma peça
    deletar: (req, res) => {
        const id = req.params.id;
        
        PecaModel.deletar(id, (err, alteracoes) => {
            if (err) {
                return res.status(500).json({ erro: 'Erro ao deletar peça.' });
            }
            if (alteracoes === 0) {
                return res.status(404).json({ erro: 'Peça não encontrada para exclusão.' });
            }
            res.json({ mensagem: 'Peça excluída com sucesso!' });
        });
    }
};

module.exports = PecaController;