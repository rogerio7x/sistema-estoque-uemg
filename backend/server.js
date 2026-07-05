// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const pecaRoutes = require('./routes/pecaRoutes'); // Importando as rotas

const app = express();
const PORT = 3000;

// Configurações
app.use(cors());
app.use(express.json());

// Servindo o Front-end (a alteração que fizemos antes)
app.use(express.static(path.join(__dirname, '../frontend')));

// Usando as rotas separadas
app.use('/', pecaRoutes);

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});