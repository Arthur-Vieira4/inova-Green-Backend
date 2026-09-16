const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/sensores -> o ESP32/Arduino envia uma leitura de corrente
// Corpo esperado (JSON): { "device_id": "esp32-cozinha", "corrente": 1.25, "tensao": 220, "potencia": 275 }
router.post('/', async (req, res) => {
    const { device_id, corrente, tensao, potencia } = req.body;

    if (!device_id || corrente === undefined) {
        return res.status(400).json({ erro: 'device_id e corrente são obrigatórios.' });
    }

    try {
        const resultado = await pool.query(
            `INSERT INTO leituras (device_id, corrente, tensao, potencia)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [device_id, corrente, tensao ?? null, potencia ?? null]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        console.error('Erro ao salvar leitura:', erro);
        res.status(500).json({ erro: 'Erro interno ao salvar leitura.' });
    }
});

// GET /api/sensores/:device_id -> histórico de leituras de um dispositivo (para o dashboard)
// Query opcional: ?limite=100
router.get('/:device_id', async (req, res) => {
    const { device_id } = req.params;
    const limite = parseInt(req.query.limite) || 200;

    try {
        const resultado = await pool.query(
            `SELECT * FROM leituras
             WHERE device_id = $1
             ORDER BY registrado_em DESC
             LIMIT $2`,
            [device_id, limite]
        );
        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar leituras:', erro);
        res.status(500).json({ erro: 'Erro interno ao buscar leituras.' });
    }
});

module.exports = router;
