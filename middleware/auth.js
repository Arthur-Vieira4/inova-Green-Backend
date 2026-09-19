const jwt = require('jsonwebtoken');

// Verifica se o pedido tem um token válido (qualquer tipo de conta)
function verificarLogin(req, res, next) {
    const cabecalho = req.headers.authorization;

    if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
        return res.status(401).json({ erro: 'É preciso estar logado para acessar isso.' });
    }

    const token = cabecalho.split(' ')[1];

    try {
        const dados = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = dados;
        next();
    } catch (erro) {
        return res.status(401).json({ erro: 'Sessão inválida ou expirada. Faça login de novo.' });
    }
}

// Além de estar logado, precisa ser admin
function verificarAdmin(req, res, next) {
    verificarLogin(req, res, () => {
        if (req.usuario.tipo !== 'admin') {
            return res.status(403).json({ erro: 'Acesso restrito ao administrador.' });
        }
        next();
    });
}

module.exports = { verificarLogin, verificarAdmin };