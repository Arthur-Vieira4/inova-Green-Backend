const express = require('express');
const cors = require('cors');
require('dotenv').config();

const cadastroRoutes = require('./routes/cadastro');
const sensoresRoutes = require('./routes/sensores');
const loginRoutes = require('./routes/login');
const pedidosRoutes = require('./routes/pedidos');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use('/api/cadastro', cadastroRoutes);
app.use('/api/sensores', sensoresRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/pedidos', pedidosRoutes);

app.get('/', (req, res) => {
    res.json({ status: 'Inova Green API rodando com sucesso.' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});