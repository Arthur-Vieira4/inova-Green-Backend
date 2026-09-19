// Rode este script uma vez para gerar o ADMIN_PASSWORD_HASH que vai no seu .env
// Como usar: node gerar_senha_admin.js SuaSenhaAqui

const bcrypt = require('bcryptjs');

const senha = process.argv[2];

if (!senha) {
    console.log('Uso: node gerar_senha_admin.js SuaSenhaAqui');
    process.exit(1);
}

const hash = bcrypt.hashSync(senha, 10);
console.log('\nCole isso no seu .env como ADMIN_PASSWORD_HASH:\n');
console.log(hash);
console.log('');