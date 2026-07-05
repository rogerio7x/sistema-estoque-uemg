// backend/routes/pecaRoutes.js
const express = require('express');
const router = express.Router();
const PecaController = require('../controllers/pecaController');

// Mapeando cada URL para a sua respectiva função no Controller
router.get('/listar', PecaController.listar);
router.post('/salvar', PecaController.salvar);
router.get('/buscar/:id', PecaController.buscarPorId);
router.put('/editar/:id', PecaController.editar);
router.delete('/deletar/:id', PecaController.deletar);

module.exports = router;