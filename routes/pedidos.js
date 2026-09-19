const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarLogin, verificarAdmin } = require('../middleware/auth');

const KITS_VALIDOS = ['basico', 'familia', 'pro'];

// Valida CPF pelo algoritmo oficial de dígitos verificadores (não é só formato, é matemático)
function cpfValido(cpf) {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // rejeita 111.111.111-11 etc.

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(cpf[10])) return false;

    return true;
}

// POST /api/pedidos -> cria um novo pedido (só cliente logado)
router.post('/', verificarLogin, async (req, res) => {
    if (req.usuario.tipo !== 'cliente') {
        return res.status(403).json({ erro: 'Apenas contas de cliente podem fazer pedidos.' });
    }

    const { kit, quantidade, cpf, cep, rua, numero, complemento, bairro, cidade, estado } = req.body;

    if (!kit || !cpf || !cep || !numero) {
        return res.status(400).json({ erro: 'Preencha kit, CPF, CEP e número.' });
    }

    if (!KITS_VALIDOS.includes(kit)) {
        return res.status(400).json({ erro: 'Kit inválido.' });
    }

    if (!cpfValido(cpf)) {
        return res.status(400).json({ erro: 'CPF inválido. Confira os números digitados.' });
    }

    try {
        const resultado = await pool.query(
            `INSERT INTO pedidos (lead_id, kit, quantidade, cpf, cep, rua, numero, complemento, bairro, cidade, estado)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
            [
                req.usuario.leadId, kit, quantidade || 1, cpf.replace(/\D/g, ''),
                cep, rua || null, numero, complemento || null, bairro || null, cidade || null, estado || null
            ]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        console.error('Erro ao criar pedido:', erro);
        res.status(500).json({ erro: 'Erro interno ao registrar o pedido.' });
    }
});

// GET /api/pedidos/me -> pedidos do próprio cliente logado
router.get('/me', verificarLogin, async (req, res) => {
    if (req.usuario.tipo !== 'cliente') {
        return res.status(403).json({ erro: 'Esse acesso é só para contas de cliente.' });
    }

    try {
        const resultado = await pool.query(
            `SELECT * FROM pedidos WHERE lead_id = $1 ORDER BY criado_em DESC`,
            [req.usuario.leadId]
        );
        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar pedidos:', erro);
        res.status(500).json({ erro: 'Erro interno ao buscar pedidos.' });
    }
});

// GET /api/pedidos -> todos os pedidos (só admin)
router.get('/', verificarAdmin, async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT pedidos.*, leads.nome, leads.email, leads.telefone
             FROM pedidos
             JOIN leads ON leads.id = pedidos.lead_id
             ORDER BY pedidos.criado_em DESC`
        );
        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar pedidos:', erro);
        res.status(500).json({ erro: 'Erro interno ao buscar pedidos.' });
    }
});

module.exports = router;