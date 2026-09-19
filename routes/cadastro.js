const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const pool = require('../db');
const { verificarAdmin, verificarLogin } = require('../middleware/auth');

const KITS_VALIDOS = ['basico', 'familia', 'pro'];

// Limita cada IP a 5 cadastros a cada 15 minutos, pra evitar spam no formulário
const limitadorCadastro = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { erro: 'Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/cadastro -> salva um novo lead (com senha) vindo do formulário do site
router.post('/', limitadorCadastro, async (req, res) => {
    const { nome, email, telefone, kit, senha } = req.body;

    if (!nome || !email || !telefone || !kit || !senha) {
        return res.status(400).json({ erro: 'Preencha nome, email, telefone, kit e senha.' });
    }

    if (senha.length < 6) {
        return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
    }

    if (!KITS_VALIDOS.includes(kit)) {
        return res.status(400).json({ erro: 'Kit inválido. Use: basico, familia ou pro.' });
    }

    try {
        const existente = await pool.query(
            `SELECT id FROM leads WHERE email = $1 LIMIT 1`,
            [email]
        );

        if (existente.rows.length > 0) {
            return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const resultado = await pool.query(
            `INSERT INTO leads (nome, email, telefone, kit, senha_hash)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, nome, email, telefone, kit, criado_em`,
            [nome, email, telefone, kit, senhaHash]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        console.error('Erro ao salvar lead:', erro);
        res.status(500).json({ erro: 'Erro interno ao salvar cadastro.' });
    }
});

// GET /api/cadastro -> lista todos os leads (SÓ O ADMIN pode ver)
router.get('/', verificarAdmin, async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT id, nome, email, telefone, kit, criado_em FROM leads ORDER BY criado_em DESC`
        );
        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar leads:', erro);
        res.status(500).json({ erro: 'Erro interno ao buscar cadastros.' });
    }
});

// GET /api/cadastro/me -> retorna os dados do próprio cliente logado
router.get('/me', verificarLogin, async (req, res) => {
    if (req.usuario.tipo !== 'cliente') {
        return res.status(403).json({ erro: 'Esse acesso é só para contas de cliente.' });
    }

    try {
        const resultado = await pool.query(
            `SELECT id, nome, email, telefone, kit, criado_em FROM leads WHERE id = $1`,
            [req.usuario.leadId]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Cadastro não encontrado.' });
        }

        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error('Erro ao buscar dados do cliente:', erro);
        res.status(500).json({ erro: 'Erro interno ao buscar seus dados.' });
    }
});

module.exports = router;