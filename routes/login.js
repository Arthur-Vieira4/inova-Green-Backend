const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const pool = require('../db');

// Limita tentativas de login pra dificultar ataques de força bruta
const limitadorLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { erro: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/login -> autentica admin (via .env) ou cliente (via tabela leads)
router.post('/', limitadorLogin, async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Preencha e-mail e senha.' });
    }

    try {
        // Primeiro, verifica se é o admin (credenciais vêm do .env, não do banco)
        if (email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase()) {
            const senhaCorreta = await bcrypt.compare(senha, process.env.ADMIN_PASSWORD_HASH || '');
            if (!senhaCorreta) {
                return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
            }

            const token = jwt.sign(
                { tipo: 'admin', email },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            return res.json({ token, tipo: 'admin', nome: 'Administrador' });
        }

        // Caso contrário, verifica se é um cliente cadastrado (tabela leads)
        const resultado = await pool.query(
            `SELECT id, nome, email, kit, senha_hash FROM leads WHERE email = $1 LIMIT 1`,
            [email]
        );

        const lead = resultado.rows[0];

        if (!lead || !lead.senha_hash) {
            return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
        }

        const senhaCorreta = await bcrypt.compare(senha, lead.senha_hash);
        if (!senhaCorreta) {
            return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
        }

        const token = jwt.sign(
            { tipo: 'cliente', leadId: lead.id, email: lead.email },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, tipo: 'cliente', nome: lead.nome, kit: lead.kit });
    } catch (erro) {
        console.error('Erro ao fazer login:', erro);
        res.status(500).json({ erro: 'Erro interno ao fazer login.' });
    }
});

module.exports = router;