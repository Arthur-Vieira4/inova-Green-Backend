const express = require('express');
const router = express.Router();
const pool = require('../db');

const KITS_VALIDOS = ['basico', 'familia', 'pro'];

// POST /api/cadastro -> salva um novo lead vindo do formulário do site
router.post('/', async (req, res) => {
    const { nome, email, telefone, kit } = req.body;

    if (!nome || !email || !telefone || !kit) {
        return res.status(400).json({ erro: 'Preencha nome, email, telefone e kit.' });
    }

    if (!KITS_VALIDOS.includes(kit)) {
        return res.status(400).json({ erro: 'Kit inválido. Use: basico, familia ou pro.' });
    }

    try {
        const resultado = await pool.query(
            `INSERT INTO leads (nome, email, telefone, kit) VALUES ($1, $2, $3, $4) RETURNING *`,
            [nome, email, telefone, kit]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        console.error('Erro ao salvar lead:', erro);
        res.status(500).json({ erro: 'Erro interno ao salvar cadastro.' });
    }
});

// GET /api/cadastro -> lista todos os leads (uso administrativo)
router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT * FROM leads ORDER BY criado_em DESC`
        );
        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar leads:', erro);
        res.status(500).json({ erro: 'Erro interno ao buscar cadastros.' });
    }
});

module.exports = router;
